// @ts-nocheck
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Card, Empty, Field, Modal, PageTitle, errorText, inputClass } from "@/components/kit";
import { GROUP_LABEL, PERIOD_STATUS_LABEL, UNIT_LEVEL_LABEL } from "@/lib/ypit/labels";
import {
  cloneVersionFn, importEmployeesFn, listEmployeesFn, listInstrumentsFn, listPeriodsFn, listPositionsFn,
  listUnitsFn, orgTreeFn, refreshAssignmentsFn, saveCategoryWeightFn, saveEmployeeFn, savePeriodFn,
  savePositionFn, saveUnitFn, setEmployeeActiveFn, setPeriodStatusFn, setPositionActiveFn, setUnitActiveFn,
} from "@/lib/ypit/server";

type Row = Record<string, unknown>;
const str = (row: Row, key: string) => String(row[key] ?? "");

export function PegawaiPage() {
  const client = useQueryClient();
  const [q, setQ] = useState("");
  const [unitId, setUnitId] = useState("");
  const [group, setGroup] = useState("");
  const [active, setActive] = useState("aktif");
  const [editing, setEditing] = useState<Row | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const units = useQuery({ queryKey: ["units"], queryFn: () => listUnitsFn() });
  const positions = useQuery({ queryKey: ["positions"], queryFn: () => listPositionsFn() });
  const employees = useQuery({ queryKey: ["employees", q, unitId, group, active], queryFn: () => listEmployeesFn({ data: { q, unitId, group, active } }) });
  const rows = (employees.data ?? []) as Row[];
  return (
    <div>
      <PageTitle eyebrow="Data induk" title="Pegawai" action={<div className="flex gap-2"><Button variant="line" onClick={() => setImportOpen(true)}>Impor CSV</Button><Button onClick={() => setEditing({})}>Tambah pegawai</Button></div>} />
      <div className="mb-4 grid gap-2 md:grid-cols-4">
        <input className={inputClass} placeholder="Cari nama atau kode" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={inputClass} value={unitId} onChange={(e) => setUnitId(e.target.value)}>
          <option value="">Semua unit</option>
          {(units.data ?? []).map((unit) => <option key={str(unit as Row, "id")} value={str(unit as Row, "id")}>{str(unit as Row, "name")}</option>)}
        </select>
        <select className={inputClass} value={group} onChange={(e) => setGroup(e.target.value)}>
          <option value="">Semua kelompok</option>
          <option value="guru">Guru</option>
          <option value="tendik">Tenaga kependidikan</option>
          <option value="pimpinan">Pimpinan</option>
        </select>
        <select className={inputClass} value={active} onChange={(e) => setActive(e.target.value)}>
          <option value="">Semua status</option>
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Tidak aktif</option>
        </select>
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-muted"><tr><th className="py-2">Kode</th><th>Nama</th><th>Unit</th><th>Jabatan</th><th>Penilai</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={str(row, "id")} className="border-t border-sand">
                <td className="py-3 font-semibold">{str(row, "code")} {row.is_demo ? <Badge tone="gold">Demo</Badge> : null}</td>
                <td>{str(row, "full_name")}</td>
                <td>{str(row, "unit_name")}</td>
                <td>{str(row, "position_name")}<div className="text-xs text-muted">{GROUP_LABEL[str(row, "group_code")] ?? str(row, "group_code")}</div></td>
                <td>{str(row, "assessor_name") || "—"}</td>
                <td>{row.active ? "Aktif" : "Tidak aktif"}</td>
                <td><Button variant="ghost" onClick={() => setEditing(row)}>Ubah</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length ? <Empty>Tidak ada pegawai pada filter ini.</Empty> : null}
      </Card>
      {editing ? <EmployeeForm row={editing} units={(units.data ?? []) as Row[]} positions={(positions.data ?? []) as Row[]} people={rows} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); void client.invalidateQueries({ queryKey: ["employees"] }); }} /> : null}
      {importOpen ? <ImportDialog onClose={() => setImportOpen(false)} /> : null}
    </div>
  );
}

