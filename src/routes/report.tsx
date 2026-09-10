import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Brand";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report an animal — JeevRakshak" },
      {
        name: "description",
        content:
          "Found an injured or sick animal? Report it to JeevRakshak with a photo, description and location — no account needed.",
      },
      { property: "og:title", content: "Report an animal — JeevRakshak" },
      {
        property: "og:description",
        content: "Report an injured or sick animal with a photo and location, without signing in.",
      },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-5 py-5 sm:px-10">
        <Logo />
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[.12em] text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          BACK
        </Link>
      </header>

      <main className="paper-grid min-h-[calc(100vh-84px)] border-t border-border px-5 py-12 sm:px-10">
        <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-7 sm:p-9">
          <div className="font-mono text-[10px] font-bold tracking-[.18em] text-gold">
            PUBLIC EMERGENCY REPORT
          </div>
          <h1 className="mt-3 font-editorial text-4xl font-bold leading-tight tracking-[-.03em] text-primary">
            Help an animal.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            This report needs no account. The full flow — photo, animal type, what is wrong, your
            location, a preliminary AI read and delivery to a veterinarian — is the next piece being
            built, so it is not accepting reports yet.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            If an animal needs help right now, please contact a local veterinarian or animal welfare
            helpline directly.
          </p>
          <p className="mt-8 flex items-center gap-2 text-[13px] text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
            AI assessment is preliminary and does not replace professional veterinary diagnosis.
          </p>
        </div>
      </main>
    </div>
  );
}
