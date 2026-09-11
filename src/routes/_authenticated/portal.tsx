import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Shell, PageHead, Card } from "@/components/Shell";
import { OWNER_NAV } from "@/lib/nav";

export const Route = createFileRoute("/_authenticated/portal")({
  head: () => ({
    meta: [
      { title: "Farmer Portal — JeevRakshak" },
      {
        name: "description",
        content:
          "Your farmer and pet owner portal: animals, vaccinations due, active emergency requests and care updates in one view.",
      },
      { property: "og:title", content: "Farmer Portal — JeevRakshak" },
      { property: "og:description", content: "Animals, vaccinations due and active requests at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FarmerPortal,
});

function FarmerPortal() {
  const { data, isPending, error } = useQuery({
    queryKey: ["farmer-portal"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("No signed-in user");
      const [{ data: animals }, { data: vaccinations }, { data: cases }] = await Promise.all([
        supabase.from("animals").select("id, name, species, created_at").eq("owner_id", user.id),
        supabase
          .from("vaccinations")
          .select("id, vaccine, next_due_on, animal_id")
          .eq("owner_id", user.id)
          .not("next_due_on", "is", null)
          .order("next_due_on", { ascending: true }),
        supabase
          .from("cases")
          .select("id, tracking_code, species, status, urgency, created_at")
          .eq("reporter_id", user.id)
          .order("created_at", { ascending: false }),
      ]);
      const animalName = new Map((animals ?? []).map((a) => [a.id, a.name]));
      const today = new Date().toISOString().slice(0, 10);
      const inThirty = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
      const due = (vaccinations ?? []).filter((v) => v.next_due_on! <= inThirty);
      const openCases = (cases ?? []).filter((c) => c.status !== "resolved" && c.status !== "closed");
      return {
        animals: animals ?? [],
        due: due.map((v) => ({ ...v, animal: animalName.get(v.animal_id) ?? "Animal", overdue: v.next_due_on! < today })),
        cases: cases ?? [],
        openCases,
        highPriority: openCases.filter((c) => (c.urgency ?? "").toLowerCase() === "high").length,
      };
    },
  });

  return (
    <Shell nav={OWNER_NAV}>
      <PageHead
        eyebrow="OWNER WORKSPACE"
        title="Care, clearly coordinated."
        lead="See what is happening with every animal and every reported case, without having to chase updates."
      />
      {isPending && <p className="text-muted-foreground">Loading your portal…</p>}
      {error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-[14px] text-destructive">
          We couldn't load your portal. Please refresh and try again.
        </p>
      )}
      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Metric value={data.animals.length} label="Animals registered" />
            <Metric value={data.openCases.length} label="Active requests" />
            <Metric value={data.highPriority} label="High priority" />
            <Metric value={data.due.length} label="Vaccinations due" />
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <Card>
              <SectionTitle title="Vaccinations coming up" to="/animals" cta="MANAGE ANIMALS" />
              {data.due.length === 0 ? (
                <p className="mt-3 text-[14px] text-muted-foreground">Nothing due in the next 30 days.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {data.due.slice(0, 6).map((v) => (
                    <li key={v.id} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[15px] font-semibold text-primary">{v.vaccine}</p>
                        <p className="text-[13px] text-muted-foreground">{v.animal}</p>
                      </div>
                      <span
                        className={`font-mono text-[10px] font-bold tracking-[.12em] ${
                          v.overdue ? "text-destructive" : "text-gold"
                        }`}
                      >
                        {v.overdue ? "OVERDUE " : "DUE "}
                        {v.next_due_on}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <SectionTitle title="Recent requests" to="/requests" cta="ALL REQUESTS" />
              {data.cases.length === 0 ? (
                <p className="mt-3 text-[14px] text-muted-foreground">
                  No emergency requests yet. Raise one from the requests page whenever an animal needs help.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {data.cases.slice(0, 6).map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[15px] font-semibold text-primary">{c.species}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">{c.tracking_code}</p>
                      </div>
                      <span className="rounded-full bg-accent px-3 py-1 font-mono text-[10px] font-bold tracking-[.12em] text-accent-foreground">
                        {c.status.replace("_", " ").toUpperCase()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <QuickLink to="/animals" title="Add an animal" body="Photo, breed, age and health notes." />
            <QuickLink to="/assistant" title="Ask the AI assistant" body="Describe symptoms, share a photo." />
            <QuickLink to="/requests" title="Request a vet" body="Raise an emergency and track it live." />
          </div>
        </>
      )}
    </Shell>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="font-editorial text-4xl font-bold tracking-[-.04em] text-primary">{value}</div>
      <div className="mt-2 font-mono text-[10px] font-bold tracking-[.14em] text-muted-foreground">
        {label.toUpperCase()}
      </div>
    </div>
  );
}

function SectionTitle({ title, to, cta }: { title: string; to: string; cta: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="font-editorial text-[22px] font-bold tracking-[-.03em] text-primary">{title}</h2>
      <Link to={to} className="font-mono text-[10px] font-bold tracking-[.14em] text-gold">
        {cta} →
      </Link>
    </div>
  );
}

function QuickLink({ to, title, body }: { to: string; title: string; body: string }) {
  return (
    <Link to={to} className="rounded-3xl border border-border bg-card p-6 transition hover:border-primary">
      <h3 className="font-editorial text-[20px] font-bold tracking-[-.03em] text-primary">{title}</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{body}</p>
    </Link>
  );
}
