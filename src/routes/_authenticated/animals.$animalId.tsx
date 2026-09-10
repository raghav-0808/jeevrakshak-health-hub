import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, PawPrint, Plus, Syringe, Stethoscope } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Shell, PageHead, Card, Label, buttonClass, inputClass } from "@/components/Shell";
import { OWNER_NAV } from "@/lib/nav";

export const Route = createFileRoute("/_authenticated/animals/$animalId")({
  head: () => ({
    meta: [
      { title: "Animal records — JeevRakshak" },
      { name: "description", content: "Vaccinations and medical history for one animal." },
      { property: "og:title", content: "Animal records — JeevRakshak" },
      { property: "og:description", content: "Vaccinations and medical history for one animal." },
    ],
  }),
  component: AnimalDetail,
});

function AnimalDetail() {
  const { animalId } = Route.useParams();
  const queryClient = useQueryClient();
  const [vacOpen, setVacOpen] = useState(false);
  const [recOpen, setRecOpen] = useState(false);
  const [vac, setVac] = useState({ vaccine: "", given_on: "", next_due_on: "", notes: "" });
  const [rec, setRec] = useState({ record_date: "", title: "", diagnosis: "", treatment: "", vet_name: "", notes: "" });
  const [error, setError] = useState<string | null>(null);

  const animal = useQuery({
    queryKey: ["animal", animalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("animals")
        .select("id, owner_id, name, species, breed, sex, age_years, notes, photo_url")
        .eq("id", animalId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      let url: string | null = null;
      if (data.photo_url) {
        const { data: signed } = await supabase.storage.from("animal-photos").createSignedUrl(data.photo_url, 3600);
        url = signed?.signedUrl ?? null;
      }
      return { ...data, url };
    },
  });

  const vaccinations = useQuery({
    queryKey: ["vaccinations", animalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vaccinations")
        .select("id, vaccine, given_on, next_due_on, notes")
        .eq("animal_id", animalId)
        .order("given_on", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const records = useQuery({
    queryKey: ["records", animalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medical_records")
        .select("id, record_date, title, diagnosis, treatment, vet_name, notes")
        .eq("animal_id", animalId)
        .order("record_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const addVac = useMutation({
    mutationFn: async () => {
      const owner = animal.data?.owner_id;
      if (!owner) throw new Error("Animal not loaded.");
      const { error } = await supabase.from("vaccinations").insert({
        animal_id: animalId,
        owner_id: owner,
        vaccine: vac.vaccine.trim(),
        given_on: vac.given_on,
        next_due_on: vac.next_due_on || null,
        notes: vac.notes.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setVac({ vaccine: "", given_on: "", next_due_on: "", notes: "" });
      setVacOpen(false);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["vaccinations", animalId] });
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Could not save that vaccination."),
  });

  const addRec = useMutation({
    mutationFn: async () => {
      const owner = animal.data?.owner_id;
      if (!owner) throw new Error("Animal not loaded.");
      const { error } = await supabase.from("medical_records").insert({
        animal_id: animalId,
        owner_id: owner,
        record_date: rec.record_date,
        title: rec.title.trim(),
        diagnosis: rec.diagnosis.trim() || null,
        treatment: rec.treatment.trim() || null,
        vet_name: rec.vet_name.trim() || null,
        notes: rec.notes.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setRec({ record_date: "", title: "", diagnosis: "", treatment: "", vet_name: "", notes: "" });
      setRecOpen(false);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["records", animalId] });
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Could not save that record."),
  });

  if (animal.isPending) {
    return (
      <Shell nav={OWNER_NAV}>
        <p className="text-muted-foreground">Loading…</p>
      </Shell>
    );
  }

  if (!animal.data) {
    return (
      <Shell nav={OWNER_NAV}>
        <PageHead eyebrow="NOT FOUND" title="That animal isn't here" lead="It may have been removed." />
        <Link to="/animals" className={buttonClass}>
          BACK TO MY ANIMALS
        </Link>
      </Shell>
    );
  }

  const a = animal.data;

  return (
    <Shell nav={OWNER_NAV}>
      <Link to="/animals" className="mb-6 inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-[.14em] text-primary">
        <ArrowLeft className="h-4 w-4" />
        ALL ANIMALS
      </Link>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          {a.url ? (
            <img src={a.url} alt={a.name} className="mb-5 h-52 w-full rounded-2xl object-cover" />
          ) : (
            <div className="mb-5 flex h-52 w-full items-center justify-center rounded-2xl bg-accent">
              <PawPrint className="h-9 w-9 text-primary" />
            </div>
          )}
          <h1 className="font-editorial text-4xl font-bold tracking-[-.035em] text-primary">{a.name}</h1>
          <p className="mt-2 text-[14px] text-muted-foreground">
            {[a.species, a.breed, a.sex, a.age_years ? `${a.age_years} yrs` : null].filter(Boolean).join(" · ")}
          </p>
          {a.notes && <p className="mt-4 text-[14px] leading-relaxed text-foreground">{a.notes}</p>}
        </Card>

        <div className="space-y-6">
          {error && <p className="rounded-xl bg-destructive/10 px-4 py-3 text-[14px] text-destructive">{error}</p>}

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="inline-flex items-center gap-2 font-editorial text-[26px] font-bold tracking-[-.03em] text-primary">
                <Syringe className="h-5 w-5" />
                Vaccinations
              </h2>
              <button type="button" onClick={() => setVacOpen((v) => !v)} className={buttonClass}>
                <Plus className="h-4 w-4" />
                {vacOpen ? "CLOSE" : "ADD"}
              </button>
            </div>

            {vacOpen && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>VACCINE</Label>
                  <input value={vac.vaccine} onChange={(e) => setVac({ ...vac, vaccine: e.target.value })} className={inputClass} placeholder="FMD" />
                </div>
                <div>
                  <Label>GIVEN ON</Label>
                  <input type="date" value={vac.given_on} onChange={(e) => setVac({ ...vac, given_on: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <Label>NEXT DUE</Label>
                  <input type="date" value={vac.next_due_on} onChange={(e) => setVac({ ...vac, next_due_on: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <Label>NOTES</Label>
                  <input value={vac.notes} onChange={(e) => setVac({ ...vac, notes: e.target.value })} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    disabled={addVac.isPending || !vac.vaccine.trim() || !vac.given_on}
                    onClick={() => addVac.mutate()}
                    className={buttonClass}
                  >
                    {addVac.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    SAVE VACCINATION
                  </button>
                </div>
              </div>
            )}

            <ul className="mt-5 space-y-3">
              {vaccinations.data?.length === 0 && (
                <li className="text-[14px] text-muted-foreground">No vaccinations recorded yet.</li>
              )}
              {vaccinations.data?.map((v) => (
                <li key={v.id} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-[15px] font-bold text-primary">{v.vaccine}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">given {v.given_on}</span>
                  </div>
                  {v.next_due_on && (
                    <p className="mt-1 font-mono text-[11px] tracking-[.1em] text-gold">NEXT DUE {v.next_due_on}</p>
                  )}
                  {v.notes && <p className="mt-2 text-[14px] text-muted-foreground">{v.notes}</p>}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="inline-flex items-center gap-2 font-editorial text-[26px] font-bold tracking-[-.03em] text-primary">
                <Stethoscope className="h-5 w-5" />
                Medical records
              </h2>
              <button type="button" onClick={() => setRecOpen((v) => !v)} className={buttonClass}>
                <Plus className="h-4 w-4" />
                {recOpen ? "CLOSE" : "ADD"}
              </button>
            </div>

            {recOpen && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>DATE</Label>
                  <input type="date" value={rec.record_date} onChange={(e) => setRec({ ...rec, record_date: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <Label>TITLE</Label>
                  <input value={rec.title} onChange={(e) => setRec({ ...rec, title: e.target.value })} className={inputClass} placeholder="Fever and loss of appetite" />
                </div>
                <div>
                  <Label>DIAGNOSIS</Label>
                  <input value={rec.diagnosis} onChange={(e) => setRec({ ...rec, diagnosis: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <Label>TREATMENT</Label>
                  <input value={rec.treatment} onChange={(e) => setRec({ ...rec, treatment: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <Label>VETERINARIAN</Label>
                  <input value={rec.vet_name} onChange={(e) => setRec({ ...rec, vet_name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <Label>NOTES</Label>
                  <input value={rec.notes} onChange={(e) => setRec({ ...rec, notes: e.target.value })} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    disabled={addRec.isPending || !rec.title.trim() || !rec.record_date}
                    onClick={() => addRec.mutate()}
                    className={buttonClass}
                  >
                    {addRec.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    SAVE RECORD
                  </button>
                </div>
              </div>
            )}

            <ul className="mt-5 space-y-3">
              {records.data?.length === 0 && (
                <li className="text-[14px] text-muted-foreground">No treatments recorded yet.</li>
              )}
              {records.data?.map((r) => (
                <li key={r.id} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-[15px] font-bold text-primary">{r.title}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">{r.record_date}</span>
                  </div>
                  {r.diagnosis && <p className="mt-1.5 text-[14px] text-foreground">Diagnosis: {r.diagnosis}</p>}
                  {r.treatment && <p className="text-[14px] text-foreground">Treatment: {r.treatment}</p>}
                  {r.vet_name && <p className="mt-1 text-[13px] text-muted-foreground">Seen by {r.vet_name}</p>}
                  {r.notes && <p className="mt-2 text-[14px] text-muted-foreground">{r.notes}</p>}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
