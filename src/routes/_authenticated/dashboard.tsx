import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Brand";

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { role: "owner" }, replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-5 py-5 sm:px-10">
        <Logo />
        <button
          type="button"
          onClick={signOut}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-[11px] font-extrabold tracking-[.12em] text-primary hover:bg-accent"
        >
          <LogOut className="h-4 w-4" />
          SIGN OUT
        </button>
      </header>

      <main className="paper-grid min-h-[calc(100vh-84px)] border-t border-border px-5 py-12 sm:px-10">
        <div className="mx-auto max-w-6xl">
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
                Signed in as {data.email}. Your account is saved, so your animals, records and cases
                stay with you on every device.
              </p>

              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {(data.role === "vet" ? vetSections : ownerSections).map((section) => (
                  <div key={section.title} className="rounded-3xl border border-border bg-card p-7">
                    <h2 className="font-editorial text-[24px] font-bold tracking-[-.03em] text-primary">
                      {section.title}
                    </h2>
                    <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                      {section.body}
                    </p>
                    <p className="mt-6 font-mono text-[10px] font-bold tracking-[.16em] text-gold">
                      BEING BUILT NEXT
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

const ownerSections = [
  { title: "My Animals", body: "Add each animal with a photo, breed, age and health notes." },
  { title: "Vaccinations", body: "Record vaccines given and the next due date for every animal." },
  { title: "Medical Records", body: "Keep past treatments and veterinary notes in one history." },
  { title: "AI Health Assistant", body: "Describe symptoms and share a photo for a preliminary read." },
  { title: "Emergency Assistance", body: "Request a veterinarian and follow the case status live." },
  { title: "Previous Requests", body: "Everything you have reported, with its current status." },
];

const vetSections = [
  { title: "Incoming Cases", body: "New animal reports arriving from owners and the public." },
  { title: "Case Details", body: "Photos, symptoms, description and location for each report." },
  { title: "Status Updates", body: "Accept, decline, and move a case through to resolved." },
  { title: "Medical Notes", body: "Record treatment given and recommendations for the owner." },
];
