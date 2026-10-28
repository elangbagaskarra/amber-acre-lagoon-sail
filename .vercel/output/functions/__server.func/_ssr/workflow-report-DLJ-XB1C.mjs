import { o as __toESM } from "../_runtime.mjs";
import { i as PLAN_STATUS_LABEL, n as GROUP_LABEL, r as PERIOD_STATUS_LABEL, t as ASSIGNMENT_STATUS_LABEL } from "./labels-b_RKwhV6.mjs";
import { o as seesAllUnits, r as canManageMaster } from "./access-DSv3qvdn.mjs";
import { a as db, c as num, getInstitution, i as asText, l as plain, loadActor, n as workedExamples, o as fail, t as computeScore } from "./workflow-core-Df05Ue6E.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/workflow-report-DLJ-XB1C.js
function runScoreSelfTest() {
	return workedExamples().map((example) => {
		const result = computeScore(example.items);
		return {
			name: example.name,
			expected: example.expected,
			actual: result.finalScore,
			label: result.label,
			pass: result.complete && result.finalScore === example.expected
		};
	});
}
async function getDashboard(userId) {
	const actor = await loadActor(userId);
	const sql = await db();
	const unitFilter = actor.effectiveRole === "super_admin" || actor.effectiveRole === "pengurus_yayasan" || actor.crossUnit ? null : actor.unitId || "__none__";
	const employees = await sql`
    select e.unit_id, u.name as unit_name, e.group_code, count(*) as total
    from employees e
    join organizational_units u on u.id = e.unit_id
    where e.active = true and (${unitFilter}::text is null or e.unit_id = ${unitFilter})
    group by e.unit_id, u.name, e.group_code
  `;
	const periods = await sql`
    select id, name, status, is_demo from assessment_periods order by start_date desc limit 6
  `;
	const activePeriod = periods.find((period) => [
		"dibuka",
		"berlangsung",
		"menunggu_finalisasi"
	].includes(period.status)) ?? periods[0];
	let progress = [];
	let labels = [];
	let weak = [];
	let mine = [];
	if (activePeriod) {
		const pUnit = unitFilter;
		progress = (await sql`
      select a.status, count(*) as total
      from assessment_assignments a
      join employees e on e.id = a.employee_id
      where a.period_id = ${activePeriod.id}
        and (${pUnit}::text is null or e.unit_id = ${pUnit})
        and (
          ${actor.effectiveRole} <> 'penilai'
          or a.assessor_id = ${actor.employeeId}
          or a.employee_id = ${actor.employeeId}
        )
        and (
          ${actor.effectiveRole} <> 'pegawai'
          or a.employee_id = ${actor.employeeId}
        )
      group by a.status
    `).map((row) => ({
			status: row.status,
			total: num(row.total)
		}));
		const finals = await sql`
      select a.final_label, a.breakdown
      from assessment_assignments a
      join employees e on e.id = a.employee_id
      where a.period_id = ${activePeriod.id}
        and a.status in ('terverifikasi', 'final', 'dipublikasikan')
        and (${pUnit}::text is null or e.unit_id = ${pUnit})
    `;
		const labelMap = /* @__PURE__ */ new Map();
		const weakMap = /* @__PURE__ */ new Map();
		for (const row of finals) {
			const label = row.final_label || "Belum berlabel";
			labelMap.set(label, (labelMap.get(label) ?? 0) + 1);
			for (const category of row.breakdown?.categories ?? []) if (category.score != null && category.score < 80) weakMap.set(category.name, (weakMap.get(category.name) ?? 0) + 1);
		}
		labels = [...labelMap.entries()].map(([label, total]) => ({
			label,
			total
		}));
		weak = [...weakMap.entries()].map(([name, total]) => ({
			name,
			total
		})).sort((a, b) => b.total - a.total).slice(0, 6);
	}
	if (actor.employeeId) mine = plain(await sql`
      select a.id, a.status, a.final_score, a.final_label, p.name as period_name
      from assessment_assignments a
      join assessment_periods p on p.id = a.period_id
      where a.employee_id = ${actor.employeeId}
      order by p.start_date desc
    `);
	const plans = await sql`
    select d.status, count(*) as total
    from development_plans d
    join employees e on e.id = d.employee_id
    where (${unitFilter}::text is null or e.unit_id = ${unitFilter})
    group by d.status
  `;
	const queue = await sql`
    select a.id, a.status, e.full_name as employee_name, u.name as unit_name, p.name as period_name
    from assessment_assignments a
    join employees e on e.id = a.employee_id
    join organizational_units u on u.id = e.unit_id
    join assessment_periods p on p.id = a.period_id
    where p.status in ('dibuka','berlangsung','menunggu_finalisasi')
      and (
        (${actor.effectiveRole} = 'penilai' and a.assessor_id = ${actor.employeeId})
        or (${actor.effectiveRole} = 'pegawai' and a.employee_id = ${actor.employeeId})
        or (${actor.effectiveRole} = 'kepala_unit' and e.unit_id = ${actor.unitId} and a.status in ('menunggu_verifikasi','dikembalikan'))
        or (${actor.effectiveRole} in ('pengurus_yayasan','super_admin') and a.status in ('menunggu_verifikasi','tertahan','menunggu_penilaian','menunggu_evaluasi_diri'))
      )
    order by e.full_name
    limit 12
  `;
	const totalActive = employees.reduce((sum, row) => sum + num(row.total), 0);
	return plain({
		actor,
		totalActive,
		byUnit: employees.map((row) => ({
			...row,
			total: num(row.total)
		})),
		periods,
		activePeriod: activePeriod ?? null,
		progress,
		labels,
		weak,
		plans: plans.map((row) => ({
			status: row.status,
			total: num(row.total)
		})),
		queue,
		mine
	});
}
function sumStatus(progress, statuses) {
	return progress.filter((row) => statuses.includes(row.status)).reduce((sum, row) => sum + row.total, 0);
}
async function buildReport(userId, input) {
	const actor = await loadActor(userId);
	const institution = await getInstitution();
	const sql = await db();
	const period = (await sql`
    select id, name, status, is_demo from assessment_periods where id = ${input.periodId ?? ""}
  `)[0];
	if (!period && input.type !== "tindak_lanjut") fail("Pilih periode laporan.");
	const stamp = (/* @__PURE__ */ new Date()).toLocaleString("id-ID");
	const base = `${institution?.foundation_name ?? "YPIT"} · ${period?.name ?? "Semua periode"} · Dibuat ${stamp} · Status periode ${period ? PERIOD_STATUS_LABEL[period.status] ?? period.status : "-"}`;
	const demo = period?.is_demo ? " · DATA CONTOH" : "";
	if (input.type === "individu") {
		if (!input.employeeId) fail("Pilih pegawai.");
		if (!(canManageMaster(actor) || actor.effectiveRole === "pengurus_yayasan" || actor.effectiveRole === "kepala_unit" && actor.unitId || actor.employeeId === input.employeeId || actor.effectiveRole === "penilai")) fail("Laporan individual di luar kewenangan Anda.");
		const row = (await sql`
      select a.*, e.full_name as employee_name, e.unit_id, u.name as unit_name, pos.name as position_name, p.name as period_name
      from assessment_assignments a
      join employees e on e.id = a.employee_id
      join organizational_units u on u.id = e.unit_id
      join positions pos on pos.id = e.position_id
      join assessment_periods p on p.id = a.period_id
      where a.period_id = ${period.id} and a.employee_id = ${input.employeeId}
    `)[0];
		if (!row) fail("Tidak ada penilaian untuk pegawai pada periode ini.");
		if (actor.effectiveRole === "pegawai" && row.status !== "dipublikasikan") fail("Hasil belum dipublikasikan.");
		if (actor.effectiveRole === "kepala_unit" && actor.unitId !== row.unit_id && actor.employeeId !== row.employee_id) fail("Kepala unit hanya melihat unitnya.");
		if (actor.effectiveRole === "penilai" && actor.employeeId !== row.assessor_id && actor.employeeId !== row.employee_id) fail("Penilai hanya melihat pegawai binaannya.");
		const showScore = [
			"terverifikasi",
			"final",
			"dipublikasikan"
		].includes(row.status) || canManageMaster(actor);
		return {
			title: "Laporan penilaian individual",
			subtitle: `${base}${demo} · ${row.unit_name}`,
			confidential: true,
			columns: [
				{
					key: "nama",
					label: "Nama"
				},
				{
					key: "unit",
					label: "Unit"
				},
				{
					key: "jabatan",
					label: "Jabatan"
				},
				{
					key: "status",
					label: "Status"
				},
				{
					key: "nilai",
					label: "Nilai akhir"
				},
				{
					key: "kategori",
					label: "Kategori"
				}
			],
			rows: [{
				nama: row.employee_name,
				unit: row.unit_name,
				jabatan: row.position_name,
				status: ASSIGNMENT_STATUS_LABEL[row.status] ?? row.status,
				nilai: showScore && row.final_score != null ? num(row.final_score) : "Belum final",
				kategori: showScore ? row.final_label ?? "-" : "-"
			}]
		};
	}
	if (input.type === "tindak_lanjut") {
		const unitId = actor.effectiveRole === "kepala_unit" && !seesAllUnits(actor) ? actor.unitId : input.unitId || null;
		const rows = await sql`
      select e.full_name as employee_name, u.name as unit_name, d.aspect, d.goal, d.status, d.due_date
      from development_plans d
      join employees e on e.id = d.employee_id
      join organizational_units u on u.id = e.unit_id
      where (${unitId}::text is null or e.unit_id = ${unitId})
        and (${actor.effectiveRole} <> 'pegawai' or e.id = ${actor.employeeId})
        and (${actor.effectiveRole} <> 'penilai' or e.assessor_id = ${actor.employeeId} or e.id = ${actor.employeeId})
      order by u.name, e.full_name
    `;
		return {
			title: "Laporan tindak lanjut pengembangan",
			subtitle: `${institution?.foundation_name ?? "YPIT"} · Dibuat ${stamp}`,
			confidential: true,
			columns: [
				{
					key: "nama",
					label: "Pegawai"
				},
				{
					key: "unit",
					label: "Unit"
				},
				{
					key: "aspek",
					label: "Aspek"
				},
				{
					key: "tujuan",
					label: "Tujuan"
				},
				{
					key: "status",
					label: "Status"
				},
				{
					key: "tenggat",
					label: "Tenggat"
				}
			],
			rows: rows.map((row) => ({
				nama: row.employee_name,
				unit: row.unit_name,
				aspek: row.aspect,
				tujuan: row.goal,
				status: PLAN_STATUS_LABEL[row.status] ?? row.status,
				tenggat: row.due_date ? asText(row.due_date).slice(0, 10) : "-"
			}))
		};
	}
	if ([
		"rekap_yayasan",
		"kelompok",
		"kategori",
		"progres",
		"kesenjangan",
		"kebutuhan",
		"tren"
	].includes(input.type) && !canManageMaster(actor) && actor.effectiveRole !== "pengurus_yayasan" && actor.effectiveRole !== "kepala_unit") fail("Laporan konsolidasi hanya untuk pimpinan unit atau yayasan.");
	let unitId = input.unitId || null;
	if (input.type.startsWith("rekap_")) {
		const map = {
			rekap_kbtk: "kbtk",
			rekap_sd: "sd",
			rekap_smptq: "smptq"
		};
		if (map[input.type]) unitId = map[input.type];
	}
	if (actor.effectiveRole === "kepala_unit" && !seesAllUnits(actor)) {
		if (unitId && unitId !== actor.unitId) fail("Anda hanya dapat melihat laporan unit sendiri.");
		unitId = actor.unitId;
	}
	const data = await sql`
    select a.id, e.full_name as employee_name, u.name as unit_name, e.unit_id, e.group_code, pos.name as position_name,
           a.status, a.final_score, a.final_label, a.breakdown, p.id as period_id, p.name as period_name
    from assessment_assignments a
    join employees e on e.id = a.employee_id
    join organizational_units u on u.id = e.unit_id
    join positions pos on pos.id = e.position_id
    join assessment_periods p on p.id = a.period_id
    where (${input.type === "tren"} or p.id = ${period?.id ?? ""})
      and (${unitId}::text is null or e.unit_id = ${unitId})
      and (${input.group ?? ""} = '' or e.group_code = ${input.group ?? ""})
    order by p.start_date, u.name, e.full_name
  `;
	if (input.type === "progres") return {
		title: "Laporan progres penyelesaian penilaian",
		subtitle: `${base}${demo}`,
		confidential: false,
		columns: [{
			key: "status",
			label: "Status"
		}, {
			key: "jumlah",
			label: "Jumlah"
		}],
		rows: Object.entries(data.reduce((acc, row) => {
			const key = ASSIGNMENT_STATUS_LABEL[row.status] ?? row.status;
			acc[key] = (acc[key] ?? 0) + 1;
			return acc;
		}, {})).map(([status, jumlah]) => ({
			status,
			jumlah
		}))
	};
	if (input.type === "kelompok") {
		const grouped = /* @__PURE__ */ new Map();
		for (const row of data) {
			const key = GROUP_LABEL[row.group_code] ?? row.group_code;
			const item = grouped.get(key) ?? {
				n: 0,
				sum: 0,
				scored: 0
			};
			item.n += 1;
			if (row.final_score != null) {
				item.sum += num(row.final_score);
				item.scored += 1;
			}
			grouped.set(key, item);
		}
		return {
			title: "Laporan berdasarkan kelompok jabatan",
			subtitle: `${base}${demo}`,
			confidential: false,
			columns: [
				{
					key: "kelompok",
					label: "Kelompok"
				},
				{
					key: "pegawai",
					label: "Pegawai"
				},
				{
					key: "dinilai",
					label: "Sudah bernilai"
				},
				{
					key: "rata",
					label: "Rata-rata"
				}
			],
			rows: [...grouped.entries()].map(([kelompok, item]) => ({
				kelompok,
				pegawai: item.n,
				dinilai: item.scored,
				rata: item.scored ? Math.round(item.sum / item.scored * 100) / 100 : "-"
			}))
		};
	}
	if (input.type === "kategori" || input.type === "kebutuhan") {
		const cats = /* @__PURE__ */ new Map();
		for (const row of data) for (const category of row.breakdown?.categories ?? []) {
			if (category.score == null) continue;
			const item = cats.get(category.name) ?? {
				sum: 0,
				n: 0
			};
			item.sum += category.score;
			item.n += 1;
			cats.set(category.name, item);
		}
		const rows = [...cats.entries()].map(([name, item]) => ({
			kategori: name,
			rata: Math.round(item.sum / item.n * 100) / 100,
			sampel: item.n
		})).sort((a, b) => a.rata - b.rata);
		return {
			title: input.type === "kebutuhan" ? "Laporan kebutuhan pengembangan kompetensi" : "Laporan berdasarkan kategori indikator",
			subtitle: `${base}${demo}. Rata-rata dihitung dari penilaian yang sudah memiliki rincian nilai. Bukan peringkat individu.`,
			confidential: false,
			columns: [
				{
					key: "kategori",
					label: "Kategori"
				},
				{
					key: "rata",
					label: "Rata-rata"
				},
				{
					key: "sampel",
					label: "Sampel"
				}
			],
			rows: input.type === "kebutuhan" ? rows.filter((row) => row.rata < 80) : rows
		};
	}
	if (input.type === "tren") {
		const byPeriod = /* @__PURE__ */ new Map();
		for (const row of data) {
			if (row.final_score == null) continue;
			const item = byPeriod.get(row.period_name) ?? {
				sum: 0,
				n: 0
			};
			item.sum += num(row.final_score);
			item.n += 1;
			byPeriod.set(row.period_name, item);
		}
		return {
			title: "Laporan tren kinerja antarsemester",
			subtitle: `${institution?.foundation_name ?? "YPIT"} · Agregat, tanpa peringkat individu · ${stamp}`,
			confidential: false,
			columns: [
				{
					key: "periode",
					label: "Periode"
				},
				{
					key: "sampel",
					label: "Sampel bernilai"
				},
				{
					key: "rata",
					label: "Rata-rata"
				}
			],
			rows: [...byPeriod.entries()].map(([periode, item]) => ({
				periode,
				sampel: item.n,
				rata: Math.round(item.sum / item.n * 100) / 100
			}))
		};
	}
	if (input.type === "kesenjangan") {
		const gaps = await sql`
      select e.full_name as employee_name, i.name as indicator, ss.score as self_score, aps.score as supervisor_score,
             coalesce(ss.is_na, false) as self_na, coalesce(aps.is_na, false) as sup_na
      from assessment_assignments a
      join employees e on e.id = a.employee_id
      join assessment_indicators i on i.category_id in (select id from assessment_categories where version_id = a.version_id)
      left join self_scores ss on ss.assignment_id = a.id and ss.indicator_id = i.id
      left join assessment_scores aps on aps.assignment_id = a.id and aps.indicator_id = i.id
      where a.period_id = ${period.id}
        and (${unitId}::text is null or e.unit_id = ${unitId})
        and a.status in ('menunggu_verifikasi','terverifikasi','final','dipublikasikan','dikembalikan','penilaian_draf')
      order by e.full_name, i.sort_order
      limit 400
    `;
		return {
			title: "Perbandingan evaluasi diri dan penilaian atasan",
			subtitle: `${base}${demo}. Selisih bukan dasar hukuman, melainkan bahan percakapan pengembangan.`,
			confidential: true,
			columns: [
				{
					key: "nama",
					label: "Pegawai"
				},
				{
					key: "indikator",
					label: "Indikator"
				},
				{
					key: "diri",
					label: "Evaluasi diri"
				},
				{
					key: "atasan",
					label: "Atasan"
				},
				{
					key: "selisih",
					label: "Selisih"
				}
			],
			rows: gaps.filter((row) => !row.self_na && !row.sup_na && row.self_score != null && row.supervisor_score != null).map((row) => ({
				nama: row.employee_name,
				indikator: row.indicator,
				diri: num(row.self_score),
				atasan: num(row.supervisor_score),
				selisih: num(row.self_score) - num(row.supervisor_score)
			}))
		};
	}
	return {
		title: {
			rekap_kbtk: "Rekapitulasi KB-TK Islam Pangeran Diponegoro",
			rekap_sd: "Rekapitulasi SD Islam Pangeran Diponegoro",
			rekap_smptq: "Rekapitulasi SMPTQ Pangeran Diponegoro",
			rekap_yayasan: "Rekapitulasi seluruh unit YPIT"
		}[input.type] ?? "Rekapitulasi penilaian",
		subtitle: `${base}${demo}`,
		confidential: true,
		columns: [
			{
				key: "nama",
				label: "Pegawai"
			},
			{
				key: "unit",
				label: "Unit"
			},
			{
				key: "kelompok",
				label: "Kelompok"
			},
			{
				key: "jabatan",
				label: "Jabatan"
			},
			{
				key: "status",
				label: "Status"
			},
			{
				key: "nilai",
				label: "Nilai"
			},
			{
				key: "kategori",
				label: "Kategori"
			}
		],
		rows: data.filter((row) => row.period_id === period.id).map((row) => ({
			nama: row.employee_name,
			unit: row.unit_name,
			kelompok: GROUP_LABEL[row.group_code] ?? row.group_code,
			jabatan: row.position_name,
			status: ASSIGNMENT_STATUS_LABEL[row.status] ?? row.status,
			nilai: row.final_score == null ? "-" : num(row.final_score),
			kategori: row.final_label ?? "-"
		}))
	};
}
function pdfSafe(value) {
	return value.replaceAll("’", "'").replaceAll("“", "\"").replaceAll("”", "\"").replaceAll("–", "-").replaceAll("—", "-").replace(/[^\x0A\x0D\x20-\xFF]/g, "");
}
async function exportReport(userId, input, format) {
	const report = await buildReport(userId, input);
	if (format === "pdf") {
		const { PDFDocument, StandardFonts, rgb } = await import("../_libs/pdf-lib.mjs").then((n) => n.t);
		const doc = await PDFDocument.create();
		const font = await doc.embedFont(StandardFonts.Helvetica);
		const bold = await doc.embedFont(StandardFonts.HelveticaBold);
		const pageSize = [595.28, 841.89];
		let page = doc.addPage(pageSize);
		let y = 800;
		const draw = (text, size, strong = false) => {
			const content = pdfSafe(text).slice(0, 180);
			if (y < 48) {
				page = doc.addPage(pageSize);
				y = 800;
			}
			page.drawText(content, {
				x: 40,
				y,
				size,
				font: strong ? bold : font,
				color: rgb(.08, .22, .18)
			});
			y -= size + 6;
		};
		draw(report.title, 14, true);
		const words = report.subtitle.split(" ");
		let line = "";
		for (const word of words) {
			if ((line + word).length > 95) {
				draw(line, 9);
				line = "";
			}
			line += `${word} `;
		}
		if (line.trim()) draw(line.trim(), 9);
		y -= 6;
		draw(report.columns.map((column) => column.label).join(" | "), 9, true);
		for (const row of report.rows.slice(0, 400)) draw(report.columns.map((column) => String(row[column.key] ?? "")).join(" | "), 8);
		if (!report.rows.length) draw("Tidak ada data pada filter ini.", 10);
		draw("Dokumen internal. Rincian pribadi hanya untuk pihak yang berwenang.", 8);
		const bytes = await doc.save();
		return {
			filename: `${report.title.replaceAll(" ", "-").toLowerCase()}.pdf`,
			mime: "application/pdf",
			base64: Buffer.from(bytes).toString("base64")
		};
	}
	const workbook = new (await (import("../_libs/exceljs+[...].mjs").then((n) => /* @__PURE__ */ __toESM(n.t())))).default.Workbook();
	const sheet = workbook.addWorksheet("Laporan");
	sheet.addRow([report.title]);
	sheet.addRow([report.subtitle]);
	sheet.addRow([]);
	sheet.addRow(report.columns.map((column) => column.label));
	for (const row of report.rows) sheet.addRow(report.columns.map((column) => row[column.key] ?? ""));
	const buffer = await workbook.xlsx.writeBuffer();
	return {
		filename: `${report.title.replaceAll(" ", "-").toLowerCase()}.xlsx`,
		mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		base64: Buffer.from(buffer).toString("base64")
	};
}
async function exportBackup(userId) {
	const actor = await loadActor(userId);
	if (!canManageMaster(actor)) fail("Cadangan data hanya dapat diunduh Super Administrator.");
	const sql = await db();
	const payload = {
		exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
		note: "Cadangan data aplikasi. Pulihkan dengan bantuan administrator basis data. Jangan bagikan berkas ini karena memuat data kepegawaian.",
		units: await sql`select * from organizational_units`,
		positions: await sql`select * from positions`,
		employees: await sql`select id, code, full_name, unit_id, position_id, group_code, employment_status, active, is_demo, include_in_assessment from employees`,
		periods: await sql`select id, name, academic_year, semester, status, is_demo from assessment_periods`,
		assignments: await sql`select id, period_id, employee_id, status, final_score, final_label from assessment_assignments`,
		plans: await sql`select id, employee_id, aspect, status, due_date from development_plans`
	};
	return {
		filename: `cadangan-ypit-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`,
		mime: "application/json",
		base64: Buffer.from(JSON.stringify(payload, null, 2)).toString("base64")
	};
}
//#endregion
export { buildReport, exportBackup, exportReport, getDashboard, runScoreSelfTest, sumStatus };
