// @ts-nocheck
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Card, Empty, Field, PageTitle, errorText, inputClass } from "@/components/kit";
import { ASSIGNMENT_STATUS_LABEL } from "@/lib/ypit/labels";
import {
  addClarificationFn, addEvidenceFn, correctScoreFn, decideNaFn, finalizeAssignmentFn, gapFn,
  getAssignmentFn, listAssignmentsFn, publishAssignmentFn, returnAssignmentFn, saveSelfFn, saveSupervisorFn, verifyAssignmentFn,
} from "@/lib/ypit/server";

type Mode = "self" | "assessor" | "verify" | "result";
const scopeOf: Record<Mode, "self" | "assessor" | "verify" | "results"> = {
  self: "self", assessor: "assessor", verify: "verify", result: "results",
};

type ScoreDraft = { score: string; isNa: boolean; naReason: string; note: string; evidenceNote: string; recommendation: string };

export function AssessPage({ mode }: { mode: Mode }) {
  const titles: Record<Mode, string> = { self: "Evaluasi diri", assessor: "Penilaian atasan", verify: "Verifikasi kepala unit", result: "Hasil penilaian" };
  const list = useQuery({ queryKey: ["assignments", mode], queryFn: () => listAssignmentsFn({ data: scopeOf[mode] }) });
  const rows = (list.data ?? []) as Array<Record<string, unknown>>;
  const [id, setId] = useState<string>("");
  useEffect(() => { if (!id && rows[0]?.id) setId(String(rows[0].id)); }, [rows, id]);
  return (
    <div>
      <PageTitle eyebrow="Alur penilaian" title={titles[mode]} />
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <Card className="max-h-[70vh] overflow-auto">
          {rows.length ? rows.map((row) => (
            <button key={String(row.id)} className={`mb-2 w-full rounded-2xl px-3 py-3 text-left ${id === row.id ? "bg-forest text-cream" : "bg-cream"}`} onClick={() => setId(String(row.id))}>
              <p className="font-semibold">{String(row.employee_name)}</p>
              <p className={`text-xs ${id === row.id ? "text-gold-soft" : "text-muted"}`}>{String(row.unit_name)} · {ASSIGNMENT_STATUS_LABEL[String(row.status)] ?? String(row.status)}</p>
              {row.is_demo ? <span className="text-xs">Data demo</span> : null}
            </button>
          )) : <Empty>Tidak ada penilaian pada kewenangan Anda.</Empty>}
        </Card>
        {id ? <Detail id={id} mode={mode} /> : <Empty>Pilih penilaian.</Empty>}
      </div>
    </div>
  );
}