function EmployeeForm({ row, units, positions, people, onClose, onSaved }: { row: Row; units: Row[]; positions: Row[]; people: Row[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    code: str(row, "code"),
    fullName: str(row, "full_name"),
    unitId: str(row, "unit_id"),
    positionId: str(row, "position_id"),
    groupCode: (str(row, "group_code") || "guru") as "guru" | "tendik" | "pimpinan",
    employmentStatus: str(row, "employment_status") || "tetap",
    startDate: str(row, "start_date").slice(0, 10),
    supervisorId: str(row, "supervisor_id") || "",
    assessorId: str(row, "assessor_id") || "",
    verifierId: str(row, "verifier_id") || "",
    email: str(row, "email"),
    notes: str(row, "notes"),
    active: row.active !== false,
    includeInAssessment: row.include_in_assessment !== false,
    responsibility: ((row.responsibilities as Array<{ key: string }> | undefined) ?? []).map((item) => item.key).join(", "),
  });
  const set = (key: keyof typeof form, value: string | boolean) => setForm((prev) => ({ ...prev, [key]: value }));
  return (
    <Modal title={row.id ? "Ubah pegawai" : "Tambah pegawai"} onClose={onClose}>
      <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => {
        event.preventDefault();
        void saveEmployeeFn({
          data: {
            id: row.id ? str(row, "id") : undefined,
            ...form,
            supervisorId: form.supervisorId || null,
            assessorId: form.assessorId || null,
            verifierId: form.verifierId || null,
            responsibilities: form.responsibility.split(",").map((key) => key.trim()).filter(Boolean).map((key) => ({ key, label: key })),
          },
        }).then(() => { toast.success("Data pegawai disimpan."); onSaved(); }).catch((error) => toast.error(errorText(error)));
      }}>
        <Field label="Kode"><input className={inputClass} value={form.code} onChange={(e) => set("code", e.target.value)} required /></Field>
        <Field label="Nama lengkap"><input className={inputClass} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} required /></Field>
        <Field label="Unit"><select className={inputClass} value={form.unitId} onChange={(e) => set("unitId", e.target.value)} required><option value="">Pilih</option>{units.map((unit) => <option key={str(unit, "id")} value={str(unit, "id")}>{str(unit, "name")}</option>)}</select></Field>
        <Field label="Jabatan"><select className={inputClass} value={form.positionId} onChange={(e) => set("positionId", e.target.value)} required><option value="">Pilih</option>{positions.map((position) => <option key={str(position, "id")} value={str(position, "id")}>{str(position, "name")}</option>)}</select></Field>
        <Field label="Kelompok"><select className={inputClass} value={form.groupCode} onChange={(e) => set("groupCode", e.target.value)}><option value="guru">Guru</option><option value="tendik">Tenaga kependidikan</option><option value="pimpinan">Pimpinan</option></select></Field>
        <Field label="Status kepegawaian"><select className={inputClass} value={form.employmentStatus} onChange={(e) => set("employmentStatus", e.target.value)}><option value="tetap">Tetap</option><option value="kontrak">Kontrak</option><option value="honorer">Honorer</option></select></Field>
        <Field label="Mulai bekerja"><input className={inputClass} type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} /></Field>
        <Field label="Surel"><input className={inputClass} value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
        <Field label="Atasan langsung"><select className={inputClass} value={form.supervisorId} onChange={(e) => set("supervisorId", e.target.value)}><option value="">Belum ditetapkan</option>{people.map((person) => <option key={str(person, "id")} value={str(person, "id")}>{str(person, "full_name")}</option>)}</select></Field>
        <Field label="Penilai"><select className={inputClass} value={form.assessorId} onChange={(e) => set("assessorId", e.target.value)}><option value="">Belum ditetapkan</option>{people.map((person) => <option key={str(person, "id")} value={str(person, "id")}>{str(person, "full_name")}</option>)}</select></Field>
        <Field label="Verifikator"><select className={inputClass} value={form.verifierId} onChange={(e) => set("verifierId", e.target.value)}><option value="">Belum ditetapkan</option>{people.map((person) => <option key={str(person, "id")} value={str(person, "id")}>{str(person, "full_name")}</option>)}</select></Field>
        <Field label="Tanggung jawab khusus"><input className={inputClass} value={form.responsibility} onChange={(e) => set("responsibility", e.target.value)} placeholder="contoh: tahfiz" /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.includeInAssessment} onChange={(e) => set("includeInAssessment", e.target.checked)} /> Ikut penilaian</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} /> Aktif</label>
        <div className="md:col-span-2 flex gap-2">
          <Button type="submit">Simpan</Button>
          {row.id ? <Button type="button" variant="line" onClick={() => void setEmployeeActiveFn({ data: { id: str(row, "id"), active: !form.active } }).then(onSaved)}> {form.active ? "Nonaktifkan" : "Aktifkan"}</Button> : null}
        </div>
      </form>
    </Modal>
  );
}

