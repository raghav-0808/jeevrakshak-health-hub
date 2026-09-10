import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Camera, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Shell, PageHead, Card, Label, buttonClass, inputClass } from "@/components/Shell";
import { AssessmentView, type AssessmentData } from "@/components/Assessment";
import { fileToCompressedDataUrl } from "@/lib/media";
import { assessAnimalHealth } from "@/lib/reports.functions";
import { OWNER_NAV } from "@/lib/nav";

export const Route = createFileRoute("/_authenticated/assistant")({
  head: () => ({
    meta: [
      { title: "AI health assistant — JeevRakshak" },
      {
        name: "description",
        content: "Describe symptoms and share a photo to get a preliminary veterinary assessment for your animal.",
      },
      { property: "og:title", content: "AI health assistant — JeevRakshak" },
      { property: "og:description", content: "Preliminary AI triage for your animal, from a photo and symptoms." },
    ],
  }),
  component: AssistantPage,
});

function AssistantPage() {
  const [animalId, setAnimalId] = useState("");
  const [species, setSpecies] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AssessmentData | null>(null);

  const animals = useQuery({
    queryKey: ["animals-brief"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("animals")
        .select("id, name, species, breed, age_years, notes")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function run() {
    setError(null);
    if (description.trim().length < 10) {
      setError("Please describe the symptoms in a little more detail.");
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const chosen = animals.data?.find((a) => a.id === animalId);
      let extra: string | null = null;
      if (chosen) {
        const [{ data: vacs }, { data: recs }] = await Promise.all([
          supabase.from("vaccinations").select("vaccine, given_on, next_due_on").eq("animal_id", chosen.id).limit(10),
          supabase.from("medical_records").select("record_date, title, diagnosis, treatment").eq("animal_id", chosen.id).limit(10),
        ]);
        extra = [
          `Animal: ${chosen.name}, ${chosen.species}${chosen.breed ? `, ${chosen.breed}` : ""}${
            chosen.age_years ? `, ${chosen.age_years} years old` : ""
          }`,
          chosen.notes ? `Owner notes: ${chosen.notes}` : "",
          vacs?.length ? `Vaccinations: ${vacs.map((v) => `${v.vaccine} on ${v.given_on}`).join("; ")}` : "No vaccinations recorded.",
          recs?.length
            ? `Past treatments: ${recs.map((r) => `${r.record_date} ${r.title} ${r.diagnosis ?? ""} ${r.treatment ?? ""}`).join("; ")}`
            : "No past treatments recorded.",
        ]
          .filter(Boolean)
          .join("\n");
      }

      const res = await assessAnimalHealth({
        data: {
          species: chosen?.species ?? species ?? null,
          description: description.trim(),
          extraContext: extra,
          imageDataUrl: photo,
        },
      });
      setResult(res as AssessmentData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The assistant could not answer right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell nav={OWNER_NAV}>
      <PageHead
        eyebrow="AI HEALTH ASSISTANT"
        title="What is wrong with your animal?"
        lead="Add a photo and describe what you are seeing. The assistant reads your animal's own records too."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="space-y-5">
            <div>
              <Label>WHICH ANIMAL?</Label>
              <select value={animalId} onChange={(e) => setAnimalId(e.target.value)} className={inputClass}>
                <option value="">Not one of my saved animals</option>
                {animals.data?.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} — {a.species}
                  </option>
                ))}
              </select>
            </div>

            {!animalId && (
              <div>
                <Label>ANIMAL TYPE</Label>
                <input
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  className={inputClass}
                  placeholder="Cow, goat, dog…"
                />
              </div>
            )}

            <div>
              <Label>SYMPTOMS</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className={inputClass}
                placeholder="Not eating since two days, swollen udder, limping on the left hind leg…"
              />
            </div>

            <div>
              <Label>PHOTO (OPTIONAL)</Label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-background px-4 py-3 text-[14px] text-muted-foreground hover:bg-accent">
                <Camera className="h-5 w-5 text-primary" />
                {photo ? "Photo added — tap to change" : "Take or choose a photo"}
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
              {photo && <img src={photo} alt="Selected animal" className="mt-3 max-h-56 rounded-2xl border border-border object-cover" />}
            </div>

            {error && <p className="rounded-xl bg-destructive/10 px-4 py-3 text-[14px] text-destructive">{error}</p>}

            <button type="button" onClick={run} disabled={busy} className={buttonClass}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {busy ? "THINKING…" : "GET ASSESSMENT"}
            </button>
          </div>
        </Card>

        <Card>
          {result ? (
            <AssessmentView data={result} />
          ) : (
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              The assessment appears here. The more you describe — how long, what changed, appetite, temperature,
              wounds — the more specific the answer.
            </p>
          )}
        </Card>
      </div>
    </Shell>
  );
}
