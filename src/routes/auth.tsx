import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Brand";

type Role = "owner" | "vet";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — JeevRakshak" },
      {
        name: "description",
        content:
          "Sign in or create a JeevRakshak account as a farmer, pet owner or veterinarian to manage animal health records and cases.",
      },
      { property: "og:title", content: "Sign in — JeevRakshak" },
      {
        property: "og:description",
        content: "Create a JeevRakshak account as an owner or veterinarian.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { role: Role } => ({
    role: search['role'] === "vet" ? "vet" : "owner",
  }),
  component: AuthPage,
});

const roleCopy: Record<Role, { label: string; blurb: string }> = {
  owner: {
    label: "Farmer / Pet Owner",
    blurb: "Keep every animal's vaccinations, records and requests in one place.",
  },
  vet: {
    label: "Doctor / Veterinarian",
    blurb: "Receive animal cases, review photos and record professional care.",
  },
};

function AuthPage() {
  const { role } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: fullName, phone, role },
          },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setNotice("Account created. Please sign in to continue.");
          setMode("signin");
          return;
        }
        navigate({ to: "/dashboard", replace: true });
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      navigate({ to: "/dashboard", replace: true });
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setBusy(false);
    }
  }

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
        <div className="mx-auto w-full max-w-md rounded-3xl border border-border bg-card p-7 sm:p-9">
          <div className="font-mono text-[10px] font-bold tracking-[.18em] text-gold">
            {roleCopy[role].label.toUpperCase()}
          </div>
          <h1 className="mt-3 font-editorial text-4xl font-bold leading-tight tracking-[-.03em] text-primary">
            {mode === "signin" ? "Welcome back." : "Create your account."}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            {roleCopy[role].blurb}
          </p>

          <div className="mt-6 flex rounded-xl border border-border p-1">
            {(["signin", "signup"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setMode(value);
                  setError(null);
                  setNotice(null);
                }}
                className={`flex-1 rounded-lg px-3 py-2 text-[11px] font-extrabold tracking-[.12em] transition-colors ${
                  mode === value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {value === "signin" ? "SIGN IN" : "SIGN UP"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <>
                <Field
                  label="Full name"
                  value={fullName}
                  onChange={setFullName}
                  type="text"
                  required
                  autoComplete="name"
                />
                <Field
                  label="Phone (optional)"
                  value={phone}
                  onChange={setPhone}
                  type="tel"
                  autoComplete="tel"
                />
              </>
            )}
            <Field
              label="Email"
              value={email}
              onChange={setEmail}
              type="email"
              required
              autoComplete="email"
            />
            <Field
              label="Password"
              value={password}
              onChange={setPassword}
              type="password"
              required
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />

            {error && (
              <p className="rounded-xl bg-destructive/10 px-4 py-3 text-[13px] text-destructive">{error}</p>
            )}
            {notice && (
              <p className="rounded-xl bg-accent px-4 py-3 text-[13px] text-accent-foreground">{notice}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-[12px] font-extrabold tracking-[.12em] text-primary-foreground disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
            </button>
          </form>

          <p className="mt-6 text-[13px] text-muted-foreground">
            Need to report an injured animal right now?{" "}
            <Link to="/report" className="font-semibold text-primary underline underline-offset-4">
              Do it without an account
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type,
  required,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] font-bold tracking-[.16em] text-muted-foreground">
        {label.toUpperCase()}
      </span>
      <input
        className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-[15px] text-foreground outline-none transition-colors focus:border-primary"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        required={required}
        autoComplete={autoComplete}
      />
    </label>
  );
}