function ImportDialog({ onClose }: { onClose: () => void }) {
  const client = useQueryClient();
  const [csv, setCsv] = useState("kode,nama,unit,jabatan,kelompok,status,mulai,penilai,verifikator\n");
  const [preview, setPreview] = useState<Array<{ line: number; ok: boolean; message: string; code: string; name: string }>>([]);
  return (
    <Modal title="Impor pegawai" onClose={onClose}>
      <p className="mb-3 text-sm text-muted">Kolom: kode, nama, unit, jabatan, kelompok, status, mulai, atasan, penilai, verifikator, email, tanggung_jawab. Unit dan jabatan diisi kode yang sudah ada. Baris duplikat ditolak.</p>
      <textarea className={inputClass} rows={8} value={csv} onChange={(e) => setCsv(e.target.value)} />
      <div className="mt-3 flex gap-2">
        <Button variant="line" onClick={() => void importEmployeesFn({ data: { csv, commit: false } }).then((result) => setPreview(result.preview)).catch((error) => toast.error(errorText(error)))}>Periksa</Button>
        <Button onClick={() => void importEmployeesFn({ data: { csv, commit: true } }).then((result) => { toast.success(`${result.imported} pegawai diimpor.`); void client.invalidateQueries({ queryKey: ["employees"] }); onClose(); }).catch((error) => toast.error(errorText(error)))}>Impor</Button>
      </div>
      <ul className="mt-3 space-y-1 text-sm">{preview.map((row) => <li key={row.line} className={row.ok ? "text-moss" : "text-danger"}>Baris {row.line}: {row.code} {row.name} — {row.message}</li>)}</ul>
    </Modal>
  );
}

