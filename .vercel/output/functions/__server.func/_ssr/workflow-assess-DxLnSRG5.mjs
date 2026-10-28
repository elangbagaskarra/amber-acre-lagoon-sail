import { i as canVerifyAssignment, n as canFillSelf, r as canManageMaster, t as canAssess } from "./access-DSv3qvdn.mjs";
import { a as db, audit, c as num, currentBandsFromRows, i as asText, l as plain, loadActor, o as fail, r as Params, s as nid, t as computeScore } from "./workflow-core-Df05Ue6E.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/workflow-assess-DxLnSRG5.js
var HEAD_SQL = `
  select a.*, p.name as period_name, p.status as period_status, p.is_demo, p.bands,
         e.full_name as employee_name, e.code as employee_code, e.unit_id, e.position_id, e.group_code,
         u.name as unit_name, u.level_code, pos.name as position_name,
         ass.full_name as assessor_name, ver.full_name as verifier_name
  from assessment_assignments a
  join assessment_periods p on p.id = a.period_id
  join employees e on e.id = a.employee_id
  join organizational_units u on u.id = e.unit_id
  join positions pos on pos.id = e.position_id
  left join employees ass on ass.id = a.assessor_id
  left join employees ver on ver.id = a.verifier_id
`;
function bandsOf(value) {
	if (Array.isArray(value) && value.length) return value.map((band) => ({
		min: num(band.min),
		max: num(band.max),
		minInclusive: Boolean(band.minInclusive),
		maxInclusive: Boolean(band.maxInclusive),
		label: band.label
	}));
	return [];
}
async function fallbackBands() {
	const rows = await (await db())`select * from result_bands where active = true order by sort_order`;
	return currentBandsFromRows(rows);
}
async function listAssignments(userId, scope) {
	const actor = await loadActor(userId);
	const sql = await db();
	const p = new Params();
	let where = "where 1=1";
	if (scope === "self") {
		if (!actor.employeeId && !canManageMaster(actor)) where += " and 1=0";
		else if (!canManageMaster(actor)) where += ` and a.employee_id = ${p.add(actor.employeeId)}`;
	} else if (scope === "assessor") {
		if (canManageMaster(actor)) where += " and a.status <> 'tertahan'";
		else if (actor.employeeId) where += ` and a.assessor_id = ${p.add(actor.employeeId)}`;
		else where += " and 1=0";
	} else if (scope === "verify") {
		if (canManageMaster(actor) || actor.effectiveRole === "pengurus_yayasan") where += " and a.status in ('menunggu_verifikasi','dikembalikan','terverifikasi','final','dipublikasikan')";
		else if (actor.effectiveRole === "kepala_unit" && actor.unitId) {
			const unit = p.add(actor.unitId);
			const self = p.add(actor.employeeId ?? "");
			where += ` and e.unit_id = ${unit} and a.employee_id <> ${self} and a.status in ('menunggu_verifikasi','dikembalikan','terverifikasi','final','dipublikasikan')`;
		} else if (actor.employeeId) where += ` and a.verifier_id = ${p.add(actor.employeeId)}`;
		else where += " and 1=0";
	} else if (scope === "results") {
		if (canManageMaster(actor) || actor.effectiveRole === "pengurus_yayasan") {} else if (actor.effectiveRole === "kepala_unit" && actor.unitId) where += ` and e.unit_id = ${p.add(actor.unitId)}`;
		else if (actor.effectiveRole === "penilai" && actor.employeeId) {
			const id = p.add(actor.employeeId);
			where += ` and (a.assessor_id = ${id} or a.employee_id = ${id})`;
		} else if (actor.employeeId) where += ` and a.employee_id = ${p.add(actor.employeeId)} and a.status = 'dipublikasikan'`;
		else where += " and 1=0";
	}
	const rows = await sql.query(`${HEAD_SQL} ${where} order by p.start_date desc, e.full_name`, p.values);
	return plain(rows).map((row) => ({
		...row,
		final_score: row.final_score == null ? null : num(row.final_score)
	}));
}
async function loadHead(id) {
	const rows = await (await db()).query(`${HEAD_SQL} where a.id = $1`, [id]);
	if (!rows.length) fail("Penilaian tidak ditemukan.");
	return rows[0];
}
function assertPeriodOpen(head) {
	if (head.period_status === "ditutup" || head.period_status === "persiapan") fail("Periode tidak sedang menerima perubahan penilaian.");
}
async function applicableIndicators(head) {
	const sql = await db();
	const indicators = await sql`
    select i.*, c.name as category_name, c.weight as category_weight, c.sort_order as category_order
    from assessment_indicators i
    join assessment_categories c on c.id = i.category_id
    where c.version_id = ${head.version_id} and i.active = true
    order by c.sort_order, i.sort_order
  `;
	const responsibilities = await sql`
    select responsibility_key from employee_responsibilities where employee_id = ${head.employee_id}
  `;
	const keys = new Set(responsibilities.map((row) => row.responsibility_key));
	return indicators.filter((indicator) => {
		if (indicator.unit_scope !== "all" && indicator.unit_scope !== head.level_code) return false;
		if (indicator.responsibility_key && !keys.has(indicator.responsibility_key)) return false;
		const positions = indicator.position_codes.split(",").map((item) => item.trim()).filter(Boolean);
		if (positions.length && !positions.includes(head.position_id)) return false;
		return true;
	});
}
async function scoreRows(assignmentId, table) {
	const sql = await db();
	if (table === "self_scores") return sql`
      select * from self_scores where assignment_id = ${assignmentId}
    `;
	return sql`select * from assessment_scores where assignment_id = ${assignmentId}`;
}
function toInputs(indicators, scores, supervisor) {
	const byId = new Map(scores.map((row) => [asText(row.indicator_id), row]));
	return indicators.map((indicator) => {
		const score = byId.get(indicator.id);
		const isNa = Boolean(score?.is_na);
		const naApproved = supervisor ? asText(score?.na_status) === "approved" : isNa;
		return {
			indicatorId: indicator.id,
			categoryId: indicator.category_id,
			categoryName: indicator.category_name,
			categoryWeight: num(indicator.category_weight),
			categoryOrder: num(indicator.category_order),
			indicatorName: indicator.name,
			indicatorWeight: num(indicator.weight),
			indicatorOrder: num(indicator.sort_order),
			score: score?.score == null ? null : num(score.score),
			isNa,
			naApproved: isNa ? naApproved : false
		};
	});
}
async function getAssignment(userId, id) {
	const actor = await loadActor(userId);
	const head = await loadHead(id);
	if (!(canManageMaster(actor) || actor.employeeId === head.employee_id || actor.employeeId === head.assessor_id || canVerifyAssignment(actor, {
		verifierId: head.verifier_id,
		employeeId: head.employee_id,
		unitId: head.unit_id
	}) || actor.effectiveRole === "pengurus_yayasan" || actor.effectiveRole === "kepala_unit" && actor.unitId === head.unit_id)) fail("Anda tidak berwenang melihat penilaian ini.");
	if (actor.effectiveRole === "pegawai" && actor.employeeId === head.employee_id && !["dipublikasikan", "final"].includes(head.status) && actor.profileRole !== "super_admin") {}
	const indicators = await applicableIndicators(head);
	const sql = await db();
	const self = await sql`select * from self_assessments where assignment_id = ${id}`;
	const supervisor = await sql`select * from supervisor_assessments where assignment_id = ${id}`;
	const selfScores = await scoreRows(id, "self_scores");
	const supervisorScores = await scoreRows(id, "assessment_scores");
	const evidence = await sql`select id, indicator_id, kind, title, body, created_at from assessment_evidence where assignment_id = ${id} order by created_at`;
	const history = await sql`select * from approval_histories where assignment_id = ${id} order by created_at`;
	const feedback = await sql`select * from assessment_feedback where assignment_id = ${id} order by created_at`;
	const bands = bandsOf(head.bands);
	const activeBands = bands.length ? bands : await fallbackBands();
	const hideSupervisor = actor.effectiveRole === "pegawai" && head.status !== "dipublikasikan" && !canManageMaster(actor);
	const supervisorInputs = toInputs(indicators, supervisorScores, true);
	const selfInputs = toInputs(indicators, selfScores, false);
	const official = computeScore(supervisorInputs, activeBands);
	const reflection = computeScore(selfInputs, activeBands);
	return plain({
		head: {
			...head,
			final_score: head.final_score == null ? null : num(head.final_score)
		},
		indicators,
		self: self[0] ?? null,
		supervisor: supervisor[0] ?? null,
		selfScores: hideSupervisor ? selfScores : selfScores,
		supervisorScores: hideSupervisor ? [] : supervisorScores,
		evidence,
		history,
		feedback,
		official: hideSupervisor ? null : official,
		reflection,
		permissions: {
			fillSelf: canFillSelf(actor, head.employee_id) && ["menunggu_evaluasi_diri", "evaluasi_diri_draf"].includes(head.status),
			fillAssessor: canAssess(actor, head.assessor_id) && [
				"menunggu_penilaian",
				"penilaian_draf",
				"dikembalikan"
			].includes(head.status),
			verify: canVerifyAssignment(actor, {
				verifierId: head.verifier_id,
				employeeId: head.employee_id,
				unitId: head.unit_id
			}) && head.status === "menunggu_verifikasi",
			finalize: (canManageMaster(actor) || actor.effectiveRole === "pengurus_yayasan" || actor.effectiveRole === "kepala_unit" && actor.unitId === head.unit_id) && head.status === "terverifikasi",
			publish: (canManageMaster(actor) || actor.effectiveRole === "pengurus_yayasan" || actor.effectiveRole === "kepala_unit" && actor.unitId === head.unit_id) && head.status === "final",
			correct: canManageMaster(actor) && [
				"terverifikasi",
				"final",
				"dipublikasikan"
			].includes(head.status)
		}
	});
}
async function history(actor, assignmentId, action, from, to, reason = "", meta) {
	await (await db())`
    insert into approval_histories (id, assignment_id, actor_user_id, action, from_status, to_status, reason, meta)
    values (${nid("his")}, ${assignmentId}, ${actor.userId}, ${action}, ${from}, ${to}, ${reason}, ${meta ? JSON.stringify(meta) : null}::jsonb)
  `;
}
async function notifyPeople(input) {
	await (await db())`
    insert into notifications (id, user_id, employee_id, title, body, href, kind, dedupe_key)
    values (
      ${nid("ntf")}, ${input.userId ?? null}, ${input.employeeId ?? null}, ${input.title}, ${input.body},
      ${input.href}, ${input.kind}, ${input.dedupe ?? null}
    )
    on conflict (dedupe_key) do nothing
  `;
}
async function saveSelf(userId, input) {
	const actor = await loadActor(userId);
	const head = await loadHead(input.assignmentId);
	assertPeriodOpen(head);
	if (!canFillSelf(actor, head.employee_id)) fail("Anda tidak berwenang mengisi evaluasi diri ini.");
	if (!["menunggu_evaluasi_diri", "evaluasi_diri_draf"].includes(head.status)) fail("Evaluasi diri sudah terkirim dan tidak dapat diubah.");
	const indicators = await applicableIndicators(head);
	const allowed = new Set(indicators.map((indicator) => indicator.id));
	const sql = await db();
	await sql`
    insert into self_assessments (
      assignment_id, achievements, completed_tasks, obstacles, competencies_to_improve, training_needs, next_targets, status, updated_at
    ) values (
      ${head.id}, ${input.reflection.achievements}, ${input.reflection.completedTasks}, ${input.reflection.obstacles},
      ${input.reflection.competencies}, ${input.reflection.trainingNeeds}, ${input.reflection.nextTargets},
      ${input.submit ? "terkirim" : "draf"}, now()
    )
    on conflict (assignment_id) do update set
      achievements = excluded.achievements,
      completed_tasks = excluded.completed_tasks,
      obstacles = excluded.obstacles,
      competencies_to_improve = excluded.competencies_to_improve,
      training_needs = excluded.training_needs,
      next_targets = excluded.next_targets,
      status = excluded.status,
      updated_at = now()
  `;
	for (const score of input.scores) {
		if (!allowed.has(score.indicatorId)) continue;
		if (!score.isNa && score.score != null && (score.score < 1 || score.score > 5)) fail("Skor evaluasi diri harus 1 sampai 5.");
		await sql`
      insert into self_scores (id, assignment_id, indicator_id, score, is_na, na_reason, note)
      values (${nid("ss")}, ${head.id}, ${score.indicatorId}, ${score.isNa ? null : score.score}, ${score.isNa}, ${score.naReason}, ${score.note})
      on conflict (assignment_id, indicator_id) do update set
        score = excluded.score, is_na = excluded.is_na, na_reason = excluded.na_reason, note = excluded.note
    `;
	}
	if (input.submit) {
		const inputs = toInputs(indicators, await scoreRows(head.id, "self_scores"), false);
		if (!computeScore(inputs).complete) fail("Lengkapi seluruh indikator evaluasi diri, atau tandai yang tidak berlaku beserta alasannya.");
		if (!input.reflection.achievements.trim() || !input.reflection.nextTargets.trim()) fail("Pencapaian utama dan target semester berikutnya wajib diisi sebelum dikirim.");
		await sql`
      update self_assessments set status = 'terkirim', submitted_at = now() where assignment_id = ${head.id}
    `;
		await sql`
      update assessment_assignments set status = 'menunggu_penilaian', self_submitted_at = now(), updated_at = now()
      where id = ${head.id}
    `;
		await history(actor, head.id, "kirim_evaluasi_diri", head.status, "menunggu_penilaian");
		await notifyPeople({
			userId: (await sql`select user_id from employees where id = ${head.assessor_id}`)[0]?.user_id,
			employeeId: head.assessor_id,
			title: "Penilaian atasan perlu diselesaikan",
			body: `${head.employee_name} telah mengirim evaluasi diri.`,
			href: "/penilaian",
			kind: "penilaian",
			dedupe: `assess-ready:${head.id}`
		});
	} else await sql`
      update assessment_assignments set status = 'evaluasi_diri_draf', updated_at = now() where id = ${head.id}
    `;
	return getAssignment(userId, head.id);
}
async function saveSupervisor(userId, input) {
	const actor = await loadActor(userId);
	const head = await loadHead(input.assignmentId);
	assertPeriodOpen(head);
	if (!canAssess(actor, head.assessor_id)) fail("Anda tidak ditugaskan sebagai penilai.");
	if (![
		"menunggu_penilaian",
		"penilaian_draf",
		"dikembalikan"
	].includes(head.status)) fail("Penilaian tidak dapat diubah pada status ini.");
	if (head.status === "menunggu_evaluasi_diri" || head.status === "evaluasi_diri_draf") fail("Evaluasi diri belum dikirim.");
	const indicators = await applicableIndicators(head);
	const allowed = new Set(indicators.map((indicator) => indicator.id));
	const sql = await db();
	await sql`
    insert into supervisor_assessments (assignment_id, overall_feedback, strengths, improvements, status, updated_at)
    values (${head.id}, ${input.feedback.overall}, ${input.feedback.strengths}, ${input.feedback.improvements}, ${input.submit ? "terkirim" : "draf"}, now())
    on conflict (assignment_id) do update set
      overall_feedback = excluded.overall_feedback,
      strengths = excluded.strengths,
      improvements = excluded.improvements,
      status = excluded.status,
      updated_at = now()
  `;
	for (const score of input.scores) {
		if (!allowed.has(score.indicatorId)) continue;
		if (score.isNa && !score.naReason.trim()) fail("Indikator yang tidak berlaku wajib diberi alasan.");
		if (!score.isNa && score.score != null && (score.score < 1 || score.score > 5)) fail("Skor penilai harus 1 sampai 5.");
		const current = await sql`
      select na_status, is_na from assessment_scores where assignment_id = ${head.id} and indicator_id = ${score.indicatorId}
    `;
		let naStatus = "none";
		if (score.isNa) naStatus = current[0]?.is_na && current[0]?.na_status === "approved" ? "approved" : "pending";
		await sql`
      insert into assessment_scores (
        id, assignment_id, indicator_id, score, is_na, na_reason, na_status, note, evidence_note, recommendation
      ) values (
        ${nid("sc")}, ${head.id}, ${score.indicatorId}, ${score.isNa ? null : score.score}, ${score.isNa},
        ${score.naReason}, ${naStatus}, ${score.note}, ${score.evidenceNote}, ${score.recommendation}
      )
      on conflict (assignment_id, indicator_id) do update set
        score = excluded.score, is_na = excluded.is_na, na_reason = excluded.na_reason,
        na_status = excluded.na_status, note = excluded.note, evidence_note = excluded.evidence_note,
        recommendation = excluded.recommendation
    `;
	}
	const saved = await scoreRows(head.id, "assessment_scores");
	const bands = bandsOf(head.bands);
	const result = computeScore(toInputs(indicators, saved, true), bands.length ? bands : await fallbackBands());
	await sql`update assessment_assignments set breakdown = ${JSON.stringify(result)}::jsonb, updated_at = now() where id = ${head.id}`;
	if (input.submit) {
		if (!result.complete && result.pendingNa === 0) fail(result.warnings[0] ?? "Penilaian belum lengkap.");
		if (!result.complete && result.missing > 0) fail("Masih ada indikator tanpa skor.");
		if (!input.feedback.overall.trim()) fail("Umpan balik umum wajib diisi sebelum dikirim.");
		await sql`
      update supervisor_assessments set status = 'terkirim', submitted_at = now() where assignment_id = ${head.id}
    `;
		await sql`
      update assessment_assignments set status = 'menunggu_verifikasi', assessor_submitted_at = now(), updated_at = now()
      where id = ${head.id}
    `;
		await history(actor, head.id, "kirim_penilaian", head.status, "menunggu_verifikasi", "", { provisional: result.finalScore });
		await notifyPeople({
			userId: (await sql`select user_id from employees where id = ${head.verifier_id}`)[0]?.user_id,
			employeeId: head.verifier_id,
			title: "Penilaian menunggu verifikasi",
			body: `Penilaian ${head.employee_name} siap diverifikasi.`,
			href: "/verifikasi",
			kind: "verifikasi",
			dedupe: `verify-ready:${head.id}:${Date.now()}`
		});
	} else await sql`update assessment_assignments set status = 'penilaian_draf', updated_at = now() where id = ${head.id}`;
	return getAssignment(userId, head.id);
}
async function decideNa(userId, assignmentId, indicatorId, approve, reason) {
	const actor = await loadActor(userId);
	const head = await loadHead(assignmentId);
	assertPeriodOpen(head);
	if (!canVerifyAssignment(actor, {
		verifierId: head.verifier_id,
		employeeId: head.employee_id,
		unitId: head.unit_id
	})) fail("Anda tidak berwenang menyetujui indikator yang tidak berlaku.");
	if (!reason.trim()) fail("Keputusan N/A memerlukan alasan.");
	const sql = await db();
	if (!(await sql`
    select is_na from assessment_scores where assignment_id = ${assignmentId} and indicator_id = ${indicatorId}
  `)[0]?.is_na) fail("Indikator ini tidak diajukan sebagai tidak berlaku.");
	await sql`
    update assessment_scores set na_status = ${approve ? "approved" : "rejected"} where assignment_id = ${assignmentId} and indicator_id = ${indicatorId}
  `;
	await history(actor, assignmentId, approve ? "setujui_na" : "tolak_na", head.status, head.status, reason, { indicatorId });
	await audit(actor.userId, approve ? "setujui_na" : "tolak_na", "assessment_scores", assignmentId, reason, { indicatorId });
	return getAssignment(userId, assignmentId);
}
async function lockScore(actor, head, status) {
	const indicators = await applicableIndicators(head);
	const saved = await scoreRows(head.id, "assessment_scores");
	const bands = bandsOf(head.bands);
	const result = computeScore(toInputs(indicators, saved, true), bands.length ? bands : await fallbackBands());
	if (!result.complete || result.finalScore == null) fail(result.warnings[0] ?? "Nilai akhir belum dapat dihitung.");
	await (await db())`
    update assessment_assignments set
      final_score = ${result.finalScore}, final_label = ${result.label}, breakdown = ${JSON.stringify(result)}::jsonb,
      status = ${status}, verified_at = coalesce(verified_at, now()), updated_at = now()
    where id = ${head.id}
  `;
	return result;
}
async function verifyAssignment(userId, assignmentId, note) {
	const actor = await loadActor(userId);
	const head = await loadHead(assignmentId);
	assertPeriodOpen(head);
	if (head.status !== "menunggu_verifikasi") fail("Penilaian tidak sedang menunggu verifikasi.");
	if (!canVerifyAssignment(actor, {
		verifierId: head.verifier_id,
		employeeId: head.employee_id,
		unitId: head.unit_id
	})) fail("Anda tidak berwenang memverifikasi penilaian ini.");
	const result = await lockScore(actor, head, "terverifikasi");
	if (note.trim()) await (await db())`
      insert into assessment_feedback (id, assignment_id, author_user_id, author_role, kind, body)
      values (${nid("fb")}, ${assignmentId}, ${actor.userId}, ${actor.effectiveRole}, 'verifikasi', ${note.trim()})
    `;
	await history(actor, assignmentId, "verifikasi", head.status, "terverifikasi", note, { score: result.finalScore });
	await audit(actor.userId, "verifikasi", "assessment_assignments", assignmentId, note, {
		score: result.finalScore,
		label: result.label
	});
	return getAssignment(userId, assignmentId);
}
async function returnAssignment(userId, assignmentId, reason) {
	const actor = await loadActor(userId);
	const head = await loadHead(assignmentId);
	assertPeriodOpen(head);
	if (head.status !== "menunggu_verifikasi") fail("Hanya penilaian yang menunggu verifikasi yang dapat dikembalikan.");
	if (!reason.trim()) fail("Pengembalian wajib disertai alasan.");
	if (!canVerifyAssignment(actor, {
		verifierId: head.verifier_id,
		employeeId: head.employee_id,
		unitId: head.unit_id
	})) fail("Anda tidak berwenang mengembalikan penilaian ini.");
	const sql = await db();
	await sql`update assessment_assignments set status = 'dikembalikan', updated_at = now() where id = ${assignmentId}`;
	await sql`
    insert into assessment_feedback (id, assignment_id, author_user_id, author_role, kind, body)
    values (${nid("fb")}, ${assignmentId}, ${actor.userId}, ${actor.effectiveRole}, 'pengembalian', ${reason.trim()})
  `;
	await history(actor, assignmentId, "kembalikan", head.status, "dikembalikan", reason);
	await notifyPeople({
		userId: (await sql`select user_id from employees where id = ${head.assessor_id}`)[0]?.user_id,
		employeeId: head.assessor_id,
		title: "Penilaian dikembalikan",
		body: `${head.employee_name}: ${reason.trim()}`,
		href: "/penilaian",
		kind: "revisi",
		dedupe: `return:${assignmentId}:${Date.now()}`
	});
	return getAssignment(userId, assignmentId);
}
async function finalizeAssignment(userId, assignmentId) {
	const actor = await loadActor(userId);
	const head = await loadHead(assignmentId);
	assertPeriodOpen(head);
	if (head.status !== "terverifikasi") fail("Hanya penilaian terverifikasi yang dapat difinalisasi.");
	if (!(canManageMaster(actor) || actor.effectiveRole === "pengurus_yayasan" || actor.effectiveRole === "kepala_unit" && actor.unitId === head.unit_id && actor.employeeId !== head.employee_id)) fail("Anda tidak berwenang memfinalisasi penilaian ini.");
	await (await db())`update assessment_assignments set status = 'final', finalized_at = now(), updated_at = now() where id = ${assignmentId}`;
	await history(actor, assignmentId, "finalisasi", head.status, "final");
	await audit(actor.userId, "finalisasi", "assessment_assignments", assignmentId);
	return getAssignment(userId, assignmentId);
}
async function publishAssignment(userId, assignmentId) {
	const actor = await loadActor(userId);
	const head = await loadHead(assignmentId);
	assertPeriodOpen(head);
	if (head.status !== "final") fail("Penilaian harus final sebelum dipublikasikan.");
	if (!(canManageMaster(actor) || actor.effectiveRole === "pengurus_yayasan" || actor.effectiveRole === "kepala_unit" && actor.unitId === head.unit_id && actor.employeeId !== head.employee_id)) fail("Anda tidak berwenang memublikasikan penilaian ini.");
	const sql = await db();
	await sql`update assessment_assignments set status = 'dipublikasikan', published_at = now(), updated_at = now() where id = ${assignmentId}`;
	await notifyPeople({
		userId: (await sql`select user_id from employees where id = ${head.employee_id}`)[0]?.user_id,
		employeeId: head.employee_id,
		title: "Hasil penilaian tersedia",
		body: `Hasil ${head.period_name} untuk ${head.employee_name} telah dipublikasikan.`,
		href: "/hasil",
		kind: "hasil",
		dedupe: `published:${assignmentId}`
	});
	await history(actor, assignmentId, "publikasi", head.status, "dipublikasikan");
	await audit(actor.userId, "publikasi", "assessment_assignments", assignmentId);
	return getAssignment(userId, assignmentId);
}
async function correctScore(userId, input) {
	const actor = await loadActor(userId);
	if (!canManageMaster(actor)) fail("Koreksi administratif hanya dapat dilakukan Super Administrator dan selalu tercatat.");
	if (!input.reason.trim()) fail("Koreksi wajib menyertakan alasan.");
	const head = await loadHead(input.assignmentId);
	if (![
		"terverifikasi",
		"final",
		"dipublikasikan"
	].includes(head.status)) fail("Koreksi administratif dipakai setelah penilaian terverifikasi. Sebelum itu, kembalikan ke penilai.");
	if (!(await applicableIndicators(head)).some((indicator) => indicator.id === input.indicatorId)) fail("Indikator tidak berlaku untuk pegawai ini.");
	const sql = await db();
	const before = await sql`select * from assessment_scores where assignment_id = ${head.id} and indicator_id = ${input.indicatorId}`;
	await sql`
    insert into assessment_scores (
      id, assignment_id, indicator_id, score, is_na, na_reason, na_status, note, evidence_note, recommendation
    ) values (
      ${nid("sc")}, ${head.id}, ${input.indicatorId}, ${input.isNa ? null : input.score}, ${input.isNa},
      ${input.naReason}, ${input.isNa ? "approved" : "none"}, ${"Koreksi administratif"}, '', ''
    )
    on conflict (assignment_id, indicator_id) do update set
      score = excluded.score, is_na = excluded.is_na, na_reason = excluded.na_reason, na_status = excluded.na_status
  `;
	const result = await lockScore(actor, head, head.status);
	await history(actor, head.id, "koreksi_administratif", head.status, head.status, input.reason, {
		indicatorId: input.indicatorId,
		score: result.finalScore
	});
	await audit(actor.userId, "koreksi_nilai", "assessment_scores", head.id, input.reason, { after: result.finalScore }, before[0] ?? null);
	return getAssignment(userId, head.id);
}
async function addEvidence(userId, input) {
	const actor = await loadActor(userId);
	const head = await loadHead(input.assignmentId);
	if (!(input.kind === "diri" && canFillSelf(actor, head.employee_id) || input.kind === "penilai" && canAssess(actor, head.assessor_id) || canManageMaster(actor))) fail("Anda tidak berwenang menambah bukti pada penilaian ini.");
	if (!input.title.trim()) fail("Judul bukti wajib diisi.");
	if (input.body.length > 4e3) fail("Uraian bukti terlalu panjang.");
	await (await db())`
    insert into assessment_evidence (id, assignment_id, indicator_id, author_user_id, kind, title, body)
    values (${nid("ev")}, ${head.id}, ${input.indicatorId}, ${actor.userId}, ${input.kind}, ${input.title.trim()}, ${input.body.trim()})
  `;
	return getAssignment(userId, head.id);
}
async function addClarification(userId, assignmentId, body) {
	const actor = await loadActor(userId);
	const head = await loadHead(assignmentId);
	if (actor.employeeId !== head.employee_id && !canManageMaster(actor)) fail("Klarifikasi hanya dapat dikirim oleh pegawai yang dinilai.");
	if (head.status !== "dipublikasikan") fail("Klarifikasi dibuka setelah hasil dipublikasikan.");
	if (!body.trim()) fail("Isi klarifikasi masih kosong.");
	await (await db())`
    insert into assessment_feedback (id, assignment_id, author_user_id, author_role, kind, body)
    values (${nid("fb")}, ${assignmentId}, ${actor.userId}, ${actor.effectiveRole}, 'klarifikasi', ${body.trim()})
  `;
	await history(actor, assignmentId, "klarifikasi", head.status, head.status, body.trim());
	return getAssignment(userId, assignmentId);
}
async function listPlans(userId) {
	const actor = await loadActor(userId);
	const sql = await db();
	const p = new Params();
	let where = "where 1=1";
	if (canManageMaster(actor) || actor.effectiveRole === "pengurus_yayasan") {} else if (actor.effectiveRole === "kepala_unit" && actor.unitId) where += ` and e.unit_id = ${p.add(actor.unitId)}`;
	else if (actor.effectiveRole === "penilai" && actor.employeeId) {
		const id = p.add(actor.employeeId);
		where += ` and (e.id = ${id} or e.assessor_id = ${id})`;
	} else if (actor.employeeId) where += ` and d.employee_id = ${p.add(actor.employeeId)}`;
	else where += " and 1=0";
	const rows = await sql.query(`select d.*, e.full_name as employee_name, e.unit_id, u.name as unit_name, p.name as period_name
     from development_plans d
     join employees e on e.id = d.employee_id
     join organizational_units u on u.id = e.unit_id
     left join assessment_periods p on p.id = d.period_id
     ${where}
     order by d.updated_at desc`, p.values);
	return plain(rows);
}
async function savePlan(userId, input) {
	const actor = await loadActor(userId);
	const sql = await db();
	const employees = await sql`
    select id, unit_id, assessor_id from employees where id = ${input.employeeId}
  `;
	if (!employees.length) fail("Pegawai tidak ditemukan.");
	const employee = employees[0];
	if (!(canManageMaster(actor) || actor.effectiveRole === "pengurus_yayasan" || actor.effectiveRole === "kepala_unit" && actor.unitId === employee.unit_id || actor.employeeId && (actor.employeeId === employee.id || actor.employeeId === employee.assessor_id))) fail("Anda tidak berwenang menyusun rencana ini.");
	if (!input.aspect.trim() || !input.goal.trim()) fail("Aspek dan tujuan perbaikan wajib diisi.");
	const id = input.id || nid("plan");
	if ((await sql`select id from development_plans where id = ${id}`).length) await sql`
      update development_plans set
        aspect = ${input.aspect.trim()}, gap_found = ${input.gapFound}, goal = ${input.goal},
        activity = ${input.activity}, support_needed = ${input.supportNeeded}, owner_name = ${input.ownerName},
        due_date = ${input.dueDate || null}, success_indicator = ${input.successIndicator},
        status = ${input.status}, follow_up_note = ${input.followUpNote}, updated_at = now()
      where id = ${id}
    `;
	else await sql`
      insert into development_plans (
        id, assignment_id, employee_id, period_id, aspect, gap_found, goal, activity, support_needed,
        owner_name, due_date, success_indicator, status, follow_up_note
      ) values (
        ${id}, ${input.assignmentId}, ${input.employeeId}, ${input.periodId}, ${input.aspect.trim()},
        ${input.gapFound}, ${input.goal}, ${input.activity}, ${input.supportNeeded}, ${input.ownerName},
        ${input.dueDate || null}, ${input.successIndicator}, ${input.status}, ${input.followUpNote}
      )
    `;
	await sql`
    insert into development_plan_updates (id, plan_id, status, note, actor_user_id)
    values (${nid("pu")}, ${id}, ${input.status}, ${input.followUpNote || "Pembaruan rencana"}, ${actor.userId})
  `;
	await audit(actor.userId, "simpan_rencana", "development_plans", id, "", {
		aspect: input.aspect,
		status: input.status
	});
	return { id };
}
async function listNotifications(userId) {
	const actor = await loadActor(userId);
	const rows = await (await db())`
    select * from notifications
    where user_id = ${actor.userId}
       or (${actor.employeeId}::text is not null and employee_id = ${actor.employeeId})
       or (${actor.profileRole} = 'super_admin' and ${actor.simulating} = false and user_id is null and employee_id is null)
    order by created_at desc
    limit 80
  `;
	return plain(rows);
}
async function markNotification(userId, id) {
	const actor = await loadActor(userId);
	const sql = await db();
	if (id) await sql`
      update notifications set read_at = now()
      where id = ${id} and (user_id = ${actor.userId} or employee_id = ${actor.employeeId} or ${actor.profileRole} = 'super_admin')
    `;
	else await sql`
      update notifications set read_at = now()
      where read_at is null and (user_id = ${actor.userId} or employee_id = ${actor.employeeId})
    `;
	return { ok: true };
}
async function listAudit(userId) {
	const actor = await loadActor(userId);
	if (actor.profileRole !== "super_admin" || actor.simulating) fail("Audit log hanya untuk Super Administrator.");
	const sql = await db();
	return plain(await sql`select * from audit_logs order by created_at desc limit 200`);
}
async function syncReminders(userId) {
	const actor = await loadActor(userId);
	const sql = await db();
	const rows = await sql`
    select a.id, a.status, a.employee_id, a.assessor_id, p.self_end, p.assessor_end, p.name as period_name, e.full_name as employee_name
    from assessment_assignments a
    join assessment_periods p on p.id = a.period_id
    join employees e on e.id = a.employee_id
    where p.status in ('dibuka', 'berlangsung', 'menunggu_finalisasi')
  `;
	const today = /* @__PURE__ */ new Date();
	const soon = (date) => {
		return ((/* @__PURE__ */ new Date(`${date}T00:00:00`)).getTime() - today.getTime()) / 864e5 <= 7;
	};
	for (const row of rows) {
		if (["menunggu_evaluasi_diri", "evaluasi_diri_draf"].includes(row.status) && soon(asText(row.self_end))) await notifyPeople({
			userId: (await sql`select user_id from employees where id = ${row.employee_id}`)[0]?.user_id,
			employeeId: row.employee_id,
			title: "Tenggat evaluasi diri mendekat",
			body: `${row.period_name} menutup evaluasi diri pada ${asText(row.self_end)}.`,
			href: "/evaluasi",
			kind: "pengingat",
			dedupe: `self-due:${row.id}:${asText(row.self_end)}`
		});
		if ([
			"menunggu_penilaian",
			"penilaian_draf",
			"dikembalikan"
		].includes(row.status) && row.assessor_id && soon(asText(row.assessor_end))) await notifyPeople({
			userId: (await sql`select user_id from employees where id = ${row.assessor_id}`)[0]?.user_id,
			employeeId: row.assessor_id,
			title: "Tenggat penilaian atasan mendekat",
			body: `Penilaian ${row.employee_name} perlu diselesaikan sebelum ${asText(row.assessor_end)}.`,
			href: "/penilaian",
			kind: "pengingat",
			dedupe: `assessor-due:${row.id}:${asText(row.assessor_end)}`
		});
	}
	const plans = await sql`
    select id, employee_id, due_date, aspect from development_plans
    where status in ('belum_dimulai', 'sedang_berjalan') and due_date is not null and due_date <= current_date + interval '7 day'
  `;
	for (const plan of plans) await notifyPeople({
		userId: (await sql`select user_id from employees where id = ${plan.employee_id}`)[0]?.user_id,
		employeeId: plan.employee_id,
		title: "Tindak lanjut mendekati tenggat",
		body: plan.aspect,
		href: "/pengembangan",
		kind: "pengingat",
		dedupe: `plan-due:${plan.id}:${asText(plan.due_date)}`
	});
	return actor;
}
async function gapFor(userId, assignmentId) {
	const detail = await getAssignment(userId, assignmentId);
	if (!detail.official) return {
		rows: [],
		hidden: true
	};
	const selfBy = new Map(detail.selfScores.map((row) => [asText(row.indicator_id), row]));
	const supBy = new Map(detail.supervisorScores.map((row) => [asText(row.indicator_id), row]));
	return {
		rows: detail.indicators.map((indicator) => {
			const self = selfBy.get(indicator.id);
			const sup = supBy.get(indicator.id);
			const selfScore = self?.is_na ? null : self?.score == null ? null : num(self.score);
			const supScore = sup?.is_na ? null : sup?.score == null ? null : num(sup.score);
			return {
				indicatorId: indicator.id,
				name: indicator.name,
				category: indicator.category_name,
				selfScore,
				supervisorScore: supScore,
				gap: selfScore != null && supScore != null ? num(selfScore) - num(supScore) : null,
				selfNote: asText(self?.note),
				supervisorNote: asText(sup?.note),
				evidence: asText(sup?.evidence_note)
			};
		}),
		strong: detail.official.categories.filter((category) => (category.score ?? 0) >= 80).map((category) => category.name),
		weak: detail.official.categories.filter((category) => category.score != null && category.score < 80).map((category) => category.name),
		hidden: false,
		official: detail.official
	};
}
//#endregion
export { addClarification, addEvidence, applicableIndicators, correctScore, decideNa, finalizeAssignment, gapFor, getAssignment, listAssignments, listAudit, listNotifications, listPlans, markNotification, publishAssignment, returnAssignment, savePlan, saveSelf, saveSupervisor, syncReminders, verifyAssignment };
