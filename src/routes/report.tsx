import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Camera, Loader2, MapPin, Search } from "lucide-react";
import { Logo } from "@/components/Brand";
import { AssessmentView, type AssessmentData } from "@/components/Assessment";
import { Card, Label, buttonClass, ghostButtonClass, inputClass } from "@/components/Shell";
import { fileToCompressedDataUrl } from "@/lib/media";
import { getCaseByCode, submitGuestReport } from "@/lib/reports.functions";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report an injured animal — JeevRakshak" },
      {
        name: "description",
        content:
          "Report an injured or sick animal with a photo, description and location. No account needed — you get an instant AI assessment and a tracking code.",
      },
      { property: "og:title", content: "Report an injured animal — JeevRakshak" },
      {
        property: "og:description",
        content: "Send a photo and location; a veterinarian sees the case and you get a tracking code.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportPage,
});

const SPECIES = ["Cow", "Buffalo", "Goat", "Sheep", "Dog", "Cat", "Bird", "Horse", "Other"];

type Result = {
  trackingCode: string;
  assessment: AssessmentData | null;
  assessmentError: string | null;
  photoUrl: string | null;
};

function ReportPage() {
  const [species, setSpecies] = useState("Dog");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const [lookupCode, setLookupCode] = useState("");
  const [lookup, setLookup] = useState<null | Awaited<ReturnType<typeof getCaseByCode>>>(null);
  const [lookupMsg, setLookupMsg] = useState<string | null>(null);

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      setPhoto(await fileToCompressedDataUrl(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read that photo.");
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Your device did not share a location. Please type the place instead.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setError("Location permission was refused. Please type the place instead."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (description.trim().length < 10) {
      setError("Please describe what is wrong in a little more detail.");
      return;
    }
    setBusy(true);
    try {
      const res = await submitGuestReport({
        data: {
          species,
          description: description.trim(),
          reporterName: name.trim() || null,
          reporterPhone: phone.trim() || null,
          address: address.trim() || null,
          latitude: coords?.lat ?? null,
          longitude: coords?.lng ?? null,
          imageDataUrl: photo,
        },
      });
      setResult(res as Result);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function runLookup(e: React.FormEvent) {
    e.preventDefault();
    setLookupMsg(null);
    setLookup(null);
    try {
      const res = await getCaseByCode({ data: { code: lookupCode } });
      if (!res) setLookupMsg("No report found with that code.");
      else setLookup(res);
    } catch {
      setLookupMsg("Could not look that up right now.");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-5 py-5 sm:px-10">
        <Logo />
        <Link to="/" className="inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-[.14em] text-primary">
          <ArrowLeft className="h-4 w-4" />
          BACK
        </Link>
      </header>

      <main className="paper-grid min-h-[calc(100vh-84px)] border-t border-border px-5 py-10 sm:px-10">
        <div className="mx-auto max-w-3xl space-y-8">
          {result ? (
            <Card>
              <div className="font-mono text-[10px] font-bold tracking-[.18em] text-gold">REPORT RECEIVED</div>
              <h1 className="mt-3 font-editorial text-4xl font-bold tracking-[-.035em] text-primary">
                Your tracking code is {result.trackingCode}
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                Save this code. A veterinarian on JeevRakshak can now see this case, and you can check its
                status below at any time.
              </p>
              {result.photoUrl && (
                <img
                  src={result.photoUrl}
                  alt="The animal you reported"
                  className="mt-6 max-h-80 w-full rounded-2xl border border-border object-cover"
                />
              )}
              <div className="mt-8 border-t border-border pt-8">
                {result.assessment ? (
                  <AssessmentView data={result.assessment} />
                ) : (
                  <p className="text-[15px] text-muted-foreground">
                    {result.assessmentError ?? "The AI assessment is not available for this report."}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setDescription("");
                  setPhoto(null);
                }}
                className={`${ghostButtonClass} mt-8`}
              >
                REPORT ANOTHER ANIMAL
              </button>
            </Card>
          ) : (
            <Card>
              <div className="font-mono text-[10px] font-bold tracking-[.18em] text-gold">
                PUBLIC EMERGENCY REPORT
              </div>
              <h1 className="mt-3 font-editorial text-4xl font-bold leading-tight tracking-[-.035em] text-primary">
                Help an animal.
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                No account needed. Add a photo and tell us what you see — you will get an instant preliminary
                assessment and the case reaches a veterinarian.
              </p>

              <form onSubmit={submit} className="mt-8 space-y-5">
                <div>
                  <Label>ANIMAL</Label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSpecies(s)}
                        className={`rounded-xl border px-4 py-2 text-[14px] transition ${
                          species === s
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:bg-accent"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>WHAT IS WRONG?</Label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    placeholder="Where it is hurt, how it is behaving, how long it has been like this…"
                    className={inputClass}
                  />
                </div>

                <div>
                  <Label>PHOTO (STRONGLY RECOMMENDED)</Label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-background px-4 py-4 text-[14px] text-muted-foreground hover:bg-accent">
                    <Camera className="h-5 w-5 text-primary" />
                    {photo ? "Photo added — tap to change" : "Take or choose a photo"}
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => onPhoto(e.target.files?.[0])}
                    />
                  </label>
                  {photo && (
                    <img src={photo} alt="Selected animal" className="mt-3 max-h-64 rounded-2xl border border-border object-cover" />
                  )}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label>YOUR NAME (OPTIONAL)</Label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <Label>PHONE (OPTIONAL)</Label>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
                  </div>
                </div>

                <div>
                  <Label>WHERE IS THE ANIMAL?</Label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Village, landmark or street"
                    className={inputClass}
                  />
                  <button type="button" onClick={useMyLocation} className={`${ghostButtonClass} mt-3`}>
                    <MapPin className="h-3.5 w-3.5" />
                    {coords ? "LOCATION ADDED" : "USE MY LOCATION"}
                  </button>
                  {coords && (
                    <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                      {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                    </p>
                  )}
                </div>

                {error && (
                  <p className="rounded-xl bg-destructive/10 px-4 py-3 text-[14px] text-destructive">{error}</p>
                )}

                <button type="submit" disabled={busy} className={buttonClass}>
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {busy ? "SENDING & ASSESSING…" : "SEND REPORT"}
                </button>
              </form>
            </Card>
          )}

          <Card>
            <h2 className="font-editorial text-[24px] font-bold tracking-[-.03em] text-primary">
              Check a report you already sent
            </h2>
            <form onSubmit={runLookup} className="mt-4 flex flex-wrap gap-3">
              <input
                value={lookupCode}
                onChange={(e) => setLookupCode(e.target.value)}
                placeholder="JR-XXXXXX"
                className={`${inputClass} max-w-xs`}
              />
              <button type="submit" className={buttonClass}>
                <Search className="h-4 w-4" />
                CHECK STATUS
              </button>
            </form>
            {lookupMsg && <p className="mt-4 text-[14px] text-muted-foreground">{lookupMsg}</p>}
            {lookup && (
              <div className="mt-6 space-y-4 border-t border-border pt-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-accent px-3.5 py-1.5 font-mono text-[10px] font-bold tracking-[.16em] text-primary uppercase">
                    STATUS: {String(lookup.status).replace("_", " ")}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">{lookup.tracking_code}</span>
                </div>
                <p className="text-[15px] text-foreground">
                  {lookup.species} — {lookup.description}
                </p>
                {lookup.photoUrl && (
                  <img src={lookup.photoUrl} alt="Reported animal" className="max-h-64 rounded-2xl border border-border object-cover" />
                )}
                {lookup.ai_assessment && (
                  <div className="border-t border-border pt-6">
                    <AssessmentView data={lookup.ai_assessment as unknown as AssessmentData} />
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
