// @ts-nocheck
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Card, Empty, Field, PageTitle, downloadBase64, errorText, inputClass } from "@/components/kit";
import { PLAN_STATUS_LABEL, ROLE_LABEL } from "@/lib/ypit/labels";
import {
  buildReportFn, exportBackupFn, exportReportFn, getInstitutionFn, listAuditFn, listBandsFn, listEmployeesFn,
  listNotificationsFn, listPlansFn, listPeriodsFn, listUsersFn, markNotificationFn, saveBandsFn, saveInstitutionFn,
  savePlanFn, scoreTestFn, updateUserAccessFn,
} from "@/lib/ypit/server";
import type { Role } from "@/lib/ypit/labels";

type Row = Record<string, unknown>;
const str = (row: Row, key: string) => String(row[key] ?? "");

export function PengembanganPage() {
  const client = useQueryClient();
  const plans = useQuery({ queryKey: ["plans"], queryFn: () => listPlansFn() });
  const people = useQuery({ queryKey: ["employees", "plans"], queryFn: () => listEmployeesFn({ data: { active: "aktif" } }) });
  const periods = useQuery({ queryKey: ["periods"], queryFn: () => listPeriodsFn() });
  const [form, setForm] = useState({ employeeId: "", periodId: "", aspect: "", gapFound: "", goal: "", activity: "", supportNeeded: "", ownerName: "", dueDate: "", successIndicator: "", status: "belum_dimulai", followUpNote: "" });
  return (
    <div>
      <PageTitle eyebrow="Tindak lanjut" title="Rencana pengembangan" />
      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {((plans.data ?? []) as Row[]).map((plan) => (
            <Card key={str(plan, "id")}>
              <div className="flex flex-wrap justify-between gap-2">
                <h2 className="font-display text-2xl text-forest">{str(plan, "aspect")}</h2>
                <Badge>{PLAN_STATUS_LABEL[str(plan, "status")] ?? str(plan, "status")}</Badge>
              </div>
              <p className="text-sm text-muted">{str(plan, "employee_name")} · {str(plan, "unit_name")}</p>
              <p className="mt-2 text-sm">{str(plan, "goal")}</p>
              <p className="text-sm text-muted">Aktivitas: {str(plan, "activity") || "—"} · Tenggat {str(plan, "due_date").slice(0, 10) || "—"}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.keys(PLAN_STATUS_LABEL).map((status) => (
                  <Button key={status} variant="ghost" onClick={() => void savePlanFn({ data: { id: str(plan, "id"), employeeId: str(plan, "employee_id"), assignmentId: str(plan, "assignment_id") || null, periodId: str(plan, "period_id") || null, aspect: str(plan, "aspect"), gapFound: str(plan, "gap_found"), goal: str(plan, "goal"), activity: str(plan, "activity"), supportNeeded: str(plan, "support_needed"), ownerName: str(plan, "owner_name"), dueDate: str(plan, "due_date").slice(0, 10), successIndicator: str(plan, "success_indicator"), status, followUpNote: "Pembaruan status" } }).then(() => { toast.success("Status diperbarui."); void client.invalidateQueries({ queryKey: ["plans"] }); })}>{PLAN_STATUS_LABEL[status]}</Button>
                ))}
              </div>
            </Card>
          ))}
          {!((plans.data ?? []) as Row[]).length ? <Empty>Belum ada rencana pengembangan.</Empty> : null}
        </div>
        <Card>
          <h2 className="font-display text-2xl text-forest">Rencana baru</h2>
          <form className="mt-3 space-y-2" onSubmit={(event) => { event.preventDefault(); void savePlanFn({ data: { ...form, assignmentId: null, periodId: form.periodId || null } }).then(() => { toast.success("Rencana disimpan."); void client.invalidateQueries({ queryKey: ["plans"] }); }).catch((error) => toast.error(errorText(error))); }}>
            <Field label="Pegawai"><select className={inputClass} value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required><option value="">Pilih</option>{((people.data ?? []) as Row[]).map((person) => <option key={str(person, "id")} value={str(person, "id")}>{str(person, "full_name")}</option>)}</select></Field>
            <Field label="Periode"><select className={inputClass} value={form.periodId} onChange={(e) => setForm({ ...form, periodId: e.target.value })}><option value="">Tidak diikat</option>{(((periods.data?.periods ?? []) as Row[])).map((period) => <option key={str(period, "id")} value={str(period, "id")}>{str(period, "name")}</option>)}</select></Field>
            {([["aspect", "Aspek"], ["gapFound", "Kesenjangan"], ["goal", "Tujuan"], ["activity", "Aktivitas"], ["supportNeeded", "Dukungan"], ["ownerName", "Penanggung jawab"], ["successIndicator", "Indikator keberhasilan"], ["followUpNote", "Catatan"]] as const).map(([key, label]) => (
              <Field key={key} label={label}><input className={inputClass} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></Field>
            ))}
            <Field label="Tenggat"><input type="date" className={inputClass} value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></Field>
            <Button type="submit">Simpan</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

const REPORTS = [
  ["individu", "Laporan individual"],
  ["rekap_kbtk", "Rekap KB-TK"],
  ["rekap_sd", "Rekap SD"],
  ["rekap_smptq", "Rekap SMPTQ"],
  ["rekap_yayasan", "Rekap yayasan"],
  ["kelompok", "Kelompok jabatan"],
  ["kategori", "Kategori indikator"],
  ["progres", "Progres"],
  ["kesenjangan", "Evaluasi diri vs atasan"],
  ["kebutuhan", "Kebutuhan pengembangan"],
  ["tindak_lanjut", "Tindak lanjut"],
  ["tren", "Tren antarsemester"],
] as const;

export function LaporanPage() {
  const periods = useQuery({ queryKey: ["periods"], queryFn: () => listPeriodsFn() });
  const people = useQuery({ queryKey: ["employees", "lap"], queryFn: () => listEmployeesFn({ data: {} }) });
  const [type, setType] = useState<string>("progres");
  const [periodId, setPeriodId] = useState("periode-demo-2026-1");
  const [employeeId, setEmployeeId] = useState("");
  const [group, setGroup] = useState("");
  const report = useQuery({ queryKey: ["report", type, periodId, employeeId, group], queryFn: () => buildReportFn({ data: { type, periodId, employeeId, group } }) });
  async function download(format: "pdf" | "xlsx") {
    try {
      const file = await exportReportFn({ data: { format, type, periodId, employeeId, group } });
      downloadBase64(file.filename, file.base64, file.mime);
    } catch (error) { toast.error(errorText(error)); }
  }
  const table = report.data;
  return (
    <div>
      <PageTitle eyebrow="Dokumen" title="Laporan" action={<div className="flex gap-2"><Button variant="line" onClick={() => void download("pdf")}>Unduh PDF</Button><Button onClick={() => void download("xlsx")}>Unduh Excel</Button></div>} />
      <div className="mb-4 grid gap-2 md:grid-cols-4">
        <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>{REPORTS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>
        <select className={inputClass} value={periodId} onChange={(e) => setPeriodId(e.target.value)}>{(((periods.data?.periods ?? []) as Row[])).map((period) => <option key={str(period, "id")} value={str(period, "id")}>{str(period, "name")}{period.is_demo ? " (contoh)" : ""}</option>)}</select>
        <select className={inputClass} value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}><option value="">Semua / tidak dipakai</option>{((people.data ?? []) as Row[]).map((person) => <option key={str(person, "id")} value={str(person, "id")}>{str(person, "full_name")}</option>)}</select>
        <select className={inputClass} value={group} onChange={(e) => setGroup(e.target.value)}><option value="">Semua kelompok</option><option value="guru">Guru</option><option value="tendik">Tenaga kependidikan</option><option value="pimpinan">Pimpinan</option></select>
      </div>
      <Card className="overflow-x-auto">
        {report.isLoading ? <p>Menyusun laporan…</p> : report.isError ? <p className="text-danger">{errorText(report.error)}</p> : table ? (
          <>
            <h2 className="font-display text-2xl text-forest">{table.title}</h2>
            <p className="mb-3 text-sm text-muted">{table.subtitle}</p>
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead><tr>{table.columns.map((column) => <th key={column.key} className="py-2">{column.label}</th>)}</tr></thead>
              <tbody>{table.rows.map((row, index) => <tr key={index} className="border-t border-sand">{table.columns.map((column) => <td key={column.key} className="py-2 pr-3">{String(row[column.key] ?? "")}</td>)}</tr>)}</tbody>
            </table>
            {!table.rows.length ? <Empty>Tidak ada data pada filter ini.</Empty> : null}
          </>
        ) : null}
      </Card>
    </div>
  );
}

export function NotifikasiPage() {
  const client = useQueryClient();
  const notes = useQuery({ queryKey: ["notifications"], queryFn: () => listNotificationsFn() });
  return (
    <div>
      <PageTitle eyebrow="Pengingat" title="Notifikasi" action={<Button variant="line" onClick={() => void markNotificationFn({ data: null }).then(() => client.invalidateQueries({ queryKey: ["notifications"] }))}>Tandai dibaca</Button>} />
      <div className="space-y-2">
        {((notes.data ?? []) as Row[]).map((note) => (
          <a key={str(note, "id")} href={str(note, "href") || "/"} className="block rounded-2xl border border-line bg-paper px-4 py-3" onClick={() => void markNotificationFn({ data: str(note, "id") })}>
            <div className="flex items-center justify-between gap-2"><p className="font-semibold">{str(note, "title")}</p>{note.read_at ? null : <Badge tone="gold">Baru</Badge>}</div>
            <p className="text-sm text-muted">{str(note, "body")}</p>
          </a>
        ))}
        {!((notes.data ?? []) as Row[]).length ? <Empty>Belum ada notifikasi.</Empty> : null}
      </div>
    </div>
  );
}

export function AuditPage() {
  const logs = useQuery({ queryKey: ["audit"], queryFn: () => listAuditFn() });
  return (
    <div>
      <PageTitle eyebrow="Keamanan" title="Audit log" />
      <Card className="overflow-x-auto">
        {logs.isError ? <p className="text-danger">{errorText(logs.error)}</p> : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead><tr><th className="py-2">Waktu</th><th>Aksi</th><th>Objek</th><th>Alasan</th></tr></thead>
            <tbody>{((logs.data ?? []) as Row[]).map((log) => <tr key={str(log, "id")} className="border-t border-sand"><td className="py-2">{str(log, "created_at").replace("T", " ").slice(0, 19)}</td><td>{str(log, "action")}</td><td>{str(log, "entity_type")} {str(log, "entity_id")}</td><td>{str(log, "reason")}</td></tr>)}</tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

export function PengaturanPage() {
  const client = useQueryClient();
  const settings = useQuery({ queryKey: ["settings"], queryFn: () => getInstitutionFn() });
  const users = useQuery({ queryKey: ["users"], queryFn: () => listUsersFn() });
  const bands = useQuery({ queryKey: ["bands"], queryFn: () => listBandsFn() });
  const people = useQuery({ queryKey: ["employees", "users"], queryFn: () => listEmployeesFn({ data: {} }) });
  const units = ((people.data ?? []) as Row[]);
  const [form, setForm] = useState<Record<string, string> | null>(null);
  const current = form ?? (settings.data as unknown as Record<string, string> | null);
  const tests = useQuery({ queryKey: ["score-test"], queryFn: () => scoreTestFn() });
  if (!current) return <p className="text-muted">Memuat pengaturan…</p>;
  return (
    <div className="space-y-4">
      <PageTitle eyebrow="Administrator" title="Pengaturan" />
      <Card>
        <h2 className="font-display text-2xl text-forest">Identitas lembaga</h2>
        <p className="mb-3 text-sm text-muted">Nama pimpinan, alamat, dan logo tidak diisi otomatis. Lengkapi di sini. Logo resmi hanya dipakai jika Anda mengunggahnya.</p>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); void saveInstitutionFn({ data: current as never }).then(() => { toast.success("Pengaturan disimpan."); void client.invalidateQueries({ queryKey: ["settings"] }); }).catch((error) => toast.error(errorText(error))); }}>
          {([["foundation_name", "Nama yayasan"], ["short_name", "Singkatan"], ["app_name", "Nama aplikasi"], ["head_title", "Jabatan pimpinan"], ["head_name", "Nama pimpinan"], ["address", "Alamat"], ["phone", "Telepon"], ["email", "Surel"]] as const).map(([key, label]) => (
            <Field key={key} label={label}><input className={inputClass} value={current[key] ?? ""} onChange={(e) => setForm({ ...current, [key]: e.target.value })} /></Field>
          ))}
          <Field label="Logo"><input className={inputClass} type="file" accept="image/*" onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => setForm({ ...current, logo_data_url: String(reader.result ?? "") });
            reader.readAsDataURL(file);
          }} /></Field>
          <div className="md:col-span-2"><Button type="submit">Simpan identitas</Button></div>
        </form>
      </Card>
      <Card className="overflow-x-auto">
        <h2 className="font-display text-2xl text-forest">Akun dan peran</h2>
        <table className="mt-3 w-full min-w-[720px] text-left text-sm">
          <thead><tr><th>Nama</th><th>Peran</th><th>Pegawai terhubung</th><th>Lintas unit</th><th></th></tr></thead>
          <tbody>
            {((users.data ?? []) as Row[]).map((user) => <UserRow key={str(user, "user_id")} user={user} people={units} onSaved={() => void client.invalidateQueries({ queryKey: ["users"] })} />)}
          </tbody>
        </table>
        {users.isError ? <p className="text-danger">{errorText(users.error)}</p> : null}
      </Card>
      <Card>
        <h2 className="font-display text-2xl text-forest">Batas kategori hasil</h2>
        <ul className="my-2 text-sm">{(bands.data ?? []).map((band) => <li key={band.label}>{band.min}–{band.max}: {band.label}</li>)}</ul>
        <Button variant="line" onClick={() => void saveBandsFn({ data: bands.data ?? [] }).then(() => toast.success("Batas tetap tersimpan.")).catch((error) => toast.error(errorText(error)))}>Kunci ulang batas saat ini</Button>
      </Card>
      <Card>
        <h2 className="font-display text-2xl text-forest">Uji hitung</h2>
        <ul className="mt-2 space-y-1 text-sm">{(tests.data ?? []).map((item) => <li key={item.name}>{item.pass ? "Lulus" : "Gagal"} · {item.name}: diharapkan {item.expected}, sistem {item.actual} ({item.label})</li>)}</ul>
        <Button className="mt-3" variant="line" onClick={() => void exportBackupFn().then((file) => downloadBase64(file.filename, file.base64, file.mime)).catch((error) => toast.error(errorText(error)))}>Unduh cadangan data</Button>
      </Card>
    </div>
  );
}

