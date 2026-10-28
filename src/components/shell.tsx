// @ts-nocheck
import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell, BookOpen, Building2, ClipboardCheck, FileBarChart, LayoutDashboard, LogOut,
  Network, ScrollText, Settings, Shield, Users, UserRound, CalendarRange, ListChecks, Sprout, Menu, X,
} from "lucide-react";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { signOut } from "@/lib/auth/client";
import { hasGateSessionMarker } from "@/lib/auth/gate-session-marker";
import { navFor, type NavKey } from "@/lib/ypit/access";
import { ROLE_LABEL } from "@/lib/ypit/labels";
import { getSession, listEmployeesFn, listNotificationsFn, setSimulationFn } from "@/lib/ypit/server";
import { cn } from "./kit";

const NAV: Record<NavKey, { to: string; label: string; icon: typeof LayoutDashboard }> = {
  dashboard: { to: "/", label: "Dasbor", icon: LayoutDashboard },
  pegawai: { to: "/pegawai", label: "Data pegawai", icon: Users },
  organisasi: { to: "/organisasi", label: "Struktur organisasi", icon: Network },
  unit: { to: "/unit", label: "Unit pendidikan", icon: Building2 },
  jabatan: { to: "/jabatan", label: "Jabatan dan penilai", icon: UserRound },
  periode: { to: "/periode", label: "Periode penilaian", icon: CalendarRange },
  instrumen: { to: "/instrumen", label: "Template dan indikator", icon: ListChecks },
  evaluasi: { to: "/evaluasi", label: "Evaluasi diri", icon: ClipboardCheck },
  penilaian: { to: "/penilaian", label: "Penilaian atasan", icon: ClipboardCheck },
  verifikasi: { to: "/verifikasi", label: "Verifikasi", icon: Shield },
  hasil: { to: "/hasil", label: "Hasil penilaian", icon: FileBarChart },
  pengembangan: { to: "/pengembangan", label: "Rencana pengembangan", icon: Sprout },
  laporan: { to: "/laporan", label: "Laporan", icon: ScrollText },
  notifikasi: { to: "/notifikasi", label: "Notifikasi", icon: Bell },
  audit: { to: "/audit", label: "Audit log", icon: Shield },
  pengaturan: { to: "/pengaturan", label: "Pengaturan", icon: Settings },
  panduan: { to: "/panduan", label: "Panduan", icon: BookOpen },
};

export function Shell({ children }: { children: ReactNode }) {
  const session = useQuery({ queryKey: ["session"], queryFn: () => getSession() });
  const notes = useQuery({ queryKey: ["notifications"], queryFn: () => listNotificationsFn(), enabled: !!session.data });
  const people = useQuery({
    queryKey: ["employees", "sim"],
    queryFn: () => listEmployeesFn({ data: { active: "aktif" } }),
    enabled: session.data?.profileRole === "super_admin",
  });
  const client = useQueryClient();
  const path = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const actor = session.data;
  const unread = (notes.data ?? []).filter((item) => !(item as { read_at?: string | null }).read_at).length;
  const items = actor ? navFor(actor.effectiveRole) : [];
  const gateSession = useSyncExternalStore(() => () => {}, hasGateSessionMarker, () => false);

  return (
    <div className="min-h-screen md:grid md:grid-cols-[270px_1fr]">
      <aside className={cn("fixed inset-y-0 left-0 z-40 w-[270px] border-r border-line bg-forest text-cream transition md:static", open ? "translate-x-0" : "-translate-x-full md:translate-x-0")}>
        <div className="flex items-center gap-3 px-5 py-5">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gold font-display text-lg text-ink">YP</span>
          <div>
            <p className="font-display text-lg leading-none">SIPKG YPIT</p>
            <p className="mt-1 text-xs text-gold-soft">Penilaian kinerja semester</p>
          </div>
        </div>
        <nav className="space-y-1 px-3 pb-8">
          {items.map((key) => {
            const item = NAV[key];
            const Icon = item.icon;
            const active = path === item.to;
            return (
              <Link key={key} to={item.to} className={cn("flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm", active ? "bg-cream text-forest" : "text-cream/90 hover:bg-white/10")}>
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {key === "notifikasi" && unread > 0 ? <span className="ml-auto rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-ink">{unread}</span> : null}
              </Link>
            );
          })}
        </nav>
      </aside>
      {open ? <button className="fixed inset-0 z-30 bg-ink/40 md:hidden" aria-label="Tutup menu" onClick={() => setOpen(false)} /> : null}
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-cream/90 px-4 py-3 backdrop-blur md:px-6">
          <button className="grid h-11 w-11 place-items-center rounded-2xl border border-line bg-paper md:hidden" onClick={() => setOpen(true)} aria-label="Buka menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-forest">Yayasan Pendidikan Islam Tembalang</p>
            <p className="truncate text-xs text-muted">{actor ? `${ROLE_LABEL[actor.effectiveRole]}${actor.unitName ? ` · ${actor.unitName}` : ""}` : "Memuat profil…"}</p>
          </div>
          <Link to="/notifikasi" className="relative grid h-11 w-11 place-items-center rounded-2xl border border-line bg-paper" aria-label="Notifikasi">
            <Bell className="h-4 w-4" />
            {unread > 0 ? <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-gold" /> : null}
          </Link>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="max-w-40 truncate text-sm font-semibold">{actor?.fullName}</span>
            {!gateSession ? (
              <button className="inline-flex min-h-11 items-center gap-1 text-sm text-muted" onClick={() => void signOut("/")}>
                <LogOut className="h-4 w-4" /> Keluar
              </button>
            ) : null}
          </div>
        </header>
        {actor?.simulating ? (
          <div className="flex flex-wrap items-center justify-between gap-2 bg-gold px-4 py-2 text-sm text-ink md:px-6">
            <span>Mode simulasi: Anda bertindak sebagai {actor.simulationName}. Setiap tindakan tetap tercatat atas akun Anda.</span>
            <button className="font-semibold underline" onClick={() => void setSimulationFn({ data: null }).then(() => client.invalidateQueries())}>Keluar simulasi</button>
          </div>
        ) : null}
        {actor?.profileRole === "super_admin" && !actor.simulating ? (
          <div className="flex flex-wrap items-center gap-2 border-b border-line bg-paper px-4 py-2 text-sm md:px-6">
            <span className="text-muted">Simulasi peran demo</span>
            <select
              className="min-h-11 rounded-xl border border-line bg-cream px-3 text-sm"
              value=""
              onChange={(event) => {
                if (!event.target.value) return;
                void setSimulationFn({ data: event.target.value }).then(() => client.invalidateQueries());
              }}
            >
              <option value="">Pilih pegawai demo…</option>
              {(people.data ?? []).filter((person) => (person as { is_demo?: boolean }).is_demo).map((person) => {
                const row = person as { id: string; full_name: string; demo_role?: string };
                return <option key={row.id} value={row.id}>{row.full_name}</option>;
              })}
            </select>
          </div>
        ) : null}
        <main className="px-4 py-5 md:px-6 md:py-7">{session.isError ? <p className="text-danger">{session.error instanceof Error ? session.error.message : "Sesi gagal dimuat."}</p> : children}</main>
      </div>
    </div>
  );
}
