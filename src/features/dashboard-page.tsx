// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge, Card, PageTitle } from "@/components/kit";
import { ASSIGNMENT_STATUS_LABEL, GROUP_LABEL, ROLE_LABEL } from "@/lib/ypit/labels";
import { getDashboardFn } from "@/lib/ypit/server";

export function DashboardPage() {
  const dash = useQuery({ queryKey: ["dashboard"], queryFn: () => getDashboardFn() });
  if (dash.isLoading) return <p className="text-muted">Memuat dasbor…</p>;
  if (dash.isError || !dash.data) return <p className="text-danger">Dasbor gagal dimuat.</p>;
  const data = dash.data;
  const progress = data.progress.map((row) => ({ name: ASSIGNMENT_STATUS_LABEL[row.status] ?? row.status, total: row.total }));
  const doneSelf = data.progress.filter((row) => !["tertahan", "menunggu_evaluasi_diri", "evaluasi_diri_draf"].includes(row.status)).reduce((s, r) => s + r.total, 0);
  const total = data.progress.reduce((s, r) => s + r.total, 0) || 1;
  const assessed = data.progress.filter((row) => !["tertahan", "menunggu_evaluasi_diri", "evaluasi_diri_draf", "menunggu_penilaian", "penilaian_draf", "dikembalikan"].includes(row.status)).reduce((s, r) => s + r.total, 0);
  const verified = data.progress.filter((row) => ["terverifikasi", "final", "dipublikasikan"].includes(row.status)).reduce((s, r) => s + r.total, 0);
  const published = data.progress.filter((row) => row.status === "dipublikasikan").reduce((s, r) => s + r.total, 0);

  return (
    <div>
      <PageTitle eyebrow={ROLE_LABEL[data.actor.effectiveRole]} title="Dasbor penilaian" />
      {data.activePeriod?.is_demo ? <Badge tone="gold">Periode contoh, bukan data produksi</Badge> : null}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Pegawai aktif" value={String(data.totalActive)} hint="Sesuai hak akses Anda" />
        <Stat label="Evaluasi diri selesai" value={`${Math.round((doneSelf / total) * 100)}%`} hint={`${doneSelf} dari ${data.progress.reduce((s, r) => s + r.total, 0)}`} />
        <Stat label="Penilaian atasan terkirim" value={`${Math.round((assessed / total) * 100)}%`} hint="Menunggu verifikasi atau lebih" />
        <Stat label="Terverifikasi / final" value={`${verified}`} hint={`${published} sudah dipublikasikan`} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <h2 className="font-display text-2xl text-forest">Progres periode</h2>
          <p className="mb-3 text-sm text-muted">{data.activePeriod?.name ?? "Belum ada periode"}</p>
          <div className="h-64">
            {progress.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progress}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-18} height={70} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total" fill="var(--color-forest)" radius={6} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted">Belum ada penugasan pada periode ini.</p>}
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="font-display text-2xl text-forest">Perlu pengembangan</h2>
          <p className="mb-3 text-sm text-muted">Kategori dengan nilai di bawah 80 pada hasil yang sudah dihitung. Bukan peringkat orang.</p>
          <ul className="space-y-2">
            {data.weak.length ? data.weak.map((item) => (
              <li key={item.name} className="flex items-center justify-between gap-3 text-sm">
                <span>{item.name}</span>
                <Badge>{item.total}</Badge>
              </li>
            )) : <li className="text-sm text-muted">Belum ada hasil untuk dianalisis.</li>}
          </ul>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-display text-2xl text-forest">Pegawai per unit</h2>
          <ul className="space-y-2 text-sm">
            {data.byUnit.map((row) => (
              <li key={`${row.unit_id}-${row.group_code}`} className="flex justify-between gap-3 border-b border-sand py-2">
                <span>{row.unit_name}</span>
                <span className="text-muted">{GROUP_LABEL[row.group_code] ?? row.group_code} · {row.total}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="mb-3 font-display text-2xl text-forest">Yang perlu ditindaklanjuti</h2>
          <ul className="space-y-2 text-sm">
            {data.queue.length ? data.queue.map((row) => (
              <li key={row.id} className="rounded-2xl bg-cream px-3 py-2">
                <p className="font-semibold">{row.employee_name}</p>
                <p className="text-muted">{row.unit_name} · {ASSIGNMENT_STATUS_LABEL[row.status] ?? row.status}</p>
              </li>
            )) : <li className="text-muted">Tidak ada antrean.</li>}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card>
      <p className="text-xs font-semibold tracking-[0.14em] text-gold uppercase">{label}</p>
      <p className="font-display mt-1 text-3xl text-forest">{value}</p>
      <p className="text-sm text-muted">{hint}</p>
    </Card>
  );
}
