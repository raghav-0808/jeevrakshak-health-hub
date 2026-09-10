import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowRight, HeartPulse, ShieldCheck, Stethoscope, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JeevRakshak — An animal needs help? Start here." },
      {
        name: "description",
        content:
          "Report an injured animal, manage your livestock health records, or respond as a veterinarian. AI-assisted preliminary assessment with coordinated care.",
      },
      { property: "og:title", content: "JeevRakshak — An animal needs help? Start here." },
      {
        property: "og:description",
        content:
          "Report an injured animal, manage livestock health records, or respond to cases as a veterinarian.",
      },
    ],
  }),
  component: Entry,
});

const options = [
  {
    icon: UsersRound,
    title: "Farmer / Pet Owner",
    body: "Manage your animals and health records",
    cta: "CONTINUE AS OWNER",
    to: "/auth",
    search: { role: "owner" as const },
  },
  {
    icon: Stethoscope,
    title: "Doctor / Veterinarian",
    body: "Manage and respond to animal cases",
    cta: "CONTINUE AS VET",
    to: "/auth",
    search: { role: "vet" as const },
  },
  {
    icon: HeartPulse,
    title: "Help an Animal",
    body: "Report an injured animal without login",
    cta: "REPORT NOW",
    to: "/report",
    search: undefined,
  },
];

function Entry() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) =>
      setSignedIn(Boolean(session)),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between gap-4 px-5 py-5 sm:px-10">
        <Logo />
        <div className="flex items-center gap-3">
          {signedIn && (
            <Link
              to="/dashboard"
              className="hidden rounded-full px-4 py-2 text-[11px] font-extrabold tracking-[.12em] text-primary underline-offset-4 hover:underline sm:inline-flex"
            >
              MY DASHBOARD
            </Link>
          )}
          <Link
            to="/report"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-[12px] font-extrabold tracking-[.12em] text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <Activity className="h-4 w-4" />
            REPORT AN ANIMAL
          </Link>
        </div>
      </header>

      <main className="paper-grid border-t border-border">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-12 sm:px-10 sm:pt-16">
          <h1 className="font-editorial text-[13vw] font-bold leading-[0.95] tracking-[-.035em] text-primary sm:text-6xl lg:text-7xl">
            An animal needs help?
            <span className="mt-1 block italic text-gold">Start here.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            AI-assisted animal and livestock health response from first report to complete care.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {options.map((option) => (
              <Link
                key={option.title}
                to={option.to}
                search={option.search as never}
                className="group flex flex-col rounded-3xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_18px_40px_-24px_var(--color-primary)]"
              >
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-primary">
                  <option.icon className="h-6 w-6" />
                </span>
                <h2 className="mt-8 font-editorial text-[28px] font-bold leading-tight tracking-[-.03em] text-primary">
                  {option.title}
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{option.body}</p>
                <span className="mt-8 inline-flex items-center gap-2 text-[12px] font-extrabold tracking-[.12em] text-gold">
                  {option.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-border bg-card/60 px-5 py-5 sm:px-10">
          <p className="mx-auto flex max-w-6xl items-center gap-2 text-[13px] text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
            AI assessment is preliminary and does not replace professional veterinary diagnosis.
          </p>
        </div>
      </main>
    </div>
  );
}
