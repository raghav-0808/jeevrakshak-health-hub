import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MapPin, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Shell, PageHead, Card, Label, buttonClass, ghostButtonClass, inputClass } from "@/components/Shell";
import { AssessmentView, type AssessmentData } from "@/components/Assessment";
import { signCasePhoto } from "@/lib/reports.functions";
import { VET_NAV } from "@/lib/nav";

export const Route = createFileRoute("/_authenticated/cases")({
  head: () => ({
    meta: [
      { title: "Case queue — JeevRakshak" },
      { name: "description", content: "Incoming animal emergency reports for veterinarians to accept and treat." },
      { property: "og:title", content: "Case queue — JeevRakshak" },
      { property: "og:description", content: "Incoming animal emergency reports for veterinarians." },
    ],
  }),
  component: CasesPage,
});

const STATUSES = ["new", "accepted", "in_progress", "resolved", "closed"] as const;
type Status = (typeof STATUSES)[number];

const statusLabel: Record<Status, string> = {
  new: "NEW",
  accepted: "ACCEPTED",
  in_progress: "IN PROGRESS",
  resolved: "RESOLVED",
  closed: "CLOSED",
};

function CasesPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Status | "all">("new");
  const [openCase, setOpenCase] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const cases = useQuery({
    queryKey: ["vet-cases", filter],
    queryFn: async () => {
      let q = supabase
        .from("cases")
        .select(
          "id, tracking_code, species, description, status, urgency, ai_assessment, photo_url, address, latitude, longitude, reporter_name, reporter_phone, created_at",
        )
        .order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("status", filter);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const active = cases.data?.find((c) => c.id === openCase) ?? null;

  const photoQuery = useQuery({
    queryKey: ["vet-case-photo", active?.id],
    enabled: !!active?.photo_url,
    queryFn: async () => {
      const res = await signCasePhoto({ data: { path: active!.photo_url! } });
      return res.url;
    },
  });

  const notes = useQuery({
    queryKey: ["vet-case-notes", active?.id],
    enabled: !!active,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("case_notes")
        .select("id, note, created_at")
        .eq("case_id", active!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const setStatus = useMutation({
    mutationFn: async (status: Status) => {
      const { data: userData } = await supabase.auth.getUser();
      const update: Record<string, unknown> = { status };
      if (status === "accepted" || status === "in_progress") update['assigned_vet_id'] = userData.user?.id ?? null;
      const { error } = await supabase.from("cases").update(update).eq("id", active!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["vet-cases"] });
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Could not update this case."),
  });

  const addNote = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from("case_notes").insert({
        case_id: active!.id,
        author_id: userData.user!.id,
        note: note.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNote("");
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["vet-case-notes", active?.id] });
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Could not save that note."),
  });

  return (
    <Shell nav={VET_NAV}>
      <PageHead
        eyebrow="CLINICAL DESK"
        title="Case queue"
        lead="Reports from farmers, pet owners and the public — with photos, location and a preliminary AI read."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-xl border px-4 py-2 font-mono text-[10px] font-bold tracking-[.14em] ${
              filter === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-primary hover:bg-accent"
            }`}
          >
            {s === "all" ? "ALL" : statusLabel[s]}
          </button>
        ))}
      </div>

      {error && <p className="mb-5 rounded-xl bg-destructive/10 px-4 py-3 text-[14px] text-destructive">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-4">
          {cases.isPending && <p className="text-muted-foreground">Loading cases…</p>}
          {cases.data?.length === 0 && <p className="text-[15px] text-muted-foreground">No cases in this list.</p>}
          {cases.data?.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setOpenCase(c.id)}
              className={`w-full rounded-3xl border bg-card p-5 text-left transition ${
                openCase === c.id ? "border-primary" : "border-border hover:border-primary"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[10px] font-bold tracking-[.16em] text-gold uppercase">
                  {c.urgency ? `${c.urgency} urgency` : "UNTRIAGED"}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">{c.tracking_code}</span>
              </div>
              <p className="mt-2 text-[15px] font-bold text-primary">{c.species}</p>
              <p className="mt-1 line-clamp-2 text-[14px] text-muted-foreground">{c.description}</p>
              <p className="mt-3 font-mono text-[10px] tracking-[.14em] text-muted-foreground">
                {statusLabel[c.status as Status] ?? c.status}
              </p>
            </button>
          ))}
        </div>

        <div>
          {active ? (
            <Card className="space-y-6">
              <div>
                <h2 className="font-editorial text-[30px] font-bold tracking-[-.03em] text-primary">
                  {active.species} · {active.tracking_code}
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-foreground">{active.description}</p>
                <div className="mt-3 space-y-1 text-[14px] text-muted-foreground">
                  {active.reporter_name && <p>Reported by {active.reporter_name}</p>}
                  {active.reporter_phone && (
                    <p className="inline-flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" />
                      <a href={`tel:${active.reporter_phone}`} className="underline">
                        {active.reporter_phone}
                      </a>
                    </p>
                  )}
                  {active.address && <p>{active.address}</p>}
                  {active.latitude != null && active.longitude != null && (
                    <a
                      className="inline-flex items-center gap-2 text-primary underline"
                      href={`https://www.google.com/maps?q=${active.latitude},${active.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      Open location on map
                    </a>
                  )}
                </div>
              </div>

              {photoQuery.data && (
                <img src={photoQuery.data} alt="Reported animal" className="max-h-80 w-full rounded-2xl border border-border object-cover" />
              )}

              <div>
                <Label>UPDATE STATUS</Label>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={setStatus.isPending || active.status === s}
                      onClick={() => setStatus.mutate(s)}
                      className={active.status === s ? buttonClass : ghostButtonClass}
                    >
                      {statusLabel[s]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>ADD A CLINICAL NOTE</Label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className={inputClass} />
                <button
                  type="button"
                  disabled={addNote.isPending || note.trim().length < 3}
                  onClick={() => addNote.mutate()}
                  className={`${buttonClass} mt-3`}
                >
                  {addNote.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  SAVE NOTE
                </button>
                <ul className="mt-4 space-y-3">
                  {notes.data?.map((n) => (
                    <li key={n.id} className="rounded-2xl border border-border bg-background p-4 text-[14px] text-foreground">
                      {n.note}
                    </li>
                  ))}
                </ul>
              </div>

              {active.ai_assessment && (
                <div className="border-t border-border pt-6">
                  <AssessmentView data={active.ai_assessment as unknown as AssessmentData} />
                </div>
              )}
            </Card>
          ) : (
            <Card>
              <p className="text-[15px] text-muted-foreground">Select a case to see the full report.</p>
            </Card>
          )}
        </div>
      </div>
    </Shell>
  );
}
