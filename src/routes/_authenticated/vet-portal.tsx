import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Shell, PageHead, Card } from "@/components/Shell";
import { VET_NAV } from "@/lib/nav";

export const Route = createFileRoute("/_authenticated/vet-portal")({
  head: () => ({
    meta: [
      { title: "Doctor Portal — JeevRakshak" },
      {
        name: "description",
        content:
          "Veterinarian portal: incoming animal cases, high priority reports, cases assigned to you and resolved outcomes.",
      },
      { property: "og:title", content: "Doctor Portal — JeevRakshak" },
      { property: "og:description", content: "Incoming cases, priorities and your caseload at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VetPortal,
});

function VetPortal() {
  const { data, isPending, error } = useQuery({
    queryKey: ["vet-portal"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("No signed-in user");
      const { data: cases } = await supabase
        .from("cases")
        .select("id, tracking_code, species, description, status, urgency, address, assigned_vet_id, created_at")
        .order("created_at", { ascending: false });
      const all = cases ?? [];
      return {
        all,
        incoming: all.filter((c) => c.status === "new"),
        mine: all.filter((c) => c.assigned_vet_id === user.id && c.status !== "closed"),
        high: all.filter(
          (c) => (c.urgency ?? "").toLowerCase() === "high" && c.status !== "resolved" && c.status !== "closed",
        ),
        resolved: all.filter((c) => c.status === "resolved" || c.status === "closed"),
      };
    },
  });

  return (
    <Shell nav={VET_NAV}>
      <PageHead
        eyebrow="CLINICAL DESK"
        title="Every case, in priority order."
        lead="New reports, the animals already under your care, and everything you have brought to a close."
      />
      {isPending && <p className="text-muted-foreground">Loading your portal…</p>}
      {error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-[14px] text-destructive">
          We couldn't load the case data. Please refresh and try again.
        </p>
      )}
      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Metric value={data.incoming.length} label="Incoming cases" />
            <Metric value={data.high.length} label="High priority" />
            <Metric value={data.mine.length} label="Assigned to you" />
            <Metric value={data.resolved.length} label="Resolved" />
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <Card>
              <SectionTitle title="New reports" />
              <CaseList items={data.incoming} empty="No new reports right now." />
            </Card>
            <Card>
              <SectionTitle title="Your active caseload" />
              <CaseList items={data.mine} empty="You have not accepted any cases yet." />
            </Card>
          </div>

          <Card className="mt-5">
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Open the{" "}
              <Link to="/cases" className="text-primary underline">
                case queue
              </Link>{" "}
              to view photos, location and the preliminary AI assessment, update a status and add clinical notes.
            </p>
          </Card>
        </>
      )}
    </Shell>
  );
}

type CaseRow = {
  id: string;
  tracking_code: string;
  species: string;
  description: string;
  status: string;
  urgency: string | null;
  address: string | null;
};

function CaseList({ items, empty }: { items: CaseRow[]; empty: string }) {
  if (items.length === 0) return <p className="mt-3 text-[14px] text-muted-foreground">{empty}</p>;
  return (
    <ul className="mt-4 space-y-4">
      {items.slice(0, 6).map((c) => (
        <li key={c.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[15px] font-semibold text-primary">{c.species}</p>
            <span className="rounded-full bg-accent px-3 py-1 font-mono text-[10px] font-bold tracking-[.12em] text-accent-foreground">
              {c.status.replace("_", " ").toUpperCase()}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-[14px] leading-relaxed text-muted-foreground">{c.description}</p>
          <p className="mt-2 font-mono text-[10px] tracking-[.12em] text-muted-foreground">
            {c.tracking_code}
            {c.address ? ` · ${c.address}` : ""}
          </p>
        </li>
      ))}
    </ul>
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

function SectionTitle({ title }: { title: string }) {
  return <h2 className="font-editorial text-[22px] font-bold tracking-[-.03em] text-primary">{title}</h2>;
}
