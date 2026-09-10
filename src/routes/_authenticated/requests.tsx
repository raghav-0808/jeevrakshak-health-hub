import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2, MapPin, Siren } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Shell, PageHead, Card, Label, buttonClass, ghostButtonClass, inputClass } from "@/components/Shell";
import { AssessmentView, type AssessmentData } from "@/components/Assessment";
import { fileToCompressedDataUrl } from "@/lib/media";
import { signCasePhoto, submitOwnerReport } from "@/lib/reports.functions";
import { OWNER_NAV } from "@/lib/nav";

export const Route = createFileRoute("/_authenticated/requests")({
  head: () => ({
    meta: [
      { title: "My requests — JeevRakshak" },
      { name: "description", content: "Emergency help requests you have raised and their current status." },
      { property: "og:title", content: "My requests — JeevRakshak" },
      { property: "og:description", content: "Track the veterinary help requests you have raised." },
    ],
  }),
  component: RequestsPage,
});

const SPECIES = ["Cow", "Buffalo", "Goat", "Sheep", "Dog", "Cat", "Bird", "Horse", "Other"];

const statusLabel: Record<string, string> = {
  new: "WAITING FOR A VET",
  accepted: "VET ACCEPTED",
  in_progress: "BEING TREATED",
  resolved: "RESOLVED",
  closed: "CLOSED",
};

function RequestsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [species, setSpecies] = useState("Cow");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openCase, setOpenCase] = useState<string | null>(null);

  const cases = useQuery({
    queryKey: ["my-cases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("id, tracking_code, species, description, status, urgency, ai_assessment, photo_url, address, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const notes = useQuery({
    queryKey: ["case-notes", openCase],
    enabled: !!openCase,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("case_notes")
        .select("id, note, created_at")
        .eq("case_id", openCase!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const photoQuery = useQuery({
    queryKey: ["case-photo", openCase],
    enabled: !!openCase,
    queryFn: async () => {
      const path = cases.data?.find((c) => c.id === openCase)?.photo_url;
      if (!path) return null;
      const res = await signCasePhoto({ data: { path } });
      return res.url;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (description.trim().length < 10) throw new Error("Please describe what is wrong in more detail.");
      return submitOwnerReport({
        data: {
          species,
          description: description.trim(),
          address: address.trim() || null,
          latitude: coords?.lat ?? null,
          longitude: coords?.lng ?? null,
          imageDataUrl: photo,
        },
      });
    },
    onSuccess: () => {
      setOpen(false);
      setDescription("");
      setPhoto(null);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["my-cases"] });
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Could not send that request."),
  });

  function useMyLocation() {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setError("Location permission was refused. Please type the place instead."),
    );
  }

  const active = cases.data?.find((c) => c.id === openCase) ?? null;

  return (
    <Shell nav={OWNER_NAV}>
      <PageHead
        eyebrow="EMERGENCY ASSISTANCE"
        title="My requests"
        lead="Raise a request and a veterinarian on JeevRakshak sees it with your photo, location and the AI assessment."
      />

      <button type="button" onClick={() => setOpen((v) => !v)} className={buttonClass}>
        <Siren className="h-4 w-4" />
        {open ? "CLOSE" : "REQUEST HELP NOW"}
      </button>

      {open && (
        <Card className="mt-6 space-y-5">
          <div>
            <Label>ANIMAL</Label>
            <div className="flex flex-wrap gap-2">
              {SPECIES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpecies(s)}
                  className={`rounded-xl border px-4 py-2 text-[14px] ${
                    species === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-accent"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>WHAT IS WRONG?</Label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className={inputClass} />
          </div>
          <div>
            <Label>PHOTO</Label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-background px-4 py-3 text-[14px] text-muted-foreground hover:bg-accent">
              <Camera className="h-5 w-5 text-primary" />
              {photo ? "Photo added" : "Take or choose a photo"}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) setPhoto(await fileToCompressedDataUrl(file));
                }}
              />
            </label>
          </div>
          <div>
            <Label>WHERE</Label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} placeholder="Village, landmark" />
            <button type="button" onClick={useMyLocation} className={`${ghostButtonClass} mt-3`}>
              <MapPin className="h-3.5 w-3.5" />
              {coords ? "LOCATION ADDED" : "USE MY LOCATION"}
            </button>
          </div>
          {error && <p className="rounded-xl bg-destructive/10 px-4 py-3 text-[14px] text-destructive">{error}</p>}
          <button type="button" onClick={() => create.mutate()} disabled={create.isPending} className={buttonClass}>
            {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {create.isPending ? "SENDING & ASSESSING…" : "SEND REQUEST"}
          </button>
        </Card>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          {cases.isPending && <p className="text-muted-foreground">Loading your requests…</p>}
          {cases.data?.length === 0 && (
            <p className="text-[15px] text-muted-foreground">You have not raised any requests yet.</p>
          )}
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
                <span className="font-mono text-[10px] font-bold tracking-[.16em] text-gold">
                  {statusLabel[c.status] ?? c.status}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">{c.tracking_code}</span>
              </div>
              <p className="mt-2 text-[15px] font-bold text-primary">{c.species}</p>
              <p className="mt-1 line-clamp-2 text-[14px] text-muted-foreground">{c.description}</p>
            </button>
          ))}
        </div>

        <div>
          {active ? (
            <Card>
              <div className="font-mono text-[10px] font-bold tracking-[.16em] text-gold">
                {statusLabel[active.status] ?? active.status}
              </div>
              <h2 className="mt-2 font-editorial text-[28px] font-bold tracking-[-.03em] text-primary">
                {active.species} · {active.tracking_code}
              </h2>
              <p className="mt-2 text-[15px] text-foreground">{active.description}</p>
              {active.address && <p className="mt-1 text-[14px] text-muted-foreground">{active.address}</p>}
              {photoQuery.data && (
                <img src={photoQuery.data} alt="Reported animal" className="mt-5 max-h-72 w-full rounded-2xl border border-border object-cover" />
              )}

              {notes.data && notes.data.length > 0 && (
                <div className="mt-6 border-t border-border pt-6">
                  <h3 className="font-editorial text-[22px] font-bold tracking-[-.03em] text-primary">Vet notes</h3>
                  <ul className="mt-3 space-y-3">
                    {notes.data.map((n) => (
                      <li key={n.id} className="rounded-2xl border border-border bg-background p-4 text-[14px] text-foreground">
                        {n.note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {active.ai_assessment && (
                <div className="mt-6 border-t border-border pt-6">
                  <AssessmentView data={active.ai_assessment as unknown as AssessmentData} />
                </div>
              )}
            </Card>
          ) : (
            <Card>
              <p className="text-[15px] text-muted-foreground">Select a request to see its assessment and vet notes.</p>
            </Card>
          )}
        </div>
      </div>
    </Shell>
  );
}
