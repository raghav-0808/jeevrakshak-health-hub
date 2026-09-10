import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Brand";

export function Shell({
  nav,
  children,
}: {
  nav?: { to: string; label: string }[];
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { role: "owner" }, replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-10">
        <Logo />
        <div className="flex flex-wrap items-center gap-2">
          {nav?.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "bg-accent text-primary" }}
              className="rounded-xl px-3.5 py-2 font-mono text-[10px] font-bold tracking-[.14em] text-muted-foreground hover:bg-accent hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3.5 py-2 font-mono text-[10px] font-bold tracking-[.14em] text-primary hover:bg-accent"
          >
            <LogOut className="h-3.5 w-3.5" />
            SIGN OUT
          </button>
        </div>
      </header>
      <main className="paper-grid min-h-[calc(100vh-84px)] border-t border-border px-5 py-10 sm:px-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

export function PageHead({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) {
  return (
    <div className="mb-8">
      <div className="font-mono text-[10px] font-bold tracking-[.18em] text-gold">{eyebrow}</div>
      <h1 className="mt-3 font-editorial text-4xl font-bold leading-tight tracking-[-.035em] text-primary sm:text-5xl">
        {title}
      </h1>
      {lead && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{lead}</p>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-border bg-card p-6 sm:p-7 ${className}`}>{children}</div>;
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <span className="mb-2 block font-mono text-[10px] font-bold tracking-[.16em] text-muted-foreground">
      {children}
    </span>
  );
}

export const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-[15px] text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary";

export const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-mono text-[11px] font-bold tracking-[.14em] text-primary-foreground transition hover:opacity-90 disabled:opacity-50";

export const ghostButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 font-mono text-[10px] font-bold tracking-[.14em] text-primary transition hover:bg-accent disabled:opacity-50";
