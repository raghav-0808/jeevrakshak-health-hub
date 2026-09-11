import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Shell, PageHead, Card } from "@/components/Shell";
import { OWNER_NAV } from "@/lib/nav";

export const Route = createFileRoute("/_authenticated/records")({
  head: () => ({
    meta: [
      { title: "Health Records — JeevRakshak" },
      {
        name: "description",
        content:
          "One health record book for all your animals: every vaccination given, next due dates and past treatments.",
      },
      { property: "og:title", content: "Health Records — JeevRakshak" },
      { property: "og:description", content: "Vaccinations and treatments across all of your animals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RecordsPage,
});

function RecordsPage() {
  const { data, isPending, error } = useQuery({
    queryKey: ["all-records"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("No signed-in user");
      const [{ data: animals }, { data: vaccinations }, { data: records }] = await Promise.all([
        supabase.from("animals").select("id, name, species").eq("owner_id", user.id).order("name"),
        supabase
          .from("vaccinations")
          .select("id, animal_id, vaccine, given_on, next_due_on, notes")
          .eq("owner_id", user.id)
          .order("given_on", { ascending: false }),
        supabase
          .from("medical_records")
          .select("id, animal_id, record_date, title, diagnosis, treatment, vet_name")
          .eq("owner_id", user.id)
          .order("record_date", { ascending: false }),
      ]);
      return { animals: animals ?? [], vaccinations: vaccinations ?? [], records: records ?? [] };
    },
  });

  return (
    <Shell nav={OWNER_NAV}>
      <PageHead
        eyebrow="RECORD BOOK"
        title="Every vaccination and treatment."
        lead="A single history for all of your animals, kept safely in your account."
      />
      {isPending && <p className="text-muted-foreground">Loading records…</p>}
      {error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-[14px] text-destructive">
          We couldn't load your records. Please refresh and try again.
        </p>
      )}
      {data &&
        (data.animals.length === 0 ? (
          <Card>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              You have not added any animals yet. Start on the{" "}
              <Link to="/animals" className="text-primary underline">
                animals page
              </Link>
              .
            </p>
          </Card>
        ) : (
          <div className="space-y-5">
            {data.animals.map((animal) => {
              const vaccines = data.vaccinations.filter((v) => v.animal_id === animal.id);
              const treatments = data.records.filter((r) => r.animal_id === animal.id);
              return (
                <Card key={animal.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="font-editorial text-[24px] font-bold tracking-[-.03em] text-primary">
                        {animal.name}
                      </h2>
                      <p className="font-mono text-[10px] font-bold tracking-[.14em] text-muted-foreground">
                        {animal.species.toUpperCase()}
                      </p>
                    </div>
                    <Link
                      to="/animals/$animalId"
                      params={{ animalId: animal.id }}
                      className="font-mono text-[10px] font-bold tracking-[.14em] text-gold"
                    >
                      OPEN →
                    </Link>
                  </div>

                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <div>
                      <h3 className="font-mono text-[10px] font-bold tracking-[.16em] text-muted-foreground">
                        VACCINATIONS
                      </h3>
                      {vaccines.length === 0 ? (
                        <p className="mt-2 text-[14px] text-muted-foreground">None recorded.</p>
                      ) : (
                        <ul className="mt-3 space-y-2">
                          {vaccines.map((v) => (
                            <li key={v.id} className="text-[14px] text-foreground">
                              <span className="font-semibold text-primary">{v.vaccine}</span>
                              <span className="text-muted-foreground">
                                {" "}
                                · given {v.given_on}
                                {v.next_due_on ? ` · next due ${v.next_due_on}` : ""}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <h3 className="font-mono text-[10px] font-bold tracking-[.16em] text-muted-foreground">
                        TREATMENTS
                      </h3>
                      {treatments.length === 0 ? (
                        <p className="mt-2 text-[14px] text-muted-foreground">None recorded.</p>
                      ) : (
                        <ul className="mt-3 space-y-2">
                          {treatments.map((r) => (
                            <li key={r.id} className="text-[14px] text-foreground">
                              <span className="font-semibold text-primary">{r.title}</span>
                              <span className="text-muted-foreground">
                                {" "}
                                · {r.record_date}
                                {r.vet_name ? ` · ${r.vet_name}` : ""}
                              </span>
                              {r.treatment && (
                                <p className="text-[13px] leading-relaxed text-muted-foreground">{r.treatment}</p>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ))}
    </Shell>
  );
}
