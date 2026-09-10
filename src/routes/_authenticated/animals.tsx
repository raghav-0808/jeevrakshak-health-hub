import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2, PawPrint, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Shell, PageHead, Card, Label, buttonClass, ghostButtonClass, inputClass } from "@/components/Shell";
import { fileToCompressedDataUrl, dataUrlToBlob } from "@/lib/media";
import { OWNER_NAV } from "@/lib/nav";

export const Route = createFileRoute("/_authenticated/animals")({
  head: () => ({
    meta: [
      { title: "My animals — JeevRakshak" },
      { name: "description", content: "Every animal you care for, with photos, breed, age and health notes." },
      { property: "og:title", content: "My animals — JeevRakshak" },
      { property: "og:description", content: "Your animals and their health records in one place." },
    ],
  }),
  component: AnimalsPage,
});

const SPECIES = ["Cow", "Buffalo", "Goat", "Sheep", "Dog", "Cat", "Bird", "Horse", "Other"];

function AnimalsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", species: "Cow", breed: "", sex: "", age: "", notes: "" });
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const animals = useQuery({
    queryKey: ["animals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("animals")
        .select("id, name, species, breed, age_years, photo_url")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const withUrls = await Promise.all(
        (data ?? []).map(async (a) => {
          if (!a.photo_url) return { ...a, url: null as string | null };
          const { data: signed } = await supabase.storage
            .from("animal-photos")
            .createSignedUrl(a.photo_url, 3600);
          return { ...a, url: signed?.signedUrl ?? null };
        }),
      );
      return withUrls;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("You are not signed in.");

      let path: string | null = null;
      if (photo) {
        path = `${uid}/animals/${crypto.randomUUID()}.jpg`;
        const { error: upErr } = await supabase.storage
          .from("animal-photos")
          .upload(path, dataUrlToBlob(photo), { contentType: "image/jpeg" });
        if (upErr) throw new Error(`Photo upload failed: ${upErr.message}`);
      }

      const { error } = await supabase.from("animals").insert({
        owner_id: uid,
        name: form.name.trim(),
        species: form.species,
        breed: form.breed.trim() || null,
        sex: form.sex.trim() || null,
        age_years: form.age ? Number(form.age) : null,
        notes: form.notes.trim() || null,
        photo_url: path,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setOpen(false);
      setForm({ name: "", species: "Cow", breed: "", sex: "", age: "", notes: "" });
      setPhoto(null);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["animals"] });
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Could not save this animal."),
  });

  return (
    <Shell nav={OWNER_NAV}>
      <PageHead
        eyebrow="OWNER WORKSPACE"
        title="My animals"
        lead="Add each animal once. Vaccinations, treatments and past reports then stay attached to it."
      />

      <button type="button" onClick={() => setOpen((v) => !v)} className={buttonClass}>
        <Plus className="h-4 w-4" />
        {open ? "CLOSE" : "ADD AN ANIMAL"}
      </button>

      {open && (
        <Card className="mt-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>NAME</Label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
                placeholder="Lakshmi"
              />
            </div>
            <div>
              <Label>ANIMAL</Label>
              <select
                value={form.species}
                onChange={(e) => setForm({ ...form, species: e.target.value })}
                className={inputClass}
              >
                {SPECIES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>BREED</Label>
              <input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} className={inputClass} />
            </div>
            <div>
              <Label>SEX</Label>
              <input value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })} className={inputClass} placeholder="Female" />
            </div>
            <div>
              <Label>AGE (YEARS)</Label>
              <input
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                className={inputClass}
                inputMode="decimal"
              />
            </div>
            <div>
              <Label>PHOTO</Label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-background px-4 py-3 text-[14px] text-muted-foreground hover:bg-accent">
                <Camera className="h-5 w-5 text-primary" />
                {photo ? "Photo added" : "Choose a photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) setPhoto(await fileToCompressedDataUrl(file));
                  }}
                />
              </label>
            </div>
            <div className="sm:col-span-2">
              <Label>NOTES</Label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className={inputClass}
              />
            </div>
          </div>
          {error && <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-[14px] text-destructive">{error}</p>}
          <button
            type="button"
            disabled={create.isPending || !form.name.trim()}
            onClick={() => create.mutate()}
            className={`${buttonClass} mt-6`}
          >
            {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            SAVE ANIMAL
          </button>
        </Card>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {animals.isPending && <p className="text-muted-foreground">Loading your animals…</p>}
        {animals.data?.length === 0 && (
          <p className="text-[15px] text-muted-foreground">No animals yet. Add your first one above.</p>
        )}
        {animals.data?.map((a) => (
          <Link
            key={a.id}
            to="/animals/$animalId"
            params={{ animalId: a.id }}
            className="rounded-3xl border border-border bg-card p-5 transition hover:border-primary"
          >
            {a.url ? (
              <img src={a.url} alt={a.name} className="mb-4 h-40 w-full rounded-2xl object-cover" />
            ) : (
              <div className="mb-4 flex h-40 w-full items-center justify-center rounded-2xl bg-accent">
                <PawPrint className="h-8 w-8 text-primary" />
              </div>
            )}
            <h2 className="font-editorial text-[24px] font-bold tracking-[-.03em] text-primary">{a.name}</h2>
            <p className="mt-1 text-[14px] text-muted-foreground">
              {[a.species, a.breed, a.age_years ? `${a.age_years} yrs` : null].filter(Boolean).join(" · ")}
            </p>
            <span className={`${ghostButtonClass} mt-4`}>OPEN RECORDS</span>
          </Link>
        ))}
      </div>
    </Shell>
  );
}
