import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Shell, Card } from "@/components/Shell";
import { OWNER_NAV, VET_NAV } from "@/lib/nav";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — JeevRakshak" },
      { name: "description", content: "Your JeevRakshak workspace for animal health records and cases." },
      { property: "og:title", content: "Dashboard — JeevRakshak" },
      { property: "og:description", content: "Your JeevRakshak workspace." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data, isPending, error } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("No signed-in user");
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);
      const isVet = (roles ?? []).some((row) => row.role === "vet");
      return {
        email: user.email ?? "",
        fullName: profile?.full_name ?? "",
        role: isVet ? ("vet" as const) : ("owner" as const),
      };
    },
  });

  const sections = data?.role === "vet" ? vetSections : ownerSections;

  return (
    <Shell nav={data?.role === "vet" ? VET_NAV : OWNER_NAV}>
      {isPending && <p className="text-muted-foreground">Loading your workspace…</p>}
      {error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-[14px] text-destructive">
          We couldn't load your account details. Please refresh and try again.
        </p>
      )}
      {data && (
        <>
          <div className="font-mono text-[10px] font-bold tracking-[.18em] text-gold">
            {data.role === "vet" ? "CLINICAL DESK" : "OWNER WORKSPACE"}
          </div>
          <h1 className="mt-3 font-editorial text-5xl font-bold leading-tight tracking-[-.035em] text-primary">
            {data.fullName ? `Welcome, ${data.fullName.split(" ")[0]}.` : "Welcome."}
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Signed in as {data.email}. Your animals, records and cases are saved to your account and stay
            with you on every device.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => (
              <Link
                key={section.title}
                to={section.to}
                className="rounded-3xl border border-border bg-card p-7 transition hover:border-primary"
              >
                <h2 className="font-editorial text-[24px] font-bold tracking-[-.03em] text-primary">
                  {section.title}
                </h2>
                <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">{section.body}</p>
                <p className="mt-6 font-mono text-[10px] font-bold tracking-[.16em] text-gold">OPEN →</p>
              </Link>
            ))}
          </div>

          {data.role === "owner" && (
            <Card className="mt-8">
              <p className="text-[15px] leading-relaxed text-muted-foreground">
                Anyone can report an injured street animal without an account through the public
                <Link to="/report" className="mx-1 text-primary underline">
                  Help an Animal
                </Link>
                page.
              </p>
            </Card>
          )}
        </>
      )}
    </Shell>
  );
}

const ownerSections = [
  { title: "Farmer Portal", body: "Your overview: animals, vaccinations due and active requests.", to: "/portal" },
  { title: "My Animals", body: "Add each animal with a photo, breed, age and health notes.", to: "/animals" },
  { title: "Vaccinations & Records", body: "Vaccines given, next due dates and past treatments.", to: "/records" },
  { title: "AI Health Assistant", body: "Describe symptoms and share a photo for a preliminary read.", to: "/assistant" },
  { title: "Emergency Assistance", body: "Request a veterinarian and follow the case status live.", to: "/requests" },
  { title: "Previous Requests", body: "Everything you have reported, with its current status.", to: "/requests" },
];

const vetSections = [
  { title: "Doctor Portal", body: "Incoming cases, priorities and your active caseload.", to: "/vet-portal" },
  { title: "Incoming Cases", body: "New animal reports arriving from owners and the public.", to: "/cases" },
  { title: "Case Details", body: "Photos, symptoms, description and location for each report.", to: "/cases" },
  { title: "Status Updates", body: "Accept, decline, and move a case through to resolved.", to: "/cases" },
  { title: "Clinical Notes", body: "Record treatment given and recommendations for the owner.", to: "/cases" },
];