function UserRow({ user, people, onSaved }: { user: Row; people: Row[]; onSaved: () => void }) {
  const [role, setRole] = useState(str(user, "role"));
  const [employeeId, setEmployeeId] = useState(str(user, "employee_id"));
  const [crossUnit, setCrossUnit] = useState(Boolean(user.cross_unit));
  return (
    <tr className="border-t border-sand">
      <td className="py-2">{str(user, "full_name")}<div className="text-xs text-muted">{str(user, "email")}</div></td>
      <td><select className={inputClass} value={role} onChange={(e) => setRole(e.target.value)}>{(Object.keys(ROLE_LABEL) as Role[]).map((item) => <option key={item} value={item}>{ROLE_LABEL[item]}</option>)}</select></td>
      <td><select className={inputClass} value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}><option value="">Belum dihubungkan</option>{people.map((person) => <option key={str(person, "id")} value={str(person, "id")}>{str(person, "full_name")}</option>)}</select></td>
      <td><input type="checkbox" checked={crossUnit} onChange={(e) => setCrossUnit(e.target.checked)} /></td>
      <td><Button variant="ghost" onClick={() => void updateUserAccessFn({ data: { targetUserId: str(user, "user_id"), role: role as Role, unitId: null, employeeId: employeeId || null, crossUnit } }).then(() => { toast.success("Akses diperbarui."); onSaved(); }).catch((error) => toast.error(errorText(error)))}>Simpan</Button></td>
    </tr>
  );
}

