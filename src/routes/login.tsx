import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button, errorText, Field, inputClass } from "@/components/kit";
import { GROK_PROVIDERS, authClient, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"masuk" | "daftar">("masuk");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  if (isPending) return <main className="grid min-h-screen place-items-center bg-cream text-muted">Memuat sesi…</main>;
  if (user) return <Navigate to="/" />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "daftar") {
        const result = await authClient.signUp.email({ email, password, name, callbackURL: "/" });
        if (result.error) throw new Error(result.error.message || "Pendaftaran gagal.");
      } else {
        const result = await authClient.signIn.email({ email, password, callbackURL: "/" });
        if (result.error) throw new Error(result.error.message || "Masuk gagal.");
      }
      window.location.href = "/";
    } catch (error) {
      toast.error(errorText(error));
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden flex-col justify-between bg-forest px-10 py-12 text-cream lg:flex">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-gold-soft uppercase">Yayasan Pendidikan Islam Tembalang</p>
          <h1 className="font-display mt-4 max-w-xl text-5xl leading-tight">Penilaian kinerja guru dan pegawai</h1>
          <p className="mt-4 max-w-lg text-cream/80">Satu alur untuk evaluasi diri, penilaian atasan, verifikasi kepala unit, dan rencana pengembangan di KB-TK, SD, serta SMPTQ Islam Pangeran Diponegoro.</p>
        </div>
        <ul className="space-y-2 text-sm text-gold-soft">
          <li>KB-TK Islam Pangeran Diponegoro</li>
          <li>SD Islam Pangeran Diponegoro</li>
          <li>SMPTQ Pangeran Diponegoro</li>
        </ul>
      </section>
      <section className="grid place-items-center bg-cream px-4 py-10">
        <div className="w-full max-w-md">
          <p className="text-xs font-semibold tracking-[0.16em] text-gold uppercase">SIPKG YPIT</p>
          <h2 className="font-display mt-2 text-4xl text-forest">{mode === "masuk" ? "Masuk" : "Daftar akun"}</h2>
          <p className="mt-2 text-sm text-muted">Akun pertama yang mendaftar menjadi Super Administrator. Peran lain ditetapkan oleh administrator.</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button type="button" variant={mode === "masuk" ? "primary" : "line"} onClick={() => setMode("masuk")}>Masuk</Button>
            <Button type="button" variant={mode === "daftar" ? "primary" : "line"} onClick={() => setMode("daftar")}>Daftar</Button>
          </div>
          <form className="mt-5 space-y-3" onSubmit={(event) => void submit(event)}>
            {mode === "daftar" ? (
              <Field label="Nama lengkap">
                <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} required />
              </Field>
            ) : null}
            <Field label="Surel">
              <input className={inputClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </Field>
            <Field label="Kata sandi">
              <input className={inputClass} type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
            </Field>
            <Button className="w-full" disabled={busy}>{busy ? "Memproses…" : mode === "masuk" ? "Masuk" : "Buat akun"}</Button>
          </form>
          <div className="mt-6 space-y-2">
            {GROK_PROVIDERS.map((provider) => (
              <Button key={provider.providerId} variant="line" className="w-full" type="button" onClick={() => void signIn(provider.providerId, { callbackURL: "/" })}>
                Lanjutkan dengan {provider.label}
              </Button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
