import { AlertTriangle, ShieldCheck } from "lucide-react";

export interface AssessmentData {
  animal_observed: string;
  condition_summary: string;
  likely_conditions: { name: string; reasoning: string; confidence: string }[];
  urgency: string;
  vet_required: boolean;
  immediate_actions: string[];
  warning_signs: string[];
  questions_for_owner: string[];
}

const urgencyTone: Record<string, string> = {
  low: "bg-accent text-primary",
  moderate: "bg-gold/20 text-gold-foreground",
  high: "bg-gold/35 text-gold-foreground",
  critical: "bg-destructive/15 text-destructive",
};

export function AssessmentView({ data }: { data: AssessmentData }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full px-3.5 py-1.5 font-mono text-[10px] font-bold tracking-[.16em] uppercase ${
            urgencyTone[data.urgency] ?? "bg-accent text-primary"
          }`}
        >
          URGENCY: {data.urgency}
        </span>
        {data.vet_required && (
          <span className="inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-1.5 font-mono text-[10px] font-bold tracking-[.16em] text-primary-foreground">
            <AlertTriangle className="h-3.5 w-3.5" />
            SEE A VETERINARIAN
          </span>
        )}
      </div>

      <div>
        <h3 className="font-editorial text-[22px] font-bold tracking-[-.03em] text-primary">What we see</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-foreground">{data.animal_observed}</p>
        <p className="mt-2 text-[15px] leading-relaxed text-foreground">{data.condition_summary}</p>
      </div>

      {data.likely_conditions?.length > 0 && (
        <div>
          <h3 className="font-editorial text-[22px] font-bold tracking-[-.03em] text-primary">Possible causes</h3>
          <ul className="mt-3 space-y-3">
            {data.likely_conditions.map((c, i) => (
              <li key={i} className="rounded-2xl border border-border bg-background p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-[15px] font-bold text-primary">{c.name}</span>
                  <span className="font-mono text-[10px] tracking-[.14em] text-muted-foreground uppercase">
                    {c.confidence} confidence
                  </span>
                </div>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">{c.reasoning}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ListBlock title="Do this now" items={data.immediate_actions} />
      <ListBlock title="Warning signs to watch" items={data.warning_signs} />
      <ListBlock title="Helpful details to add" items={data.questions_for_owner} />

      <p className="flex items-start gap-2 border-t border-border pt-5 text-[13px] leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        This is a preliminary AI assessment and does not replace examination by a qualified veterinarian.
      </p>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <h3 className="font-editorial text-[22px] font-bold tracking-[-.03em] text-primary">{title}</h3>
      <ul className="mt-2 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-foreground">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