function Detail({ id, mode }: { id: string; mode: Mode }) {
  const client = useQueryClient();
  const detail = useQuery({ queryKey: ["assignment", id], queryFn: () => getAssignmentFn({ data: id }) });
  const gap = useQuery({ queryKey: ["gap", id], queryFn: () => gapFn({ data: id }), enabled: mode === "result" });
  const data = detail.data as Record<string, unknown> | undefined;
  const indicators = (data?.indicators ?? []) as Array<Record<string, unknown>>;
  const permissions = (data?.permissions ?? {}) as Record<string, boolean>;
  const head = (data?.head ?? {}) as Record<string, unknown>;
  const self = (data?.self ?? {}) as Record<string, string>;
  const supervisor = (data?.supervisor ?? {}) as Record<string, string>;
  const [reflection, setReflection] = useState({ achievements: "", completedTasks: "", obstacles: "", competencies: "", trainingNeeds: "", nextTargets: "" });
  const [feedback, setFeedback] = useState({ overall: "", strengths: "", improvements: "" });
  const [scores, setScores] = useState<Record<string, ScoreDraft>>({});
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  useEffect(() => {
    if (!data) return;
    setReflection({
      achievements: self.achievements ?? "",
      completedTasks: self.completed_tasks ?? "",
      obstacles: self.obstacles ?? "",
      competencies: self.competencies_to_improve ?? "",
      trainingNeeds: self.training_needs ?? "",
      nextTargets: self.next_targets ?? "",
    });
    setFeedback({ overall: supervisor.overall_feedback ?? "", strengths: supervisor.strengths ?? "", improvements: supervisor.improvements ?? "" });
    const source = (mode === "self" ? data.selfScores : data.supervisorScores) as Array<Record<string, unknown>>;
    const next: Record<string, ScoreDraft> = {};
    for (const indicator of indicators) {
      const found = source.find((row) => row.indicator_id === indicator.id);
      next[String(indicator.id)] = {
        score: found?.score == null ? "" : String(found.score),
        isNa: Boolean(found?.is_na),
        naReason: String(found?.na_reason ?? ""),
        note: String(found?.note ?? ""),
        evidenceNote: String(found?.evidence_note ?? ""),
        recommendation: String(found?.recommendation ?? ""),
      };
    }
    setScores(next);
  }, [data, mode]);
  const grouped = useMemo(() => {
    const map = new Map<string, Array<Record<string, unknown>>>();
    for (const indicator of indicators) {
      const key = String(indicator.category_name);
      map.set(key, [...(map.get(key) ?? []), indicator]);
    }
    return [...map.entries()];
  }, [indicators]);
  if (detail.isLoading) return <p className="text-muted">Memuat formulir…</p>;
  if (!data) return <p className="text-danger">Formulir gagal dimuat.</p>;
  const official = data.official as { finalScore: number | null; label: string | null; warnings: string[]; categories: Array<{ name: string; score: number | null }> } | null;

  function payloadScores() {
    return indicators.map((indicator) => {
      const draft = scores[String(indicator.id)] ?? { score: "", isNa: false, naReason: "", note: "", evidenceNote: "", recommendation: "" };
      return { indicatorId: String(indicator.id), ...draft, score: draft.score ? Number(draft.score) : null };
    });
  }
  function refresh() { void client.invalidateQueries({ queryKey: ["assignment", id] }); void client.invalidateQueries({ queryKey: ["assignments"] }); void client.invalidateQueries({ queryKey: ["dashboard"] }); }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl text-forest">{String(head.employee_name)}</h2>
            <p className="text-sm text-muted">{String(head.position_name)} · {String(head.unit_name)} · {String(head.period_name)}</p>
            {head.is_demo ? <Badge tone="gold">Pegawai demo</Badge> : null}
          </div>
          <Badge>{ASSIGNMENT_STATUS_LABEL[String(head.status)] ?? String(head.status)}</Badge>
        </div>
        {head.hold_reason ? <p className="mt-2 text-sm text-danger">{String(head.hold_reason)}</p> : null}
        {official ? <p className="mt-3 text-sm">Nilai dihitung di server: <strong>{official.finalScore ?? "belum lengkap"}</strong> {official.label ? `· ${official.label}` : ""}</p> : <p className="mt-3 text-sm text-muted">Skor atasan ditampilkan setelah hasil dipublikasikan.</p>}
        {official?.warnings?.length ? <ul className="mt-2 text-sm text-muted">{official.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : null}
      </Card>
      {mode === "self" ? (
        <Card className="grid gap-3 md:grid-cols-2">
          {([
            ["achievements", "Pencapaian utama"],
            ["completedTasks", "Tugas yang berhasil diselesaikan"],
            ["obstacles", "Kendala"],
            ["competencies", "Kompetensi yang perlu ditingkatkan"],
            ["trainingNeeds", "Kebutuhan pelatihan"],
            ["nextTargets", "Target semester berikutnya"],
          ] as const).map(([key, label]) => (
            <Field key={key} label={label}><textarea className={inputClass} rows={3} value={reflection[key]} onChange={(e) => setReflection({ ...reflection, [key]: e.target.value })} /></Field>
          ))}
        </Card>
      ) : null}
      {mode !== "self" && mode !== "result" ? (
        <Card className="grid gap-3">
          <Field label="Umpan balik umum"><textarea className={inputClass} rows={3} value={feedback.overall} onChange={(e) => setFeedback({ ...feedback, overall: e.target.value })} /></Field>
          <Field label="Kekuatan"><textarea className={inputClass} rows={2} value={feedback.strengths} onChange={(e) => setFeedback({ ...feedback, strengths: e.target.value })} /></Field>
          <Field label="Aspek yang perlu diperbaiki"><textarea className={inputClass} rows={2} value={feedback.improvements} onChange={(e) => setFeedback({ ...feedback, improvements: e.target.value })} /></Field>
        </Card>
      ) : null}
      {grouped.map(([category, items]) => (
        <Card key={category}>
          <h3 className="font-display text-xl text-forest">{category}</h3>
          <div className="mt-3 space-y-4">
            {items.map((indicator) => {
              const key = String(indicator.id);
              const draft = scores[key] ?? { score: "", isNa: false, naReason: "", note: "", evidenceNote: "", recommendation: "" };
              const sup = ((data.supervisorScores as Array<Record<string, unknown>>) ?? []).find((row) => row.indicator_id === key);
              const editable = (mode === "self" && permissions.fillSelf) || (mode === "assessor" && permissions.fillAssessor);
              return (
                <div key={key} className="rounded-2xl bg-cream p-3">
                  <p className="font-semibold">{String(indicator.name)}</p>
                  <p className="mt-1 text-xs text-muted">1 {String(indicator.rubric_1)} · 3 {String(indicator.rubric_3)} · 5 {String(indicator.rubric_5)}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button key={score} type="button" disabled={!editable || draft.isNa} className={`grid h-11 w-11 place-items-center rounded-full border ${draft.score === String(score) ? "border-forest bg-forest text-cream" : "border-line bg-paper"}`} onClick={() => setScores((prev) => ({ ...prev, [key]: { ...(prev[key] ?? draft), score: String(score), isNa: false } }))}>{score}</button>
                    ))}
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" disabled={!editable} checked={draft.isNa} onChange={(e) => setScores({ ...scores, [key]: { ...draft, isNa: e.target.checked, score: "" } })} /> Tidak berlaku</label>
                    {sup?.na_status && sup.na_status !== "none" ? <Badge tone={sup.na_status === "approved" ? "forest" : sup.na_status === "rejected" ? "danger" : "gold"}>{String(sup.na_status)}</Badge> : null}
                  </div>
                  {draft.isNa ? <input className={`${inputClass} mt-2`} placeholder="Alasan tidak berlaku" value={draft.naReason} disabled={!editable} onChange={(e) => setScores({ ...scores, [key]: { ...draft, naReason: e.target.value } })} /> : null}
                  <textarea className={`${inputClass} mt-2`} rows={2} placeholder="Catatan" disabled={!editable && !permissions.correct} value={draft.note} onChange={(e) => setScores({ ...scores, [key]: { ...draft, note: e.target.value } })} />
                  {mode !== "self" ? <textarea className={`${inputClass} mt-2`} rows={2} placeholder="Bukti dan rekomendasi perbaikan" disabled={!editable} value={`${draft.evidenceNote}${draft.recommendation ? `\n${draft.recommendation}` : ""}`} onChange={(e) => setScores({ ...scores, [key]: { ...draft, evidenceNote: e.target.value, recommendation: "" } })} /> : null}
                  {permissions.verify && sup?.is_na && sup.na_status === "pending" ? (
                    <div className="mt-2 flex gap-2">
                      <Button variant="line" onClick={() => { const why = window.prompt("Alasan persetujuan N/A") ?? ""; if (why.trim()) void decideNaFn({ data: { assignmentId: id, indicatorId: key, approve: true, reason: why } }).then(refresh).catch((error) => toast.error(errorText(error))); }}>Setujui N/A</Button>
                      <Button variant="ghost" onClick={() => { const why = window.prompt("Alasan penolakan N/A") ?? ""; if (why.trim()) void decideNaFn({ data: { assignmentId: id, indicatorId: key, approve: false, reason: why } }).then(refresh).catch((error) => toast.error(errorText(error))); }}>Tolak N/A</Button>
                    </div>
                  ) : null}
                  {permissions.correct ? <Button className="mt-2" variant="ghost" onClick={() => { const why = window.prompt("Alasan koreksi administratif") ?? ""; if (!why.trim()) return; void correctScoreFn({ data: { assignmentId: id, indicatorId: key, score: draft.score ? Number(draft.score) : null, isNa: draft.isNa, naReason: draft.naReason, reason: why } }).then(() => { toast.success("Koreksi tercatat di audit."); refresh(); }).catch((error) => toast.error(errorText(error))); }}>Koreksi tercatat</Button> : null}
                </div>
              );
            })}
          </div>
        </Card>
      ))}
      <Card className="flex flex-wrap gap-2">
        {permissions.fillSelf ? <>
          <Button variant="line" onClick={() => void saveSelfFn({ data: { assignmentId: id, submit: false, reflection, scores: payloadScores() } }).then(() => { toast.success("Draf evaluasi diri disimpan."); refresh(); }).catch((error) => toast.error(errorText(error)))}>Simpan draf</Button>
          <Button onClick={() => { if (!window.confirm("Kirim evaluasi diri? Setelah dikirim, isian dikunci.")) return; void saveSelfFn({ data: { assignmentId: id, submit: true, reflection, scores: payloadScores() } }).then(() => { toast.success("Evaluasi diri terkirim."); refresh(); }).catch((error) => toast.error(errorText(error))); }}>Kirim evaluasi diri</Button>
        </> : null}
        {permissions.fillAssessor ? <>
          <Button variant="line" onClick={() => void saveSupervisorFn({ data: { assignmentId: id, submit: false, feedback, scores: payloadScores() } }).then(() => { toast.success("Draf penilaian disimpan."); refresh(); }).catch((error) => toast.error(errorText(error)))}>Simpan draf</Button>
          <Button onClick={() => { if (!window.confirm("Kirim penilaian untuk diverifikasi?")) return; void saveSupervisorFn({ data: { assignmentId: id, submit: true, feedback, scores: payloadScores() } }).then(() => { toast.success("Penilaian dikirim."); refresh(); }).catch((error) => toast.error(errorText(error))); }}>Kirim untuk verifikasi</Button>
        </> : null}
        {permissions.verify ? <>
          <input className={inputClass} placeholder="Catatan verifikasi" value={note} onChange={(e) => setNote(e.target.value)} />
          <Button onClick={() => { if (!window.confirm("Setujui dan kunci nilai hasil verifikasi?")) return; void verifyAssignmentFn({ data: { assignmentId: id, note } }).then(() => { toast.success("Penilaian terverifikasi."); refresh(); }).catch((error) => toast.error(errorText(error))); }}>Setujui</Button>
          <input className={inputClass} placeholder="Alasan pengembalian" value={reason} onChange={(e) => setReason(e.target.value)} />
          <Button variant="danger" onClick={() => void returnAssignmentFn({ data: { assignmentId: id, reason } }).then(() => { toast.success("Penilaian dikembalikan."); refresh(); }).catch((error) => toast.error(errorText(error)))}>Kembalikan</Button>
        </> : null}
        {permissions.finalize ? <Button onClick={() => { if (!window.confirm("Finalisasi hasil ini?")) return; void finalizeAssignmentFn({ data: id }).then(() => { toast.success("Hasil difinalisasi."); refresh(); }).catch((error) => toast.error(errorText(error))); }}>Finalisasi</Button> : null}
        {permissions.publish ? <Button variant="gold" onClick={() => { if (!window.confirm("Publikasikan hasil kepada pegawai?")) return; void publishAssignmentFn({ data: id }).then(() => { toast.success("Hasil dipublikasikan."); refresh(); }).catch((error) => toast.error(errorText(error))); }}>Publikasikan</Button> : null}
        <EvidenceBox id={id} kind={mode === "self" ? "diri" : "penilai"} onDone={refresh} />
      </Card>
      {mode === "result" && gap.data && !gap.data.hidden ? (
        <Card>
          <h3 className="font-display text-2xl text-forest">Kesenjangan persepsi</h3>
          <p className="text-sm text-muted">Selisih skor adalah bahan diskusi, bukan dasar hukuman. Kekuatan: {(gap.data.strong ?? []).join(", ") || "—"}. Perlu peningkatan: {(gap.data.weak ?? []).join(", ") || "—"}.</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead><tr><th>Indikator</th><th>Diri</th><th>Atasan</th><th>Selisih</th></tr></thead>
              <tbody>
                {gap.data.rows.map((row) => (
                  <tr key={row.indicatorId} className="border-t border-sand"><td className="py-2">{row.name}</td><td>{row.selfScore ?? "—"}</td><td>{row.supervisorScore ?? "—"}</td><td>{row.gap ?? "—"}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          {String(head.status) === "dipublikasikan" ? <Clarification id={id} onDone={refresh} /> : null}
        </Card>
      ) : null}
    </div>
  );
}

function EvidenceBox({ id, kind, onDone }: { id: string; kind: "diri" | "penilai"; onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  return (
    <form className="flex w-full flex-wrap gap-2" onSubmit={(event) => { event.preventDefault(); void addEvidenceFn({ data: { assignmentId: id, indicatorId: null, kind, title, body } }).then(() => { toast.success("Bukti ditambahkan."); setTitle(""); setBody(""); onDone(); }).catch((error) => toast.error(errorText(error))); }}>
      <input className={inputClass} placeholder="Judul bukti" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input className={inputClass} placeholder="Uraian bukti" value={body} onChange={(e) => setBody(e.target.value)} />
      <Button type="submit" variant="line">Tambah bukti</Button>
    </form>
  );
}

function Clarification({ id, onDone }: { id: string; onDone: () => void }) {
  const [body, setBody] = useState("");
  return (
    <form className="mt-3 flex gap-2" onSubmit={(event) => { event.preventDefault(); void addClarificationFn({ data: { assignmentId: id, body } }).then(() => { toast.success("Klarifikasi tersimpan."); setBody(""); onDone(); }).catch((error) => toast.error(errorText(error))); }}>
      <input className={inputClass} placeholder="Tanggapan atau klarifikasi" value={body} onChange={(e) => setBody(e.target.value)} />
      <Button type="submit" variant="line">Kirim</Button>
    </form>
  );
}
