import { PawPrint, ShieldCheck } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-[14px] bg-primary text-primary-foreground shadow-[0_7px_0_var(--color-gold)]">
        <ShieldCheck className="absolute h-7 w-7 opacity-35" />
        <PawPrint className="relative h-5 w-5" />
      </div>
      {!compact && (
        <div>
          <div className="font-editorial text-[21px] font-bold leading-none tracking-[-.04em] text-primary">
            JeevRakshak
          </div>
          <div className="mt-1 font-mono text-[9px] font-medium tracking-[.19em] text-muted-foreground">
            CARE • COORDINATED
          </div>
        </div>
      )}
    </div>
  );
}
