import type { ButtonHTMLAttributes, ReactNode } from "react";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function errorText(error: unknown): string {
  if (error instanceof Error && error.message) return error.message.replace(/^AppError:\s*/, "");
  if (typeof error === "object" && error && "message" in error) return String((error as { message: unknown }).message);
  return "Terjadi kesalahan. Periksa isian, lalu coba lagi.";
}

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "gold" | "danger" | "line" }) {
  const styles = {
    primary: "bg-forest text-cream hover:bg-moss",
    gold: "bg-gold text-ink hover:brightness-105",
    ghost: "bg-transparent text-forest hover:bg-sand/70",
    danger: "bg-danger text-paper hover:brightness-110",
    line: "border border-line bg-paper text-ink hover:border-forest",
  }[variant];
  return (
    <button
      {...props}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        styles,
        className,
      )}
    />
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none ring-gold/40 placeholder:text-muted focus:ring-2";

export function Badge({ children, tone = "sand" }: { children: ReactNode; tone?: "sand" | "forest" | "gold" | "danger" }) {
  const tones = {
    sand: "bg-sand text-ink",
    forest: "bg-forest text-cream",
    gold: "bg-gold-soft text-ink",
    danger: "bg-danger-soft text-danger",
  }[tone];
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", tones)}>{children}</span>;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-[var(--radius-card)] border border-line bg-paper p-4 shadow-[0_1px_0_rgba(18,56,47,0.04)] md:p-5", className)}>{children}</section>;
}

export function PageTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow ? <p className="text-xs font-semibold tracking-[0.16em] text-gold uppercase">{eyebrow}</p> : null}
        <h1 className="font-display text-3xl text-forest md:text-4xl">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-line bg-cream/60 px-4 py-8 text-center text-sm text-muted">{children}</div>;
}

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-ink/40 p-3 md:place-items-center" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-3xl bg-paper p-5 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="font-display text-2xl text-forest">{title}</h2>
          <Button variant="ghost" onClick={onClose} type="button">Tutup</Button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function downloadBase64(filename: string, base64: string, mime: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