export function UnitPage() {
  const client = useQueryClient();
  const units = useQuery({ queryKey: ["units"], queryFn: () => listUnitsFn() });
  const [form, setForm] = useState({ id: "", code: "", name: "", levelCode: "sd", address: "", phone: "", email: "", headTitle: "", headName: "", parentId: "yayasan" });
  return (
    <div>
      <PageTitle eyebrow="Organisasi" title="Unit pendidikan" />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted"><tr><th className="py-2">Unit</th><th>Aktif</th><th>Pegawai</th><th></th></tr></thead>
            <tbody>
              {((units.data ?? []) as Row[]).map((unit) => (
                <tr key={str(unit, "id")} className="border-t border-sand">
                  <td className="py-3"><p className="font-semibold">{str(unit, "name")}</p><p className="text-xs text-muted">{str(unit, "head_title")} {str(unit, "head_name")}</p></td>
                  <td>{unit.active ? "Aktif" : "Tidak aktif"}</td>
                  <td>{String(unit.active_employees ?? 0)}</td>
                  <td className="space-x-2">
                    <Button variant="ghost" onClick={() => setForm({ id: str(unit, "id"), code: str(unit, "code"), name: str(unit, "name"), levelCode: str(unit, "level_code"), address: str(unit, "address"), phone: str(unit, "phone"), email: str(unit, "email"), headTitle: str(unit, "head_title"), headName: str(unit, "head_name"), parentId: str(unit, "parent_id") || "yayasan" })}>Ubah</Button>
                    {str(unit, "id") !== "yayasan" ? <Button variant="ghost" onClick={() => void setUnitActiveFn({ data: { id: str(unit, "id"), active: !unit.active } }).then(() => client.invalidateQueries({ queryKey: ["units"] }))}>{unit.active ? "Nonaktifkan" : "Aktifkan"}</Button> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card>
          <h2 className="font-display text-2xl text-forest">{form.id ? "Ubah unit" : "Unit baru"}</h2>
          <form className="mt-3 space-y-3" onSubmit={(event) => {
            event.preventDefault();
            void saveUnitFn({ data: { ...form, id: form.id || undefined, parentId: form.parentId || null } }).then(() => { toast.success("Unit disimpan. Unit yang punya riwayat tidak dihapus."); setForm({ id: "", code: "", name: "", levelCode: "sd", address: "", phone: "", email: "", headTitle: "", headName: "", parentId: "yayasan" }); void client.invalidateQueries({ queryKey: ["units"] }); }).catch((error) => toast.error(errorText(error)));
          }}>
            <Field label="Kode"><input className={inputClass} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required /></Field>
            <Field label="Nama"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
            <Field label="Jenjang"><select className={inputClass} value={form.levelCode} onChange={(e) => setForm({ ...form, levelCode: e.target.value })}>{Object.entries(UNIT_LEVEL_LABEL).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></Field>
            <Field label="Jabatan pimpinan"><input className={inputClass} value={form.headTitle} onChange={(e) => setForm({ ...form, headTitle: e.target.value })} /></Field>
            <Field label="Nama pimpinan"><input className={inputClass} value={form.headName} onChange={(e) => setForm({ ...form, headName: e.target.value })} placeholder="Isi jika sudah ditetapkan" /></Field>
            <Field label="Alamat"><input className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
            <Field label="Telepon"><input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Button type="submit">Simpan</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export function JabatanPage() {
  const client = useQueryClient();
  const positions = useQuery({ queryKey: ["positions"], queryFn: () => listPositionsFn() });
  const [form, setForm] = useState({ id: "", code: "", name: "", groupCode: "guru" as "guru" | "tendik" | "pimpinan", description: "" });
  return (
    <div>
      <PageTitle eyebrow="Organisasi" title="Jabatan" />
      <p className="mb-4 max-w-3xl text-sm text-muted">Penilai dan verifikator ditetapkan pada data pegawai, bukan pada jabatan semata, agar tidak terjadi penilaian terhadap diri sendiri.</p>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          {((positions.data ?? []) as Row[]).map((position) => (
            <div key={str(position, "id")} className="flex flex-wrap items-center justify-between gap-2 border-b border-sand py-3">
              <div><p className="font-semibold">{str(position, "name")}</p><p className="text-xs text-muted">{GROUP_LABEL[str(position, "group_code")]} · {position.active ? "Aktif" : "Tidak aktif"}</p></div>
              <div>
                <Button variant="ghost" onClick={() => setForm({ id: str(position, "id"), code: str(position, "code"), name: str(position, "name"), groupCode: str(position, "group_code") as "guru", description: str(position, "description") })}>Ubah</Button>
                <Button variant="ghost" onClick={() => void setPositionActiveFn({ data: { id: str(position, "id"), active: !position.active } }).then(() => client.invalidateQueries({ queryKey: ["positions"] }))}>{position.active ? "Nonaktifkan" : "Aktifkan"}</Button>
              </div>
            </div>
          ))}
        </Card>
        <Card>
          <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); void savePositionFn({ data: { ...form, id: form.id || undefined } }).then(() => { toast.success("Jabatan disimpan."); void client.invalidateQueries({ queryKey: ["positions"] }); }).catch((error) => toast.error(errorText(error))); }}>
            <Field label="Kode"><input className={inputClass} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required /></Field>
            <Field label="Nama"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
            <Field label="Kelompok"><select className={inputClass} value={form.groupCode} onChange={(e) => setForm({ ...form, groupCode: e.target.value as "guru" })}><option value="guru">Guru</option><option value="tendik">Tenaga kependidikan</option><option value="pimpinan">Pimpinan</option></select></Field>
            <Field label="Keterangan"><input className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <Button type="submit">Simpan</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export function OrganisasiPage() {
  const tree = useQuery({ queryKey: ["org"], queryFn: () => orgTreeFn() });
  const units = ((tree.data?.units ?? []) as Row[]);
  const counts = (tree.data?.counts ?? []) as Array<{ unit_id: string; group_code: string; total: number }>;
  return (
    <div>
      <PageTitle eyebrow="Yayasan" title="Struktur organisasi" />
      <div className="space-y-3">
        {units.filter((unit) => !unit.parent_id).map((root) => (
          <Card key={str(root, "id")}>
            <h2 className="font-display text-2xl text-forest">{str(root, "name")}</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {units.filter((unit) => unit.parent_id === root.id).map((unit) => (
                <div key={str(unit, "id")} className="rounded-2xl bg-cream p-4">
                  <p className="font-semibold">{str(unit, "name")}</p>
                  <p className="text-xs text-muted">{unit.active ? "Aktif" : "Tidak aktif"} · {UNIT_LEVEL_LABEL[str(unit, "level_code")] ?? str(unit, "level_code")}</p>
                  <ul className="mt-2 text-sm text-muted">
                    {counts.filter((count) => count.unit_id === unit.id).map((count) => <li key={count.group_code}>{GROUP_LABEL[count.group_code] ?? count.group_code}: {count.total}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function PeriodePage() {
  const client = useQueryClient();
  const data = useQuery({ queryKey: ["periods"], queryFn: () => listPeriodsFn() });
  const instruments = useQuery({ queryKey: ["instruments"], queryFn: () => listInstrumentsFn() });
  const periods = ((data.data?.periods ?? []) as Row[]);
  const versions = ((instruments.data?.versions ?? []) as Row[]);
  const [form, setForm] = useState({ id: "", name: "", academicYear: "2026/2027", semester: 1, startDate: "2027-01-05", endDate: "2027-06-19", selfStart: "2027-05-01", selfEnd: "2027-05-20", assessorStart: "2027-05-21", assessorEnd: "2027-06-05", verifyStart: "2027-06-06", verifyEnd: "2027-06-15", finalizeDeadline: "2027-06-19", versions: { guru: "ver_guru_1", tendik: "ver_tendik_1", pimpinan: "ver_pimpinan_1" } });
  const versionOptions = useMemo(() => versions, [versions]);
  return (
    <div>
      <PageTitle eyebrow="Siklus semester" title="Periode penilaian" />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {periods.map((period) => (
            <Card key={str(period, "id")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap gap-2"><h2 className="font-display text-2xl text-forest">{str(period, "name")}</h2>{period.is_demo ? <Badge tone="gold">Contoh</Badge> : null}<Badge>{PERIOD_STATUS_LABEL[str(period, "status")] ?? str(period, "status")}</Badge></div>
                  <p className="text-sm text-muted">Tahun ajaran {str(period, "academic_year")} · Semester {String(period.semester)}</p>
                  <p className="text-sm text-muted">Evaluasi diri {String(period.self_start).slice(0, 10)} s.d. {String(period.self_end).slice(0, 10)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {period.status === "persiapan" ? <Button onClick={() => void change(str(period, "id"), "berlangsung", "")}>Buka periode</Button> : null}
                  {period.status !== "ditutup" && period.status !== "persiapan" ? <Button variant="line" onClick={() => { const reason = window.prompt("Alasan penutupan") ?? ""; if (reason.trim()) void change(str(period, "id"), "ditutup", reason); }}>Tutup</Button> : null}
                  {period.status === "ditutup" ? <Button variant="line" onClick={() => { const reason = window.prompt("Alasan pembukaan kembali") ?? ""; if (reason.trim()) void change(str(period, "id"), "berlangsung", reason); }}>Buka kembali</Button> : null}
                  <Button variant="ghost" onClick={() => void refreshAssignmentsFn({ data: str(period, "id") }).then(() => toast.success("Penugasan diperbarui."))}>Perbarui penugasan</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <Card>
          <h2 className="font-display text-2xl text-forest">Periode baru</h2>
          <form className="mt-3 space-y-2" onSubmit={(event) => {
            event.preventDefault();
            void savePeriodFn({ data: form }).then(() => { toast.success("Periode disimpan."); void client.invalidateQueries({ queryKey: ["periods"] }); }).catch((error) => toast.error(errorText(error)));
          }}>
            <Field label="Nama"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
            <Field label="Tahun ajaran"><input className={inputClass} value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} /></Field>
            <Field label="Semester"><select className={inputClass} value={form.semester} onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}><option value={1}>1</option><option value={2}>2</option></select></Field>
            {(["startDate", "endDate", "selfStart", "selfEnd", "assessorStart", "assessorEnd", "verifyStart", "verifyEnd", "finalizeDeadline"] as const).map((key) => (
              <Field key={key} label={key}><input type="date" className={inputClass} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></Field>
            ))}
            {(["guru", "tendik", "pimpinan"] as const).map((audience) => (
              <Field key={audience} label={`Versi instrumen ${audience}`}>
                <select className={inputClass} value={form.versions[audience]} onChange={(e) => setForm({ ...form, versions: { ...form.versions, [audience]: e.target.value } })}>
                  {versionOptions.filter((version) => str(version, "template_id") === `tpl_${audience}`).map((version) => <option key={str(version, "id")} value={str(version, "id")}>{str(version, "label")} · {str(version, "status")}</option>)}
                </select>
              </Field>
            ))}
            <Button type="submit">Simpan draf periode</Button>
          </form>
        </Card>
      </div>
    </div>
  );
  function change(periodId: string, status: string, reason: string) {
    return setPeriodStatusFn({ data: { periodId, status, reason } }).then(() => { toast.success("Status periode diperbarui."); void client.invalidateQueries({ queryKey: ["periods"] }); }).catch((error) => toast.error(errorText(error)));
  }
}

export function InstrumenPage() {
  const client = useQueryClient();
  const data = useQuery({ queryKey: ["instruments"], queryFn: () => listInstrumentsFn() });
  const templates = ((data.data?.templates ?? []) as Row[]);
  const versions = ((data.data?.versions ?? []) as Row[]);
  const categories = ((data.data?.categories ?? []) as Row[]);
  const indicators = ((data.data?.indicators ?? []) as Row[]);
  const [versionId, setVersionId] = useState("ver_guru_1");
  const cats = categories.filter((category) => category.version_id === versionId);
  const total = cats.reduce((sum, category) => sum + Number(category.weight), 0);
  return (
    <div>
      <PageTitle eyebrow="Instrumen" title="Template dan indikator" action={<Button variant="line" onClick={() => void cloneVersionFn({ data: versionId }).then(() => { toast.success("Versi baru disalin sebagai draf."); void client.invalidateQueries({ queryKey: ["instruments"] }); }).catch((error) => toast.error(errorText(error)))}>Salin versi</Button>} />
      <div className="mb-4 flex flex-wrap gap-2">
        {versions.map((version) => <Button key={str(version, "id")} variant={versionId === version.id ? "primary" : "line"} onClick={() => setVersionId(str(version, "id"))}>{templates.find((template) => template.id === version.template_id)?.name as string} · {str(version, "label")} · {str(version, "status")}</Button>)}
      </div>
      <p className="mb-3 text-sm">Total bobot kategori: <strong>{total}%</strong> {Math.abs(total - 100) < 0.05 ? <Badge tone="forest">Siap</Badge> : <Badge tone="danger">Harus 100%</Badge>}</p>
      <div className="space-y-3">
        {cats.map((category) => (
          <Card key={str(category, "id")}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-xl text-forest">{str(category, "name")}</h2>
              <span className="text-sm text-muted">Bobot {String(category.weight)}%</span>
            </div>
            <ul className="mt-2 space-y-1 text-sm">
              {indicators.filter((indicator) => indicator.category_id === category.id).map((indicator) => (
                <li key={str(indicator, "id")} className="flex justify-between gap-3 border-t border-sand py-2">
                  <span>{str(indicator, "name")}<span className="block text-xs text-muted">{indicator.unit_scope !== "all" ? `Khusus ${String(indicator.unit_scope)}` : "Umum"}{indicator.responsibility_key ? ` · tugas ${String(indicator.responsibility_key)}` : ""}{indicator.position_codes ? ` · jabatan ${String(indicator.position_codes)}` : ""}</span></span>
                  <span className="text-muted">{String(indicator.weight)}</span>
                </li>
              ))}
            </ul>
            <WeightEditor category={category} onSaved={() => void client.invalidateQueries({ queryKey: ["instruments"] })} />
          </Card>
        ))}
      </div>
    </div>
  );
}

function WeightEditor({ category, onSaved }: { category: Row; onSaved: () => void }) {
  const [weight, setWeight] = useState(String(category.weight));
  const [name, setName] = useState(str(category, "name"));
  return (
    <form className="mt-3 flex flex-wrap gap-2" onSubmit={(event) => { event.preventDefault(); void saveCategoryWeightFn({ data: { categoryId: str(category, "id"), weight: Number(weight), name } }).then((result) => { toast.success(result.ok ? "Bobot tersimpan, total 100%." : `Tersimpan. Total saat ini ${result.total}%.`); onSaved(); }).catch((error) => toast.error(errorText(error))); }}>
      <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
      <input className={`${inputClass} max-w-28`} type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
      <Button type="submit" variant="line">Simpan bobot</Button>
    </form>
  );
}