export function PanduanPage() {
  return (
    <div className="space-y-4">
      <PageTitle eyebrow="Dokumentasi" title="Panduan penggunaan" />
      <Card>
        <h2 className="font-display text-2xl text-forest">Cara mulai</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
          <li>Daftar dengan surel. Akun pertama menjadi Super Administrator.</li>
          <li>Lengkapi identitas yayasan di Pengaturan. Nama pimpinan sengaja dikosongkan.</li>
          <li>Periksa tiga unit: KB-TK, SD, dan SMPTQ Islam Pangeran Diponegoro.</li>
          <li>Data bertanda Demo bukan pegawai sungguhan. Gunakan untuk mencoba alur, lalu isi data nyata.</li>
          <li>Super Administrator dapat masuk mode simulasi untuk melihat layar tiap peran. Tindakan tetap tercatat.</li>
          <li>Untuk peran sungguhan, minta pengguna mendaftar lalu hubungkan akunnya ke data pegawai.</li>
        </ol>
      </Card>
      <Card>
        <h2 className="font-display text-2xl text-forest">Alur persetujuan</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
          <li>Administrator menyiapkan periode, instrumen, dan penilai. Bobot kategori harus 100% sebelum periode dibuka.</li>
          <li>Pegawai mengisi evaluasi diri. Nilainya tidak digabung ke nilai akhir.</li>
          <li>Atasan memberi skor 1–5, catatan, bukti, dan rekomendasi secara independen.</li>
          <li>Indikator yang tidak berlaku wajib beralasan dan disetujui verifikator. Bobot kemudian dinormalisasi.</li>
          <li>Kepala unit menyetujui atau mengembalikan dengan alasan. Nilai dikunci saat verifikasi.</li>
          <li>Finalisasi lalu publikasi. Pegawai hanya melihat hasilnya sendiri setelah dipublikasikan.</li>
          <li>Perubahan nilai setelah verifikasi hanya lewat koreksi administratif yang menulis audit log.</li>
          <li>Kepala unit dinilai oleh penilai yayasan dan diverifikasi oleh orang yang berbeda.</li>
        </ol>
      </Card>
      <Card>
        <h2 className="font-display text-2xl text-forest">Rumus</h2>
        <p className="text-sm">Nilai indikator = (skor / 5) × 100. Nilai kategori = rata-rata tertimbang indikator yang berlaku. Nilai akhir = jumlah nilai kategori kali bobotnya. Jika ada indikator atau kategori yang disetujui tidak berlaku, bobot yang tersisa dinormalisasi. Batas awal: 90 sampai 100 Sangat Baik, 80 sampai kurang dari 90 Baik, 70 sampai kurang dari 80 Cukup, 60 sampai kurang dari 70 Perlu Pembinaan, di bawah 60 Memerlukan Evaluasi Intensif.</p>
      </Card>
      <Card>
        <h2 className="font-display text-2xl text-forest">Pencadangan</h2>
        <p className="text-sm">Super Administrator mengunduh cadangan JSON dari Pengaturan. Di lingkungan tayang, basis data juga dipulihkan dari cadangan platform. Jangan menghapus unit atau pegawai yang sudah punya riwayat; nonaktifkan saja. Periode yang ditutup mengunci hasil. Pembukaan kembali wajib beralasan.</p>
      </Card>
      <Card>
        <h2 className="font-display text-2xl text-forest">Yang belum otomatis</h2>
        <p className="text-sm">Pengingat berjalan saat dasbor dibuka, bukan sebagai jadwal server terpisah. Berkas bukti disimpan sebagai uraian teks, bukan unggahan besar, agar aman pada lingkungan tayang. Nama pimpinan dan logo resmi menunggu isian administrator.</p>
      </Card>
    </div>
  );
}
