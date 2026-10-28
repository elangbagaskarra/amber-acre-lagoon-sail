import { s as isRole } from "./labels-b_RKwhV6.mjs";
import { r as getSql } from "./db-BoZIM3To.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/workflow-core-Df05Ue6E.js
async function db() {
	return getSql();
}
function nid(prefix) {
	return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}
function plain(value) {
	return JSON.parse(JSON.stringify(value));
}
function num(value) {
	if (typeof value === "number") return Number.isFinite(value) ? value : 0;
	if (typeof value === "string" && value.trim() !== "") {
		const n = Number(value);
		return Number.isFinite(n) ? n : 0;
	}
	return 0;
}
function asText(value) {
	if (value == null) return "";
	if (value instanceof Date) return value.toISOString();
	return String(value);
}
var AppError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "AppError";
	}
};
function fail(message) {
	throw new AppError(message);
}
var Params = class {
	values = [];
	add(value) {
		this.values.push(value);
		return `$${this.values.length}`;
	}
};
var DEFAULT_BANDS = [
	{
		min: 90,
		max: 100,
		minInclusive: true,
		maxInclusive: true,
		label: "Sangat Baik"
	},
	{
		min: 80,
		max: 90,
		minInclusive: true,
		maxInclusive: false,
		label: "Baik"
	},
	{
		min: 70,
		max: 80,
		minInclusive: true,
		maxInclusive: false,
		label: "Cukup"
	},
	{
		min: 60,
		max: 70,
		minInclusive: true,
		maxInclusive: false,
		label: "Perlu Pembinaan"
	},
	{
		min: 0,
		max: 60,
		minInclusive: true,
		maxInclusive: false,
		label: "Memerlukan Evaluasi Intensif"
	}
];
function round2(n) {
	return Math.round((n + Number.EPSILON) * 100) / 100;
}
function labelFor(score, bands) {
	const ordered = [...bands].sort((a, b) => b.min - a.min);
	for (const band of ordered) {
		const above = band.minInclusive ? score >= band.min : score > band.min;
		const below = band.maxInclusive ? score <= band.max : score < band.max;
		if (above && below) return band.label;
	}
	return "Belum diklasifikasi";
}
function weightsLookValid(weights) {
	const total = round2(weights.reduce((s, w) => s + w, 0));
	return {
		ok: Math.abs(total - 100) < .05,
		total
	};
}
/**
* Nilai indikator = (skor / 5) × 100.
* Nilai kategori = rata-rata tertimbang indikator yang berlaku.
* Nilai akhir = jumlah (nilai kategori × bobot kategori), dengan normalisasi
* jika ada indikator atau kategori yang disetujui tidak berlaku.
* Evaluasi diri tidak masuk ke nilai akhir.
*/
function computeScore(items, bands = DEFAULT_BANDS) {
	const warnings = [];
	const byCat = /* @__PURE__ */ new Map();
	for (const item of items) {
		const list = byCat.get(item.categoryId) ?? [];
		list.push(item);
		byCat.set(item.categoryId, list);
	}
	let pendingNa = 0;
	let missing = 0;
	const draft = [];
	for (const [categoryId, inds] of byCat) {
		const sample = inds[0];
		const applicable = inds.filter((i) => !(i.isNa && i.naApproved));
		const pending = inds.filter((i) => i.isNa && !i.naApproved);
		pendingNa += pending.length;
		for (const ind of applicable) if (!ind.isNa && (ind.score == null || ind.score < 1 || ind.score > 5)) missing += 1;
		const excluded = applicable.length === 0;
		const weightSum = applicable.reduce((s, i) => s + i.indicatorWeight, 0);
		const indicators = inds.slice().sort((a, b) => a.indicatorOrder - b.indicatorOrder).map((ind) => {
			const dropped = ind.isNa && ind.naApproved;
			const pendingItem = ind.isNa && !ind.naApproved;
			const pct = !dropped && !pendingItem && ind.score != null ? round2(ind.score / 5 * 100) : null;
			const normalizedWeight = !dropped && weightSum > 0 ? round2(ind.indicatorWeight / weightSum * 100) : 0;
			return {
				indicatorId: ind.indicatorId,
				name: ind.indicatorName,
				weight: ind.indicatorWeight,
				normalizedWeight,
				score: ind.score,
				percent: pct,
				excluded: dropped,
				pendingNa: pendingItem
			};
		});
		let score = null;
		if (!excluded && missing === 0 && pending.length === 0 && weightSum > 0) score = round2(applicable.reduce((s, ind) => {
			return s + (ind.score ?? 0) / 5 * 100 * ind.indicatorWeight;
		}, 0) / weightSum);
		draft.push({
			categoryId,
			name: sample.categoryName,
			weight: sample.categoryWeight,
			normalizedWeight: 0,
			score,
			excluded,
			indicators
		});
		draft.sort((a, b) => {
			const ao = inds[0]?.categoryOrder ?? 0;
			return ao - ao;
		});
	}
	const order = /* @__PURE__ */ new Map();
	for (const item of items) order.set(item.categoryId, item.categoryOrder);
	draft.sort((a, b) => (order.get(a.categoryId) ?? 0) - (order.get(b.categoryId) ?? 0));
	const activeCats = draft.filter((c) => !c.excluded);
	const catWeightSum = activeCats.reduce((s, c) => s + c.weight, 0);
	for (const cat of draft) cat.normalizedWeight = !cat.excluded && catWeightSum > 0 ? round2(cat.weight / catWeightSum * 100) : 0;
	const complete = items.length > 0 && pendingNa === 0 && missing === 0 && activeCats.length > 0 && activeCats.every((c) => c.score != null);
	let finalScore = null;
	if (complete && catWeightSum > 0) finalScore = round2(activeCats.reduce((s, c) => s + (c.score ?? 0) * c.weight, 0) / catWeightSum);
	if (pendingNa > 0) warnings.push("Ada indikator N/A yang belum disetujui pejabat berwenang.");
	if (missing > 0) warnings.push("Masih ada indikator yang belum diberi skor.");
	if (items.length === 0) warnings.push("Tidak ada indikator yang berlaku untuk pegawai ini.");
	const excludedCats = draft.filter((c) => c.excluded);
	if (excludedCats.length) warnings.push(`Kategori dikeluarkan karena seluruh indikatornya tidak berlaku: ${excludedCats.map((c) => c.name).join(", ")}. Bobot dinormalisasi.`);
	return {
		complete,
		finalScore,
		label: finalScore == null ? null : labelFor(finalScore, bands),
		pendingNa,
		missing,
		categories: draft,
		warnings
	};
}
function item(partial) {
	return {
		categoryOrder: partial.categoryOrder ?? 1,
		indicatorName: partial.indicatorName ?? partial.indicatorId,
		indicatorOrder: partial.indicatorOrder ?? 1,
		isNa: partial.isNa ?? false,
		naApproved: partial.naApproved ?? false,
		...partial
	};
}
/** Kasus yang dapat dihitung manual. Dipakai uji otomatis dan halaman panduan. */
function workedExamples() {
	return [
		{
			name: "Seluruh indikator skor 4 menghasilkan 80 (Baik)",
			expected: 80,
			items: [
				item({
					indicatorId: "a1",
					categoryId: "A",
					categoryName: "Perencanaan",
					categoryWeight: 60,
					categoryOrder: 1,
					indicatorWeight: 50,
					indicatorOrder: 1,
					score: 4
				}),
				item({
					indicatorId: "a2",
					categoryId: "A",
					categoryName: "Perencanaan",
					categoryWeight: 60,
					categoryOrder: 1,
					indicatorWeight: 50,
					indicatorOrder: 2,
					score: 4
				}),
				item({
					indicatorId: "b1",
					categoryId: "B",
					categoryName: "Pelaksanaan",
					categoryWeight: 40,
					categoryOrder: 2,
					indicatorWeight: 100,
					indicatorOrder: 1,
					score: 4
				})
			]
		},
		{
			name: "Kategori campuran: perencanaan 5 dan 3 (rata-rata 80), pelaksanaan 4",
			expected: 80,
			items: [
				item({
					indicatorId: "a1",
					categoryId: "A",
					categoryName: "Perencanaan",
					categoryWeight: 60,
					categoryOrder: 1,
					indicatorWeight: 50,
					score: 5
				}),
				item({
					indicatorId: "a2",
					categoryId: "A",
					categoryName: "Perencanaan",
					categoryWeight: 60,
					categoryOrder: 1,
					indicatorWeight: 50,
					indicatorOrder: 2,
					score: 3
				}),
				item({
					indicatorId: "b1",
					categoryId: "B",
					categoryName: "Pelaksanaan",
					categoryWeight: 40,
					categoryOrder: 2,
					indicatorWeight: 100,
					score: 4
				})
			]
		},
		{
			name: "Indikator N/A yang disetujui menormalisasi bobot indikator",
			expected: 80,
			items: [
				item({
					indicatorId: "a1",
					categoryId: "A",
					categoryName: "Perencanaan",
					categoryWeight: 50,
					categoryOrder: 1,
					indicatorWeight: 50,
					score: 5
				}),
				item({
					indicatorId: "a2",
					categoryId: "A",
					categoryName: "Perencanaan",
					categoryWeight: 50,
					categoryOrder: 1,
					indicatorWeight: 50,
					indicatorOrder: 2,
					score: null,
					isNa: true,
					naApproved: true
				}),
				item({
					indicatorId: "b1",
					categoryId: "B",
					categoryName: "Pelaksanaan",
					categoryWeight: 50,
					categoryOrder: 2,
					indicatorWeight: 100,
					score: 3
				})
			]
		},
		{
			name: "Kategori yang seluruhnya N/A disetujui dikeluarkan dan bobot dinormalisasi",
			expected: 80,
			items: [
				item({
					indicatorId: "a1",
					categoryId: "A",
					categoryName: "Perencanaan",
					categoryWeight: 40,
					categoryOrder: 1,
					indicatorWeight: 100,
					score: 4
				}),
				item({
					indicatorId: "b1",
					categoryId: "B",
					categoryName: "Pelaksanaan",
					categoryWeight: 40,
					categoryOrder: 2,
					indicatorWeight: 100,
					score: 4
				}),
				item({
					indicatorId: "c1",
					categoryId: "C",
					categoryName: "Kolaborasi",
					categoryWeight: 20,
					categoryOrder: 3,
					indicatorWeight: 100,
					score: null,
					isNa: true,
					naApproved: true
				})
			]
		}
	];
}
function ind(code, name, weight, extra) {
	return {
		code,
		name,
		weight,
		...extra
	};
}
var TEMPLATES = [
	{
		id: "tpl_guru",
		code: "guru",
		name: "Instrumen Guru",
		audience: "guru",
		description: "Instrumen awal guru. Indikator umum berlaku di semua unit. Indikator khusus unit atau tanggung jawab hanya dinilai jika relevan.",
		categories: [
			{
				code: "perencanaan",
				name: "Perencanaan pembelajaran",
				weight: 15,
				indicators: [
					ind("plan-kurikulum", "Menyusun perencanaan sesuai kurikulum dan kebijakan yang berlaku.", 25),
					ind("plan-tujuan", "Menetapkan tujuan pembelajaran yang jelas.", 25),
					ind("plan-media", "Menyiapkan metode, bahan, dan media yang relevan.", 25),
					ind("plan-difer", "Menyesuaikan kegiatan dengan kebutuhan peserta didik.", 25),
					ind("plan-kbtk-bermain", "Perencanaan kegiatan bermain sambil belajar.", 20, { unitScope: "kbtk" }),
					ind("plan-sd-jenjang", "Perencanaan pembelajaran sesuai jenjang kelas.", 20, { unitScope: "sd" }),
					ind("plan-sd-litnum", "Perencanaan penguatan literasi dan numerasi.", 20, { unitScope: "sd" }),
					ind("plan-smp-mapel", "Perencanaan pembelajaran mata pelajaran sesuai jenjang SMP.", 20, { unitScope: "smptq" }),
					ind("plan-smp-quran", "Perencanaan pembelajaran Al-Qur'an, tahsin, atau tahfiz sesuai penugasan.", 20, {
						unitScope: "smptq",
						responsibilityKey: "tahfiz"
					})
				]
			},
			{
				code: "pelaksanaan",
				name: "Pelaksanaan pembelajaran",
				weight: 25,
				indicators: [
					ind("exec-materi", "Menguasai materi.", 20),
					ind("exec-metode", "Menggunakan metode yang sesuai.", 20),
					ind("exec-kelas", "Mengelola kelas secara efektif.", 20),
					ind("exec-partisipasi", "Mendorong partisipasi peserta didik.", 20),
					ind("exec-waktu", "Memanfaatkan waktu pembelajaran dengan baik.", 20),
					ind("exec-kbtk-stimulasi", "Stimulasi perkembangan anak sesuai tahap usia.", 20, { unitScope: "kbtk" }),
					ind("exec-kbtk-aman", "Pengelolaan kelas yang aman dan ramah anak.", 20, { unitScope: "kbtk" }),
					ind("exec-sd-libatkan", "Pengelolaan kelas dan keterlibatan peserta didik pada jenjang SD.", 20, { unitScope: "sd" }),
					ind("exec-smp-karakter", "Pembinaan karakter dan kedisiplinan remaja selama pembelajaran.", 20, { unitScope: "smptq" }),
					ind("exec-smp-quran", "Pelaksanaan pembelajaran Al-Qur'an, tahsin, atau tahfiz.", 20, {
						unitScope: "smptq",
						responsibilityKey: "tahfiz"
					})
				]
			},
			{
				code: "asesmen",
				name: "Asesmen dan tindak lanjut pembelajaran",
				weight: 15,
				indicators: [
					ind("ases-tujuan", "Melaksanakan asesmen sesuai tujuan.", 20),
					ind("ases-umpan", "Memberikan umpan balik.", 20),
					ind("ases-analisis", "Menganalisis perkembangan hasil belajar.", 20),
					ind("ases-remedial", "Melakukan remedial atau pengayaan jika diperlukan.", 20),
					ind("ases-dokumen", "Mendokumentasikan hasil asesmen.", 20),
					ind("ases-kbtk-dok", "Pengamatan dan dokumentasi perkembangan anak.", 20, { unitScope: "kbtk" }),
					ind("ases-sd-pantau", "Asesmen dan pemantauan kemajuan belajar jenjang SD.", 20, { unitScope: "sd" }),
					ind("ases-smp-akademik", "Pemantauan perkembangan akademik peserta didik.", 20, { unitScope: "smptq" }),
					ind("ases-smp-hafalan", "Pemantauan target hafalan atau bacaan apabila menjadi bagian resmi tugas.", 20, {
						unitScope: "smptq",
						responsibilityKey: "tahfiz"
					})
				]
			},
			{
				code: "perlindungan",
				name: "Perkembangan dan perlindungan peserta didik",
				weight: 10,
				indicators: [
					ind("lindung-kebutuhan", "Memperhatikan kebutuhan dan perkembangan peserta didik.", 25),
					ind("lindung-aman", "Membangun lingkungan belajar yang aman.", 25),
					ind("lindung-adil", "Menunjukkan sikap adil dan menghormati peserta didik.", 25),
					ind("lindung-lapor", "Melaporkan atau menindaklanjuti masalah sesuai prosedur lembaga.", 25),
					ind("lindung-kbtk-ortu", "Komunikasi dengan orang tua mengenai perkembangan anak.", 20, { unitScope: "kbtk" }),
					ind("lindung-sd-diff", "Pembelajaran yang memperhatikan perbedaan kebutuhan peserta didik.", 20, { unitScope: "sd" })
				]
			},
			{
				code: "kompetensi",
				name: "Pengembangan kompetensi profesional",
				weight: 10,
				indicators: [
					ind("komp-refleksi", "Melakukan refleksi praktik mengajar.", 25),
					ind("komp-kegiatan", "Mengikuti kegiatan pengembangan profesional yang relevan.", 25),
					ind("komp-terap", "Menerapkan hasil pelatihan dalam pembelajaran.", 25),
					ind("komp-jabatan", "Mengembangkan kemampuan sesuai kebutuhan jabatan.", 25)
				]
			},
			{
				code: "disiplin",
				name: "Kedisiplinan dan tanggung jawab",
				weight: 10,
				indicators: [
					ind("disiplin-jadwal", "Memenuhi jadwal mengajar.", 25),
					ind("disiplin-admin", "Menyelesaikan tugas administratif yang relevan.", 25),
					ind("disiplin-tambahan", "Menjalankan tugas tambahan sesuai penugasan.", 25),
					ind("disiplin-aturan", "Mematuhi peraturan dan prosedur lembaga.", 25)
				]
			},
			{
				code: "akhlak",
				name: "Akhlak, keteladanan, dan nilai Islami",
				weight: 10,
				indicators: [
					ind("akhlak-jujur", "Menunjukkan perilaku jujur dan amanah.", 25),
					ind("akhlak-teladan", "Menjadi teladan dalam sikap dan perilaku.", 25),
					ind("akhlak-etika", "Menjaga etika komunikasi.", 25),
					ind("akhlak-budaya", "Mendukung budaya Islami sesuai visi dan kebijakan yayasan.", 25),
					ind("akhlak-kbtk", "Pembiasaan karakter dan nilai Islami yang sesuai usia.", 20, { unitScope: "kbtk" }),
					ind("akhlak-sd", "Penguatan karakter, kedisiplinan, dan nilai Islami di jenjang SD.", 20, { unitScope: "sd" }),
					ind("akhlak-smp", "Keteladanan dan penguatan nilai Islami bagi peserta didik remaja.", 20, { unitScope: "smptq" })
				]
			},
			{
				code: "kolaborasi",
				name: "Kolaborasi dan kontribusi lembaga",
				weight: 5,
				indicators: [
					ind("kolab-rekan", "Bekerja sama dengan rekan kerja.", 25),
					ind("kolab-ortu", "Berkomunikasi secara profesional dengan orang tua.", 25),
					ind("kolab-kegiatan", "Berpartisipasi dalam kegiatan lembaga sesuai penugasan.", 25),
					ind("kolab-mutu", "Berkontribusi terhadap perbaikan mutu pendidikan.", 25)
				]
			}
		]
	},
	{
		id: "tpl_tendik",
		code: "tendik",
		name: "Instrumen Tenaga Kependidikan",
		audience: "tendik",
		description: "Instrumen awal tenaga kependidikan. Indikator khusus jabatan hanya berlaku bagi jabatan tersebut dan bobotnya dinormalisasi.",
		categories: [
			{
				code: "kualitas",
				name: "Kualitas dan ketepatan hasil kerja",
				weight: 25,
				indicators: [
					ind("t-teliti", "Ketelitian dan kualitas pekerjaan.", 50),
					ind("t-tepat", "Ketepatan penyelesaian tugas.", 50),
					ind("t-keu", "Ketepatan dan kerapian laporan keuangan sesuai prosedur.", 30, { positionCodes: ["keuangan"] }),
					ind("t-perpus", "Pengelolaan koleksi dan layanan perpustakaan.", 30, { positionCodes: ["perpustakaan"] }),
					ind("t-lab", "Keselamatan dan ketertiban penggunaan laboratorium.", 30, { positionCodes: ["laboratorium"] }),
					ind("t-op", "Kelengkapan dan ketepatan data yang dikelola.", 30, { positionCodes: ["operator"] }),
					ind("t-bersih", "Kebersihan area sesuai jadwal dan standar unit.", 30, { positionCodes: ["kebersihan"] }),
					ind("t-aman", "Kesiapsiagaan dan pengawasan keamanan lingkungan.", 30, { positionCodes: ["keamanan"] }),
					ind("t-tu", "Kelengkapan administrasi surat dan arsip.", 30, { positionCodes: ["tu"] }),
					ind("t-layan", "Ketepatan layanan loket kepada warga sekolah.", 30, { positionCodes: ["layanan"] })
				]
			},
			{
				code: "produktivitas",
				name: "Produktivitas dan pencapaian target",
				weight: 20,
				indicators: [ind("t-target", "Pencapaian target sesuai jabatan.", 50), ind("t-volume", "Penyelesaian beban kerja pada waktunya.", 50)]
			},
			{
				code: "disiplin",
				name: "Kedisiplinan dan kepatuhan prosedur",
				weight: 15,
				indicators: [ind("t-prosedur", "Kepatuhan terhadap prosedur kerja.", 50), ind("t-hadir", "Kedisiplinan dan tanggung jawab kehadiran.", 50)]
			},
			{
				code: "pelayanan",
				name: "Pelayanan dan komunikasi",
				weight: 15,
				indicators: [ind("t-warga", "Kualitas pelayanan kepada warga sekolah.", 50), ind("t-komunikasi", "Komunikasi yang sopan, jelas, dan tepat.", 50)]
			},
			{
				code: "kompetensi",
				name: "Kompetensi dan pemecahan masalah",
				weight: 10,
				indicators: [ind("t-skill", "Penguasaan keterampilan kerja.", 50), ind("t-masalah", "Kemampuan menyelesaikan masalah.", 50)]
			},
			{
				code: "integritas",
				name: "Integritas, amanah, dan etika kerja Islami",
				weight: 10,
				indicators: [ind("t-amanah", "Kejujuran, amanah, dan etika kerja.", 50), ind("t-islami", "Etika kerja Islami dalam pelayanan.", 50)]
			},
			{
				code: "kerjasama",
				name: "Kerja sama dan kontribusi lembaga",
				weight: 5,
				indicators: [ind("t-tim", "Kerja sama dengan rekan kerja.", 50), ind("t-kontribusi", "Kontribusi terhadap unit.", 50)]
			}
		]
	},
	{
		id: "tpl_pimpinan",
		code: "pimpinan",
		name: "Instrumen Pimpinan Unit",
		audience: "pimpinan",
		description: "Instrumen awal kepala unit. Indikator kelas tidak diterapkan agar pimpinan dinilai menurut tanggung jawab pengelolaan, bukan target tahfiz atau administrasi yang bukan tugasnya.",
		categories: [
			{
				code: "kepemimpinan",
				name: "Kepemimpinan dan pengelolaan unit",
				weight: 25,
				indicators: [
					ind("p-arah", "Menetapkan arah kerja unit yang jelas.", 25),
					ind("p-keputusan", "Mengambil keputusan yang adil dan dapat dipertanggungjawabkan.", 25),
					ind("p-iklim", "Menjaga iklim kerja yang aman dan tertib.", 25),
					ind("p-teladan", "Memberi teladan kedisiplinan kepada guru dan pegawai.", 25)
				]
			},
			{
				code: "mutu",
				name: "Mutu pembelajaran dan layanan",
				weight: 20,
				indicators: [ind("p-mutu", "Memantau mutu pembelajaran atau layanan unit.", 50), ind("p-tindak", "Menindaklanjuti temuan mutu secara terukur.", 50)]
			},
			{
				code: "pembinaan",
				name: "Pembinaan guru dan pegawai",
				weight: 15,
				indicators: [ind("p-bina", "Membina guru dan pegawai berdasarkan kebutuhan.", 50), ind("p-adil", "Menegakkan aturan secara adil.", 50)]
			},
			{
				code: "disiplin",
				name: "Kedisiplinan dan kepatuhan",
				weight: 10,
				indicators: [ind("p-aturan", "Mematuhi kebijakan yayasan dan prosedur unit.", 50), ind("p-laporan", "Menyampaikan laporan unit tepat waktu.", 50)]
			},
			{
				code: "akhlak",
				name: "Akhlak, keteladanan, dan nilai Islami",
				weight: 15,
				indicators: [
					ind("p-amanah", "Menunjukkan kejujuran dan amanah dalam pengelolaan unit.", 34),
					ind("p-islami", "Menguatkan budaya Islami di unit.", 33),
					ind("p-etika", "Menjaga etika komunikasi dengan warga sekolah.", 33)
				]
			},
			{
				code: "kolaborasi",
				name: "Kolaborasi dengan yayasan dan orang tua",
				weight: 10,
				indicators: [ind("p-yayasan", "Berkoordinasi dengan pengurus yayasan.", 50), ind("p-ortu", "Membangun komunikasi yang baik dengan orang tua.", 50)]
			},
			{
				code: "pengembangan",
				name: "Pengembangan diri",
				weight: 5,
				indicators: [ind("p-diri", "Mengembangkan kompetensi kepemimpinan.", 100)]
			}
		]
	}
];
function rubricFor(name) {
	return [
		`Jauh di bawah standar. ${name} belum tampak dan memerlukan pendampingan intensif.`,
		`Di bawah standar. ${name} baru sebagian terpenuhi dan perlu perbaikan terarah.`,
		`Memenuhi standar. ${name} sesuai ekspektasi jabatan.`,
		`Melampaui standar. ${name} lebih baik dari ekspektasi dengan bukti yang jelas.`,
		`Jauh melampaui standar. ${name} konsisten unggul dan menunjukkan kontribusi tambahan.`
	];
}
var DEMO_EMPLOYEES = [
	{
		id: "demo-yay-pengurus",
		code: "DEMO-YAY-PENGURUS",
		fullName: "Pengurus Yayasan (Demo)",
		unitId: "yayasan",
		positionId: "pengurus",
		group: "pimpinan",
		demoRole: "pengurus_yayasan",
		include: false
	},
	{
		id: "demo-yay-penilai",
		code: "DEMO-YAY-PENILAI",
		fullName: "Penilai Yayasan (Demo)",
		unitId: "yayasan",
		positionId: "pengurus",
		group: "pimpinan",
		demoRole: "penilai",
		include: false
	},
	{
		id: "demo-yay-ver",
		code: "DEMO-YAY-VER",
		fullName: "Verifikator Yayasan (Demo)",
		unitId: "yayasan",
		positionId: "pengurus",
		group: "pimpinan",
		demoRole: "pengurus_yayasan",
		include: false
	},
	{
		id: "demo-kbtk-kep",
		code: "DEMO-KBTK-KEP",
		fullName: "Kepala Unit Demo KB-TK",
		unitId: "kbtk",
		positionId: "kepala-unit",
		group: "pimpinan",
		demoRole: "kepala_unit",
		assessorId: "demo-yay-penilai",
		verifierId: "demo-yay-ver",
		supervisorId: "demo-yay-pengurus",
		include: true
	},
	{
		id: "demo-sd-kep",
		code: "DEMO-SD-KEP",
		fullName: "Kepala Unit Demo SD",
		unitId: "sd",
		positionId: "kepala-unit",
		group: "pimpinan",
		demoRole: "kepala_unit",
		assessorId: "demo-yay-penilai",
		verifierId: "demo-yay-ver",
		supervisorId: "demo-yay-pengurus",
		include: true
	},
	{
		id: "demo-smp-kep",
		code: "DEMO-SMPTQ-KEP",
		fullName: "Kepala Unit Demo SMPTQ",
		unitId: "smptq",
		positionId: "kepala-unit",
		group: "pimpinan",
		demoRole: "kepala_unit",
		assessorId: "demo-yay-penilai",
		verifierId: "demo-yay-ver",
		supervisorId: "demo-yay-pengurus",
		include: true
	},
	{
		id: "demo-kbtk-pen",
		code: "DEMO-KBTK-PEN",
		fullName: "Penilai Demo KB-TK",
		unitId: "kbtk",
		positionId: "wakil-kepala",
		group: "pimpinan",
		demoRole: "penilai",
		assessorId: "demo-kbtk-kep",
		verifierId: "demo-yay-ver",
		supervisorId: "demo-kbtk-kep",
		include: true
	},
	{
		id: "demo-sd-pen",
		code: "DEMO-SD-PEN",
		fullName: "Penilai Demo SD",
		unitId: "sd",
		positionId: "wakil-kepala",
		group: "pimpinan",
		demoRole: "penilai",
		assessorId: "demo-sd-kep",
		verifierId: "demo-yay-ver",
		supervisorId: "demo-sd-kep",
		include: true
	},
	{
		id: "demo-smp-pen",
		code: "DEMO-SMPTQ-PEN",
		fullName: "Penilai Demo SMPTQ",
		unitId: "smptq",
		positionId: "wakil-kepala",
		group: "pimpinan",
		demoRole: "penilai",
		assessorId: "demo-smp-kep",
		verifierId: "demo-yay-ver",
		supervisorId: "demo-smp-kep",
		include: true
	},
	{
		id: "demo-kbtk-g01",
		code: "DEMO-KBTK-G01",
		fullName: "Guru Demo KB-TK 1",
		unitId: "kbtk",
		positionId: "guru-kelas",
		group: "guru",
		demoRole: "pegawai",
		assessorId: "demo-kbtk-pen",
		verifierId: "demo-kbtk-kep",
		supervisorId: "demo-kbtk-pen",
		include: true
	},
	{
		id: "demo-kbtk-g02",
		code: "DEMO-KBTK-G02",
		fullName: "Guru Demo KB-TK 2",
		unitId: "kbtk",
		positionId: "guru-pai",
		group: "guru",
		demoRole: "pegawai",
		assessorId: "demo-kbtk-pen",
		verifierId: "demo-kbtk-kep",
		supervisorId: "demo-kbtk-pen",
		include: true
	},
	{
		id: "demo-sd-g01",
		code: "DEMO-SD-G01",
		fullName: "Guru Demo SD 1",
		unitId: "sd",
		positionId: "guru-kelas",
		group: "guru",
		demoRole: "pegawai",
		assessorId: "demo-sd-pen",
		verifierId: "demo-sd-kep",
		supervisorId: "demo-sd-pen",
		include: true
	},
	{
		id: "demo-sd-g02",
		code: "DEMO-SD-G02",
		fullName: "Guru Demo SD 2",
		unitId: "sd",
		positionId: "guru-mapel",
		group: "guru",
		demoRole: "pegawai",
		assessorId: "demo-sd-pen",
		verifierId: "demo-sd-kep",
		supervisorId: "demo-sd-pen",
		include: true
	},
	{
		id: "demo-smp-g01",
		code: "DEMO-SMPTQ-G01",
		fullName: "Guru Mapel Demo SMPTQ",
		unitId: "smptq",
		positionId: "guru-mapel",
		group: "guru",
		demoRole: "pegawai",
		assessorId: "demo-smp-pen",
		verifierId: "demo-smp-kep",
		supervisorId: "demo-smp-pen",
		include: true
	},
	{
		id: "demo-smp-q01",
		code: "DEMO-SMPTQ-Q01",
		fullName: "Guru Al-Qur'an Demo SMPTQ",
		unitId: "smptq",
		positionId: "guru-quran",
		group: "guru",
		demoRole: "pegawai",
		assessorId: "demo-smp-pen",
		verifierId: "demo-smp-kep",
		supervisorId: "demo-smp-pen",
		include: true,
		responsibilities: [{
			key: "tahfiz",
			label: "Pembelajaran Al-Qur'an, tahsin, atau tahfiz"
		}]
	},
	{
		id: "demo-sd-tu",
		code: "DEMO-SD-TU",
		fullName: "Tenaga Administrasi Demo SD",
		unitId: "sd",
		positionId: "tu",
		group: "tendik",
		demoRole: "pegawai",
		assessorId: "demo-sd-pen",
		verifierId: "demo-sd-kep",
		supervisorId: "demo-sd-pen",
		include: true
	},
	{
		id: "demo-kbtk-keu",
		code: "DEMO-KBTK-KEU",
		fullName: "Tenaga Keuangan Demo KB-TK",
		unitId: "kbtk",
		positionId: "keuangan",
		group: "tendik",
		demoRole: "pegawai",
		assessorId: "demo-kbtk-pen",
		verifierId: "demo-kbtk-kep",
		supervisorId: "demo-kbtk-pen",
		include: true
	},
	{
		id: "demo-smp-keb",
		code: "DEMO-SMPTQ-KEB",
		fullName: "Petugas Kebersihan Demo SMPTQ",
		unitId: "smptq",
		positionId: "kebersihan",
		group: "tendik",
		demoRole: "pegawai",
		assessorId: "demo-smp-pen",
		verifierId: "demo-smp-kep",
		supervisorId: "demo-smp-pen",
		include: true
	}
];
var POSITIONS = [
	{
		id: "guru-kelas",
		code: "GURU-KELAS",
		name: "Guru Kelas",
		group: "guru",
		description: "Guru yang mengampu kelas."
	},
	{
		id: "guru-mapel",
		code: "GURU-MAPEL",
		name: "Guru Mata Pelajaran",
		group: "guru",
		description: "Guru mata pelajaran."
	},
	{
		id: "guru-pai",
		code: "GURU-PAI",
		name: "Guru Pendidikan Agama Islam",
		group: "guru",
		description: "Guru PAI."
	},
	{
		id: "guru-quran",
		code: "GURU-QURAN",
		name: "Guru Al-Qur'an",
		group: "guru",
		description: "Guru dengan tugas Al-Qur'an, tahsin, atau tahfiz."
	},
	{
		id: "kepala-unit",
		code: "KEPALA-UNIT",
		name: "Kepala Unit",
		group: "pimpinan",
		description: "Kepala unit pendidikan."
	},
	{
		id: "wakil-kepala",
		code: "WAKIL-KEPALA",
		name: "Wakil Kepala",
		group: "pimpinan",
		description: "Wakil kepala atau penilai yang ditunjuk."
	},
	{
		id: "pengurus",
		code: "PENGURUS",
		name: "Pengurus Yayasan",
		group: "pimpinan",
		description: "Pengurus pada tingkat yayasan."
	},
	{
		id: "tu",
		code: "TU",
		name: "Tenaga Administrasi",
		group: "tendik",
		description: "Tata usaha dan administrasi."
	},
	{
		id: "keuangan",
		code: "KEUANGAN",
		name: "Tenaga Keuangan",
		group: "tendik",
		description: "Pengelola keuangan unit."
	},
	{
		id: "perpustakaan",
		code: "PERPUSTAKAAN",
		name: "Pustakawan",
		group: "tendik",
		description: "Pengelola perpustakaan."
	},
	{
		id: "laboratorium",
		code: "LABORATORIUM",
		name: "Laboran",
		group: "tendik",
		description: "Pengelola laboratorium."
	},
	{
		id: "operator",
		code: "OPERATOR",
		name: "Operator",
		group: "tendik",
		description: "Operator data dan sistem."
	},
	{
		id: "layanan",
		code: "LAYANAN",
		name: "Petugas Layanan",
		group: "tendik",
		description: "Petugas layanan warga sekolah."
	},
	{
		id: "kebersihan",
		code: "KEBERSIHAN",
		name: "Petugas Kebersihan",
		group: "tendik",
		description: "Petugas kebersihan."
	},
	{
		id: "keamanan",
		code: "KEAMANAN",
		name: "Petugas Keamanan",
		group: "tendik",
		description: "Petugas keamanan."
	}
];
var SETTINGS = {
	foundation_name: "Yayasan Pendidikan Islam Tembalang",
	short_name: "YPIT",
	app_name: "Sistem Informasi Penilaian Kinerja Guru dan Pegawai",
	address: "",
	phone: "",
	email: "",
	head_name: "",
	head_title: "",
	logo_data_url: ""
};
async function ensureSeed() {
	const sql = await db();
	if ((await sql`select key from app_settings where key = 'seed_version'`).length > 0) return;
	await sql`
    insert into organizational_units (id, code, name, kind, parent_id, level_code, head_title)
    values
      ('yayasan', 'YPIT', 'Yayasan Pendidikan Islam Tembalang', 'yayasan', null, 'yayasan', 'Ketua Yayasan'),
      ('kbtk', 'KB-TK', 'KB-TK Islam Pangeran Diponegoro', 'unit', 'yayasan', 'kbtk', 'Kepala KB-TK'),
      ('sd', 'SD', 'SD Islam Pangeran Diponegoro', 'unit', 'yayasan', 'sd', 'Kepala SD'),
      ('smptq', 'SMPTQ', 'SMPTQ Pangeran Diponegoro', 'unit', 'yayasan', 'smptq', 'Kepala SMPTQ')
    on conflict (id) do nothing
  `;
	for (const band of DEFAULT_BANDS) await sql`
      insert into result_bands (id, min_score, max_score, min_inclusive, max_inclusive, label, sort_order, active)
      values (
        ${`band_${band.min}_${band.max}`}, ${band.min}, ${band.max}, ${band.minInclusive}, ${band.maxInclusive},
        ${band.label}, ${100 - band.min}, true
      )
      on conflict (id) do nothing
    `;
	for (const position of POSITIONS) await sql`
      insert into positions (id, code, name, group_code, description, active)
      values (${position.id}, ${position.code}, ${position.name}, ${position.group}, ${position.description}, true)
      on conflict (id) do nothing
    `;
	for (const template of TEMPLATES) {
		await sql`
      insert into assessment_templates (id, code, name, audience, description, active)
      values (${template.id}, ${template.code}, ${template.name}, ${template.audience}, ${template.description}, true)
      on conflict (id) do nothing
    `;
		const versionId = `ver_${template.code}_1`;
		await sql`
      insert into assessment_template_versions (id, template_id, version_no, label, status)
      values (${versionId}, ${template.id}, 1, ${"Versi awal 1"}, 'draf')
      on conflict (id) do nothing
    `;
		let categoryOrder = 1;
		for (const category of template.categories) {
			const categoryId = `${versionId}_${category.code}`;
			await sql`
        insert into assessment_categories (id, version_id, code, name, weight, sort_order, description)
        values (${categoryId}, ${versionId}, ${category.code}, ${category.name}, ${category.weight}, ${categoryOrder}, '')
        on conflict (id) do nothing
      `;
			categoryOrder += 1;
			let indicatorOrder = 1;
			for (const indicator of category.indicators) {
				const indicatorId = `${versionId}_${indicator.code}`;
				const [r1, r2, r3, r4, r5] = rubricFor(indicator.name);
				await sql`
          insert into assessment_indicators (
            id, category_id, code, name, description,
            rubric_1, rubric_2, rubric_3, rubric_4, rubric_5,
            weight, sort_order, unit_scope, responsibility_key, position_codes, active
          ) values (
            ${indicatorId}, ${categoryId}, ${indicator.code}, ${indicator.name}, ${indicator.name},
            ${r1}, ${r2}, ${r3}, ${r4}, ${r5},
            ${indicator.weight}, ${indicatorOrder},
            ${indicator.unitScope ?? "all"},
            ${indicator.responsibilityKey ?? ""},
            ${(indicator.positionCodes ?? []).join(",")},
            true
          )
          on conflict (id) do nothing
        `;
				indicatorOrder += 1;
			}
		}
	}
	for (const employee of DEMO_EMPLOYEES) {
		await sql`
      insert into employees (
        id, code, full_name, unit_id, position_id, group_code, employment_status, start_date,
        supervisor_id, assessor_id, verifier_id, active, is_demo, include_in_assessment, demo_role, notes
      ) values (
        ${employee.id}, ${employee.code}, ${employee.fullName}, ${employee.unitId}, ${employee.positionId},
        ${employee.group}, ${employee.status ?? "tetap"}, ${"2024-07-15"},
        ${employee.supervisorId ?? null}, ${employee.assessorId ?? null}, ${employee.verifierId ?? null},
        true, true, ${employee.include}, ${employee.demoRole},
        ${"DATA DEMO. Bukan nama pimpinan atau pegawai sesungguhnya. Lengkapi data kepegawaian nyata melalui menu pegawai."}
      )
      on conflict (id) do nothing
    `;
		await sql`
      insert into employee_assignments (id, employee_id, unit_id, position_id, start_date, note)
      values (${`hist_${employee.id}`}, ${employee.id}, ${employee.unitId}, ${employee.positionId}, ${"2024-07-15"}, ${"Penempatan awal data demo"})
      on conflict (id) do nothing
    `;
		for (const responsibility of employee.responsibilities ?? []) await sql`
        insert into employee_responsibilities (employee_id, responsibility_key, label)
        values (${employee.id}, ${responsibility.key}, ${responsibility.label})
        on conflict (employee_id, responsibility_key) do nothing
      `;
	}
	await sql`
    insert into assessment_periods (
      id, name, academic_year, semester, start_date, end_date,
      self_start, self_end, assessor_start, assessor_end, verify_start, verify_end, finalize_deadline,
      status, is_demo, bands, reopen_reason
    ) values (
      ${"periode-demo-2026-1"},
      ${"Semester 1 Tahun Ajaran 2026/2027"},
      ${"2026/2027"}, 1,
      ${"2026-07-13"}, ${"2026-12-19"},
      ${"2026-10-01"}, ${"2026-11-15"},
      ${"2026-10-15"}, ${"2026-11-30"},
      ${"2026-11-01"}, ${"2026-12-10"},
      ${"2026-12-15"},
      ${"berlangsung"}, true, ${JSON.stringify(DEFAULT_BANDS)}::jsonb,
      ${"Periode contoh untuk uji coba. Bukan kalender resmi yang sudah ditetapkan yayasan."}
    )
    on conflict (id) do nothing
  `;
	for (const audience of [
		"guru",
		"tendik",
		"pimpinan"
	]) {
		await sql`
      insert into period_templates (period_id, audience, version_id)
      values (${"periode-demo-2026-1"}, ${audience}, ${`ver_${audience}_1`})
      on conflict (period_id, audience) do nothing
    `;
		await sql`
      update assessment_template_versions set status = 'terkunci' where id = ${`ver_${audience}_1`}
    `;
	}
	const employees = await sql`
    select id, group_code, assessor_id, verifier_id
    from employees
    where active = true and include_in_assessment = true and is_demo = true
  `;
	for (const employee of employees) {
		let status = "menunggu_evaluasi_diri";
		let hold = "";
		if (!employee.assessor_id || !employee.verifier_id) {
			status = "tertahan";
			hold = "Penilai atau verifikator belum ditetapkan.";
		} else if (employee.assessor_id === employee.id || employee.verifier_id === employee.id || employee.assessor_id === employee.verifier_id) {
			status = "tertahan";
			hold = "Penilai dan verifikator harus orang yang berbeda, dan tidak boleh menilai diri sendiri.";
		}
		await sql`
      insert into assessment_assignments (
        id, period_id, employee_id, assessor_id, verifier_id, version_id, status, hold_reason
      ) values (
        ${`asg_periode-demo-2026-1_${employee.id}`}, ${"periode-demo-2026-1"}, ${employee.id}, ${employee.assessor_id}, ${employee.verifier_id},
        ${`ver_${employee.group_code}_1`}, ${status}, ${hold}
      )
      on conflict (id) do nothing
    `;
	}
	await sql`
    insert into app_settings (key, value)
    values ('institution', ${JSON.stringify(SETTINGS)}::jsonb)
    on conflict (key) do nothing
  `;
	await sql`
    insert into app_settings (key, value)
    values ('seed_version', ${JSON.stringify({ v: 1 })}::jsonb)
  `;
}
async function loadActor(userId) {
	const sql = await db();
	await ensureSeed();
	const authRows = await sql`
    select name, email from "user" where id = ${userId}
  `;
	const fullName = authRows[0]?.name?.trim() || "Pengguna";
	const email = authRows[0]?.email ?? "";
	await sql`
    insert into profiles (user_id, full_name, email, role)
    values (${userId}, ${fullName}, ${email}, 'pegawai')
    on conflict (user_id) do update set
      full_name = excluded.full_name,
      email = excluded.email,
      updated_at = now()
  `;
	await sql`
    update profiles
    set role = 'super_admin', updated_at = now()
    where user_id = ${userId}
      and role = 'pegawai'
      and not exists (
        select 1 from profiles other
        where other.role = 'super_admin' and other.user_id <> ${userId}
      )
  `;
	const profile = (await sql`select * from profiles where user_id = ${userId}`)[0];
	if (!profile || !isRole(profile.role)) fail("Profil pengguna tidak valid.");
	let employeeId = profile.employee_id;
	let unitId = profile.unit_id;
	let employeeName = null;
	let unitName = null;
	if (employeeId) {
		const rows = await sql`
      select e.full_name, e.unit_id, u.name as unit_name
      from employees e
      join organizational_units u on u.id = e.unit_id
      where e.id = ${employeeId}
    `;
		employeeName = rows[0]?.full_name ?? null;
		unitId = rows[0]?.unit_id ?? unitId;
		unitName = rows[0]?.unit_name ?? null;
	} else if (unitId) unitName = (await sql`select name from organizational_units where id = ${unitId}`)[0]?.name ?? null;
	let effectiveRole = profile.role;
	let simulating = false;
	let simulationName = null;
	const simulationEmployeeId = profile.simulation_employee_id;
	if (profile.role === "super_admin" && simulationEmployeeId) {
		const sim = (await sql`
      select e.id, e.full_name, e.unit_id, u.name as unit_name, e.demo_role, e.is_demo
      from employees e
      join organizational_units u on u.id = e.unit_id
      where e.id = ${simulationEmployeeId}
    `)[0];
		if (sim?.is_demo && sim.demo_role && isRole(sim.demo_role)) {
			simulating = true;
			effectiveRole = sim.demo_role;
			employeeId = sim.id;
			employeeName = sim.full_name;
			unitId = sim.unit_id;
			unitName = sim.unit_name;
			simulationName = sim.full_name;
		}
	}
	return {
		userId,
		fullName: profile.full_name || fullName,
		email: profile.email || email,
		profileRole: profile.role,
		effectiveRole,
		employeeId,
		employeeName,
		unitId,
		unitName,
		crossUnit: profile.cross_unit,
		simulating,
		simulationEmployeeId: simulating ? simulationEmployeeId : null,
		simulationName
	};
}
async function setSimulation(userId, employeeId) {
	if ((await loadActor(userId)).profileRole !== "super_admin") fail("Hanya Super Administrator yang dapat menjalankan simulasi peran.");
	const sql = await db();
	if (employeeId) {
		if (!(await sql`
      select id from employees where id = ${employeeId} and is_demo = true and active = true
    `).length) fail("Simulasi hanya tersedia untuk pegawai demo yang aktif.");
	}
	await sql`
    update profiles set simulation_employee_id = ${employeeId}, updated_at = now() where user_id = ${userId}
  `;
	await audit(userId, employeeId ? "simulasi_mulai" : "simulasi_selesai", "profiles", userId, "", { employeeId });
	return loadActor(userId);
}
async function audit(actorUserId, action, entityType, entityId, reason = "", after, before) {
	await (await db())`
    insert into audit_logs (id, actor_user_id, action, entity_type, entity_id, reason, before_json, after_json)
    values (
      ${nid("aud")}, ${actorUserId}, ${action}, ${entityType}, ${entityId}, ${reason},
      ${before ? JSON.stringify(before) : null}::jsonb,
      ${after ? JSON.stringify(after) : null}::jsonb
    )
  `;
}
async function assertMaster(userId) {
	const actor = await loadActor(userId);
	if (actor.profileRole !== "super_admin" || actor.simulating) fail("Tindakan ini hanya untuk Super Administrator di luar mode simulasi.");
	return actor;
}
async function getInstitution() {
	const sql = await db();
	await ensureSeed();
	return (await sql`select value from app_settings where key = 'institution'`)[0]?.value ?? null;
}
async function saveInstitution(userId, input) {
	await assertMaster(userId);
	if (!input.foundation_name.trim()) fail("Nama yayasan wajib diisi.");
	if (input.logo_data_url && !input.logo_data_url.startsWith("data:image/")) fail("Logo harus berupa berkas gambar.");
	if (input.logo_data_url.length > 18e4) fail("Logo terlalu besar. Gunakan gambar di bawah 120 KB.");
	const sql = await db();
	const next = {
		foundation_name: input.foundation_name.trim(),
		short_name: input.short_name.trim() || "YPIT",
		app_name: input.app_name.trim() || "Sistem Informasi Penilaian Kinerja Guru dan Pegawai",
		address: input.address.trim(),
		phone: input.phone.trim(),
		email: input.email.trim(),
		head_name: input.head_name.trim(),
		head_title: input.head_title.trim(),
		logo_data_url: input.logo_data_url
	};
	await sql`
    insert into app_settings (key, value, updated_at)
    values ('institution', ${JSON.stringify(next)}::jsonb, now())
    on conflict (key) do update set value = excluded.value, updated_at = now()
  `;
	await audit(userId, "ubah_pengaturan", "app_settings", "institution", "", {
		...next,
		logo_data_url: next.logo_data_url ? "[logo]" : ""
	});
	return next;
}
async function listUnits() {
	const sql = await db();
	await ensureSeed();
	return plain(await sql`
    select u.*, (select count(*) from employees e where e.unit_id = u.id and e.active = true) as active_employees
    from organizational_units u
    order by case u.kind when 'yayasan' then 0 else 1 end, u.name
  `).map((row) => ({
		...row,
		active_employees: num(row.active_employees)
	}));
}
async function saveUnit(userId, input) {
	await assertMaster(userId);
	if (!input.name.trim() || !input.code.trim()) fail("Kode dan nama unit wajib diisi.");
	const sql = await db();
	const id = input.id?.trim() || nid("unit");
	const existing = await sql`select id from organizational_units where id = ${id}`;
	if (existing.length) await sql`
      update organizational_units set
        code = ${input.code.trim()},
        name = ${input.name.trim()},
        parent_id = ${input.parentId},
        level_code = ${input.levelCode},
        address = ${input.address.trim()},
        phone = ${input.phone.trim()},
        email = ${input.email.trim()},
        head_title = ${input.headTitle.trim()},
        head_name = ${input.headName.trim()},
        updated_at = now()
      where id = ${id}
    `;
	else await sql`
      insert into organizational_units (
        id, code, name, kind, parent_id, level_code, address, phone, email, head_title, head_name, active
      ) values (
        ${id}, ${input.code.trim()}, ${input.name.trim()}, 'unit', ${input.parentId ?? "yayasan"},
        ${input.levelCode || "sd"}, ${input.address.trim()}, ${input.phone.trim()}, ${input.email.trim()},
        ${input.headTitle.trim()}, ${input.headName.trim()}, true
      )
    `;
	await audit(userId, existing.length ? "ubah_unit" : "tambah_unit", "organizational_units", id, "", input);
	return { id };
}
async function setUnitActive(userId, id, active) {
	await assertMaster(userId);
	if (id === "yayasan" && !active) fail("Unit induk yayasan tidak dapat dinonaktifkan.");
	await (await db())`update organizational_units set active = ${active}, updated_at = now() where id = ${id}`;
	await audit(userId, active ? "aktifkan_unit" : "nonaktifkan_unit", "organizational_units", id);
	return { ok: true };
}
async function listPositions() {
	const sql = await db();
	await ensureSeed();
	return plain(await sql`select * from positions order by group_code, name`);
}
async function savePosition(userId, input) {
	await assertMaster(userId);
	if (!input.name.trim() || !input.code.trim()) fail("Kode dan nama jabatan wajib diisi.");
	const sql = await db();
	const id = input.id?.trim() || nid("jab");
	const existing = await sql`select id from positions where id = ${id}`;
	if (existing.length) await sql`
      update positions set code = ${input.code.trim()}, name = ${input.name.trim()},
        group_code = ${input.groupCode}, description = ${input.description.trim()}, updated_at = now()
      where id = ${id}
    `;
	else await sql`
      insert into positions (id, code, name, group_code, description, active)
      values (${id}, ${input.code.trim()}, ${input.name.trim()}, ${input.groupCode}, ${input.description.trim()}, true)
    `;
	await audit(userId, existing.length ? "ubah_jabatan" : "tambah_jabatan", "positions", id, "", input);
	return { id };
}
async function setPositionActive(userId, id, active) {
	await assertMaster(userId);
	await (await db())`update positions set active = ${active}, updated_at = now() where id = ${id}`;
	await audit(userId, active ? "aktifkan_jabatan" : "nonaktifkan_jabatan", "positions", id);
	return { ok: true };
}
async function listEmployees(userId, filter) {
	const actor = await loadActor(userId);
	const sql = await db();
	const p = new Params();
	let where = "where 1=1";
	if (!(actor.effectiveRole === "super_admin" || actor.effectiveRole === "pengurus_yayasan" || actor.crossUnit) || actor.simulating) {
		if (actor.effectiveRole === "super_admin" && !actor.simulating) {} else if (actor.effectiveRole === "pengurus_yayasan") {} else if (actor.effectiveRole === "kepala_unit" && actor.unitId) where += ` and e.unit_id = ${p.add(actor.unitId)}`;
		else if (actor.effectiveRole === "penilai" && actor.employeeId) {
			const id = p.add(actor.employeeId);
			where += ` and (e.id = ${id} or e.assessor_id = ${id})`;
		} else if (actor.employeeId) where += ` and e.id = ${p.add(actor.employeeId)}`;
		else where += " and 1=0";
	}
	if (filter.unitId) where += ` and e.unit_id = ${p.add(filter.unitId)}`;
	if (filter.positionId) where += ` and e.position_id = ${p.add(filter.positionId)}`;
	if (filter.group) where += ` and e.group_code = ${p.add(filter.group)}`;
	if (filter.active === "aktif") where += " and e.active = true";
	if (filter.active === "nonaktif") where += " and e.active = false";
	if (filter.q?.trim()) {
		const q = p.add(`%${filter.q.trim().toLowerCase()}%`);
		where += ` and (lower(e.full_name) like ${q} or lower(e.code) like ${q})`;
	}
	const rows = await sql.query(`select e.*, u.name as unit_name, u.level_code, p.name as position_name,
            s.full_name as supervisor_name, a.full_name as assessor_name, v.full_name as verifier_name
     from employees e
     join organizational_units u on u.id = e.unit_id
     join positions p on p.id = e.position_id
     left join employees s on s.id = e.supervisor_id
     left join employees a on a.id = e.assessor_id
     left join employees v on v.id = e.verifier_id
     ${where}
     order by u.name, e.full_name`, p.values);
	const responsibilities = await sql`
    select employee_id, responsibility_key, label from employee_responsibilities
  `;
	const byEmp = /* @__PURE__ */ new Map();
	for (const row of responsibilities) {
		const list = byEmp.get(row.employee_id) ?? [];
		list.push({
			key: row.responsibility_key,
			label: row.label
		});
		byEmp.set(row.employee_id, list);
	}
	return plain(rows).map((row) => {
		const item = row;
		return {
			...item,
			responsibilities: byEmp.get(item.id) ?? []
		};
	});
}
function checkAssignmentTriangle(input) {
	if (input.assessorId && input.assessorId === input.id) fail("Pegawai tidak dapat menjadi penilai dirinya sendiri.");
	if (input.verifierId && input.verifierId === input.id) fail("Pegawai tidak dapat menjadi verifikator dirinya sendiri.");
	if (input.assessorId && input.verifierId && input.assessorId === input.verifierId) fail("Penilai dan verifikator harus orang yang berbeda.");
}
async function saveEmployee(userId, input) {
	await assertMaster(userId);
	if (!input.code.trim() || !input.fullName.trim()) fail("Kode dan nama pegawai wajib diisi.");
	if (!input.unitId || !input.positionId) fail("Unit dan jabatan wajib dipilih.");
	const sql = await db();
	const dup = await sql`select id from employees where lower(code) = ${input.code.trim().toLowerCase()}`;
	if (dup.length && dup[0].id !== input.id) fail("Kode pegawai sudah digunakan.");
	const id = input.id?.trim() || nid("peg");
	checkAssignmentTriangle({
		...input,
		id
	});
	const position = await sql`select group_code from positions where id = ${input.positionId}`;
	if (!position.length) fail("Jabatan tidak ditemukan.");
	const existing = await sql`
    select unit_id, position_id from employees where id = ${id}
  `;
	const groupCode = input.groupCode || position[0].group_code;
	if (existing.length) {
		await sql`
      update employees set
        code = ${input.code.trim()},
        full_name = ${input.fullName.trim()},
        unit_id = ${input.unitId},
        position_id = ${input.positionId},
        group_code = ${groupCode},
        employment_status = ${input.employmentStatus},
        start_date = ${input.startDate || null},
        supervisor_id = ${input.supervisorId},
        assessor_id = ${input.assessorId},
        verifier_id = ${input.verifierId},
        active = ${input.active},
        include_in_assessment = ${input.includeInAssessment},
        email = ${input.email.trim()},
        notes = ${input.notes.trim()},
        updated_at = now()
      where id = ${id}
    `;
		if (existing[0].unit_id !== input.unitId || existing[0].position_id !== input.positionId) {
			await sql`
        update employee_assignments set end_date = current_date
        where employee_id = ${id} and end_date is null
      `;
			await sql`
        insert into employee_assignments (id, employee_id, unit_id, position_id, start_date, note)
        values (${nid("hist")}, ${id}, ${input.unitId}, ${input.positionId}, current_date, ${"Perubahan unit atau jabatan"})
      `;
		}
	} else {
		await sql`
      insert into employees (
        id, code, full_name, unit_id, position_id, group_code, employment_status, start_date,
        supervisor_id, assessor_id, verifier_id, active, is_demo, include_in_assessment, email, notes
      ) values (
        ${id}, ${input.code.trim()}, ${input.fullName.trim()}, ${input.unitId}, ${input.positionId},
        ${groupCode}, ${input.employmentStatus}, ${input.startDate || null},
        ${input.supervisorId}, ${input.assessorId}, ${input.verifierId},
        ${input.active}, false, ${input.includeInAssessment}, ${input.email.trim()}, ${input.notes.trim()}
      )
    `;
		await sql`
      insert into employee_assignments (id, employee_id, unit_id, position_id, start_date, note)
      values (${nid("hist")}, ${id}, ${input.unitId}, ${input.positionId}, ${input.startDate || null}, ${"Penempatan awal"})
    `;
	}
	await sql`delete from employee_responsibilities where employee_id = ${id}`;
	for (const responsibility of input.responsibilities) {
		if (!responsibility.key.trim()) continue;
		await sql`
      insert into employee_responsibilities (employee_id, responsibility_key, label)
      values (${id}, ${responsibility.key.trim()}, ${responsibility.label.trim() || responsibility.key.trim()})
    `;
	}
	await audit(userId, existing.length ? "ubah_pegawai" : "tambah_pegawai", "employees", id, "", {
		code: input.code,
		name: input.fullName
	});
	return { id };
}
async function setEmployeeActive(userId, id, active) {
	await assertMaster(userId);
	await (await db())`update employees set active = ${active}, updated_at = now() where id = ${id}`;
	await audit(userId, active ? "aktifkan_pegawai" : "nonaktifkan_pegawai", "employees", id);
	return { ok: true };
}
async function importEmployees(userId, csv, commit) {
	await assertMaster(userId);
	const sql = await db();
	const lines = csv.replace(/^\uFEFF/, "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
	if (lines.length < 2) fail("Berkas kosong. Baris pertama harus berupa judul kolom.");
	const header = splitCsv(lines[0]).map((cell) => cell.trim().toLowerCase());
	for (const key of [
		"kode",
		"nama",
		"unit",
		"jabatan",
		"kelompok"
	]) if (!header.includes(key)) fail(`Kolom ${key} tidak ditemukan.`);
	const units = await sql`select id, code from organizational_units`;
	const positions = await sql`select id, code, group_code from positions`;
	const existing = await sql`select id, code from employees`;
	const unitBy = new Map(units.flatMap((unit) => [[unit.id.toLowerCase(), unit.id], [unit.code.toLowerCase(), unit.id]]));
	const positionBy = new Map(positions.flatMap((position) => [[position.id.toLowerCase(), position], [position.code.toLowerCase(), position]]));
	const codeSet = new Set(existing.map((row) => row.code.toLowerCase()));
	const seen = /* @__PURE__ */ new Set();
	const preview = [];
	const ready = [];
	for (let index = 1; index < lines.length; index += 1) {
		const cells = splitCsv(lines[index]);
		const get = (key) => cells[header.indexOf(key)]?.trim() ?? "";
		const code = get("kode");
		const name = get("nama");
		const problems = [];
		if (!code || !name) problems.push("Kode dan nama wajib diisi.");
		if (code && (codeSet.has(code.toLowerCase()) || seen.has(code.toLowerCase()))) problems.push("Kode duplikat.");
		const unitId = unitBy.get(get("unit").toLowerCase());
		const position = positionBy.get(get("jabatan").toLowerCase());
		if (!unitId) problems.push("Unit tidak dikenali.");
		if (!position) problems.push("Jabatan tidak dikenali.");
		const group = (get("kelompok") || position?.group_code || "").toLowerCase();
		if (![
			"guru",
			"tendik",
			"pimpinan"
		].includes(group)) problems.push("Kelompok harus guru, tendik, atau pimpinan.");
		const assessorCode = get("penilai").toLowerCase();
		const verifierCode = get("verifikator").toLowerCase();
		const supervisorCode = get("atasan").toLowerCase();
		const findEmp = (codeValue) => existing.find((row) => row.code.toLowerCase() === codeValue)?.id ?? null;
		if (problems.length) {
			preview.push({
				line: index + 1,
				ok: false,
				message: problems.join(" "),
				code,
				name
			});
			continue;
		}
		seen.add(code.toLowerCase());
		preview.push({
			line: index + 1,
			ok: true,
			message: "Siap diimpor",
			code,
			name
		});
		ready.push({
			code,
			fullName: name,
			unitId,
			positionId: position.id,
			groupCode: group,
			employmentStatus: get("status") || "tetap",
			startDate: get("mulai"),
			supervisorId: supervisorCode ? findEmp(supervisorCode) : null,
			assessorId: assessorCode ? findEmp(assessorCode) : null,
			verifierId: verifierCode ? findEmp(verifierCode) : null,
			active: true,
			includeInAssessment: true,
			email: get("email"),
			notes: "Diimpor dari berkas.",
			responsibilities: get("tanggung_jawab") ? get("tanggung_jawab").split("|").filter(Boolean).map((key) => ({
				key,
				label: key
			})) : []
		});
	}
	if (commit) {
		if (preview.some((row) => !row.ok)) fail("Impor dibatalkan karena masih ada baris yang tidak valid.");
		for (const row of ready) await saveEmployee(userId, row);
	}
	return {
		preview,
		imported: commit ? ready.length : 0
	};
}
function splitCsv(line) {
	const cells = [];
	let current = "";
	let quoted = false;
	for (let i = 0; i < line.length; i += 1) {
		const char = line[i];
		if (char === "\"") {
			if (quoted && line[i + 1] === "\"") {
				current += "\"";
				i += 1;
			} else quoted = !quoted;
		} else if (char === "," && !quoted) {
			cells.push(current);
			current = "";
		} else current += char;
	}
	cells.push(current);
	return cells;
}
async function listUsers(userId) {
	await assertMaster(userId);
	return plain(await (await db())`
    select p.user_id, p.full_name, p.email, p.role, p.unit_id, p.employee_id, p.cross_unit,
           e.full_name as employee_name, u.name as unit_name
    from profiles p
    left join employees e on e.id = p.employee_id
    left join organizational_units u on u.id = p.unit_id
    order by p.full_name
  `);
}
async function updateUserAccess(userId, input) {
	const actor = await assertMaster(userId);
	if (!isRole(input.role)) fail("Peran tidak dikenal.");
	const sql = await db();
	if (input.targetUserId === actor.userId && input.role !== "super_admin") {
		if (num((await sql`select count(*) from profiles where role = 'super_admin'`)[0]?.count) <= 1) fail("Tidak dapat menurunkan Super Administrator terakhir.");
	}
	if (input.role !== "super_admin") {
		const others = await sql`
      select count(*) from profiles where role = 'super_admin' and user_id <> ${input.targetUserId}
    `;
		if ((await sql`select role from profiles where user_id = ${input.targetUserId}`)[0]?.role === "super_admin" && num(others[0]?.count) === 0) fail("Tidak dapat menurunkan Super Administrator terakhir.");
	}
	await sql`update employees set user_id = null where user_id = ${input.targetUserId}`;
	if (input.employeeId) {
		await sql`update employees set user_id = null where id = ${input.employeeId}`;
		await sql`update employees set user_id = ${input.targetUserId} where id = ${input.employeeId}`;
	}
	await sql`
    update profiles set
      role = ${input.role},
      unit_id = ${input.unitId},
      employee_id = ${input.employeeId},
      cross_unit = ${input.crossUnit},
      updated_at = now()
    where user_id = ${input.targetUserId}
  `;
	await audit(userId, "ubah_akses", "profiles", input.targetUserId, "", input);
	return { ok: true };
}
async function listBands() {
	const sql = await db();
	await ensureSeed();
	return plain(await sql`
    select * from result_bands where active = true order by sort_order
  `).map((row) => ({
		id: row.id,
		min: num(row.min_score),
		max: num(row.max_score),
		minInclusive: Boolean(row.min_inclusive),
		maxInclusive: Boolean(row.max_inclusive),
		label: row.label
	}));
}
async function saveBands(userId, bands) {
	await assertMaster(userId);
	if (bands.length < 2) fail("Sekurang-kurangnya dua kategori hasil.");
	const sql = await db();
	if ((await sql`
    select id from assessment_periods where status <> 'persiapan' and status <> 'ditutup'
  `).length) fail("Batas kategori hasil dikunci selama ada periode yang sedang berjalan. Ubah sebelum periode dibuka.");
	await sql`update result_bands set active = false`;
	let order = 1;
	for (const band of bands) {
		if (!band.label.trim()) fail("Label kategori hasil wajib diisi.");
		await sql`
      insert into result_bands (id, min_score, max_score, min_inclusive, max_inclusive, label, sort_order, active)
      values (${nid("band")}, ${band.min}, ${band.max}, ${band.minInclusive}, ${band.maxInclusive}, ${band.label.trim()}, ${order}, true)
    `;
		order += 1;
	}
	await audit(userId, "ubah_batas_nilai", "result_bands", "global", "", bands);
	return listBands();
}
function currentBandsFromRows(rows) {
	if (!rows.length) return DEFAULT_BANDS;
	return rows.map((row) => ({
		min: num(row.min_score),
		max: num(row.max_score),
		minInclusive: row.min_inclusive,
		maxInclusive: row.max_inclusive,
		label: row.label
	}));
}
async function listInstruments() {
	const sql = await db();
	await ensureSeed();
	return plain({
		templates: await sql`select * from assessment_templates order by name`,
		versions: await sql`select * from assessment_template_versions order by version_no desc`,
		categories: await sql`select * from assessment_categories order by sort_order`,
		indicators: await sql`select * from assessment_indicators order by sort_order`
	});
}
async function versionEditable(versionId) {
	const sql = await db();
	const versions = await sql`select status from assessment_template_versions where id = ${versionId}`;
	if (!versions.length) fail("Versi instrumen tidak ditemukan.");
	if (versions[0].status !== "draf") fail("Versi instrumen terkunci karena sudah dipakai periode yang berjalan.");
	if ((await sql`
    select p.id from period_templates pt
    join assessment_periods p on p.id = pt.period_id
    where pt.version_id = ${versionId} and p.status <> 'persiapan'
  `).length) fail("Versi ini sudah dirujuk periode yang tidak lagi dalam persiapan.");
}
async function saveCategoryWeight(userId, categoryId, weight, name) {
	await assertMaster(userId);
	const sql = await db();
	const rows = await sql`select version_id from assessment_categories where id = ${categoryId}`;
	if (!rows.length) fail("Kategori tidak ditemukan.");
	await versionEditable(rows[0].version_id);
	await sql`update assessment_categories set weight = ${weight}, name = ${name.trim()} where id = ${categoryId}`;
	const check = weightsLookValid((await sql`select weight from assessment_categories where version_id = ${rows[0].version_id}`).map((row) => num(row.weight)));
	await audit(userId, "ubah_bobot_kategori", "assessment_categories", categoryId, "", {
		weight,
		total: check.total
	});
	return {
		total: check.total,
		ok: check.ok
	};
}
async function saveIndicator(userId, input) {
	await assertMaster(userId);
	const sql = await db();
	const categories = await sql`select version_id from assessment_categories where id = ${input.categoryId}`;
	if (!categories.length) fail("Kategori tidak ditemukan.");
	await versionEditable(categories[0].version_id);
	if (!input.name.trim() || input.weight <= 0) fail("Nama dan bobot indikator wajib valid.");
	const id = input.id || nid("ind");
	if ((await sql`select id from assessment_indicators where id = ${id}`).length) await sql`
      update assessment_indicators set
        name = ${input.name.trim()}, description = ${input.name.trim()}, weight = ${input.weight},
        unit_scope = ${input.unitScope || "all"}, responsibility_key = ${input.responsibilityKey.trim()},
        position_codes = ${input.positionCodes.trim()},
        rubric_1 = ${input.rubric[0]}, rubric_2 = ${input.rubric[1]}, rubric_3 = ${input.rubric[2]},
        rubric_4 = ${input.rubric[3]}, rubric_5 = ${input.rubric[4]}
      where id = ${id}
    `;
	else {
		const orderRows = await sql`
      select coalesce(max(sort_order), 0) as sort_order from assessment_indicators where category_id = ${input.categoryId}
    `;
		await sql`
      insert into assessment_indicators (
        id, category_id, code, name, description, rubric_1, rubric_2, rubric_3, rubric_4, rubric_5,
        weight, sort_order, unit_scope, responsibility_key, position_codes, active
      ) values (
        ${id}, ${input.categoryId}, ${id}, ${input.name.trim()}, ${input.name.trim()},
        ${input.rubric[0]}, ${input.rubric[1]}, ${input.rubric[2]}, ${input.rubric[3]}, ${input.rubric[4]},
        ${input.weight}, ${num(orderRows[0]?.sort_order) + 1}, ${input.unitScope || "all"},
        ${input.responsibilityKey.trim()}, ${input.positionCodes.trim()}, true
      )
    `;
	}
	await audit(userId, "ubah_indikator", "assessment_indicators", id, "", {
		name: input.name,
		weight: input.weight
	});
	return { id };
}
async function cloneVersion(userId, versionId) {
	await assertMaster(userId);
	const sql = await db();
	const versions = await sql`
    select template_id, version_no, label from assessment_template_versions where id = ${versionId}
  `;
	if (!versions.length) fail("Versi tidak ditemukan.");
	const nextNo = num(versions[0].version_no) + 1;
	const nextId = nid("ver");
	await sql`
    insert into assessment_template_versions (id, template_id, version_no, label, status)
    values (${nextId}, ${versions[0].template_id}, ${nextNo}, ${`Versi ${nextNo}`}, 'draf')
  `;
	const categories = await sql`
    select * from assessment_categories where version_id = ${versionId} order by sort_order
  `;
	for (const category of categories) {
		const categoryId = nid("kat");
		await sql`
      insert into assessment_categories (id, version_id, code, name, weight, sort_order, description)
      values (${categoryId}, ${nextId}, ${category.code}, ${category.name}, ${num(category.weight)}, ${category.sort_order}, ${category.description})
    `;
		const indicators = await sql`
      select * from assessment_indicators where category_id = ${category.id} order by sort_order
    `;
		for (const indicator of indicators) await sql`
        insert into assessment_indicators (
          id, category_id, code, name, description, rubric_1, rubric_2, rubric_3, rubric_4, rubric_5,
          weight, sort_order, unit_scope, responsibility_key, position_codes, active
        ) values (
          ${nid("ind")}, ${categoryId}, ${asText(indicator.code)}, ${asText(indicator.name)}, ${asText(indicator.description)},
          ${asText(indicator.rubric_1)}, ${asText(indicator.rubric_2)}, ${asText(indicator.rubric_3)},
          ${asText(indicator.rubric_4)}, ${asText(indicator.rubric_5)},
          ${num(indicator.weight)}, ${num(indicator.sort_order)}, ${asText(indicator.unit_scope)},
          ${asText(indicator.responsibility_key)}, ${asText(indicator.position_codes)}, true
        )
      `;
	}
	await audit(userId, "salin_versi_instrumen", "assessment_template_versions", nextId, "", { from: versionId });
	return { id: nextId };
}
async function listPeriods() {
	const sql = await db();
	await ensureSeed();
	return plain({
		periods: await sql`select * from assessment_periods order by start_date desc`,
		links: await sql`select * from period_templates`
	});
}
async function savePeriod(userId, input) {
	await assertMaster(userId);
	if (!input.name.trim() || !input.academicYear.trim()) fail("Nama periode dan tahun ajaran wajib diisi.");
	const sql = await db();
	const id = input.id || nid("periode");
	const existing = await sql`select status from assessment_periods where id = ${id}`;
	if (existing.length && existing[0].status !== "persiapan") await sql`
      update assessment_periods set
        name = ${input.name.trim()},
        academic_year = ${input.academicYear.trim()},
        self_start = ${input.selfStart}, self_end = ${input.selfEnd},
        assessor_start = ${input.assessorStart}, assessor_end = ${input.assessorEnd},
        verify_start = ${input.verifyStart}, verify_end = ${input.verifyEnd},
        finalize_deadline = ${input.finalizeDeadline},
        updated_at = now()
      where id = ${id}
    `;
	else if (existing.length) {
		await sql`
      update assessment_periods set
        name = ${input.name.trim()}, academic_year = ${input.academicYear.trim()}, semester = ${input.semester},
        start_date = ${input.startDate}, end_date = ${input.endDate},
        self_start = ${input.selfStart}, self_end = ${input.selfEnd},
        assessor_start = ${input.assessorStart}, assessor_end = ${input.assessorEnd},
        verify_start = ${input.verifyStart}, verify_end = ${input.verifyEnd},
        finalize_deadline = ${input.finalizeDeadline}, updated_at = now()
      where id = ${id}
    `;
		for (const audience of [
			"guru",
			"tendik",
			"pimpinan"
		]) await sql`
        insert into period_templates (period_id, audience, version_id)
        values (${id}, ${audience}, ${input.versions[audience]})
        on conflict (period_id, audience) do update set version_id = excluded.version_id
      `;
	} else {
		await sql`
      insert into assessment_periods (
        id, name, academic_year, semester, start_date, end_date,
        self_start, self_end, assessor_start, assessor_end, verify_start, verify_end, finalize_deadline,
        status, is_demo, bands, created_by
      ) values (
        ${id}, ${input.name.trim()}, ${input.academicYear.trim()}, ${input.semester},
        ${input.startDate}, ${input.endDate}, ${input.selfStart}, ${input.selfEnd},
        ${input.assessorStart}, ${input.assessorEnd}, ${input.verifyStart}, ${input.verifyEnd},
        ${input.finalizeDeadline}, 'persiapan', false, ${JSON.stringify([])}::jsonb, ${userId}
      )
    `;
		for (const audience of [
			"guru",
			"tendik",
			"pimpinan"
		]) await sql`
        insert into period_templates (period_id, audience, version_id)
        values (${id}, ${audience}, ${input.versions[audience]})
      `;
	}
	await audit(userId, "simpan_periode", "assessment_periods", id, "", { name: input.name });
	return { id };
}
async function setPeriodStatus(userId, periodId, status, reason) {
	await assertMaster(userId);
	if (![
		"persiapan",
		"dibuka",
		"berlangsung",
		"menunggu_finalisasi",
		"ditutup"
	].includes(status)) fail("Status periode tidak dikenal.");
	const sql = await db();
	const rows = await sql`select status from assessment_periods where id = ${periodId}`;
	if (!rows.length) fail("Periode tidak ditemukan.");
	const from = rows[0].status;
	if (status === "ditutup" && !reason.trim()) fail("Penutupan periode memerlukan alasan.");
	if (from === "ditutup" && status !== "ditutup" && !reason.trim()) fail("Pembukaan kembali periode memerlukan alasan yang tercatat.");
	if ((status === "dibuka" || status === "berlangsung") && (from === "persiapan" || from === "dibuka")) {
		const bands = currentBandsFromRows(await sql`select * from result_bands where active = true order by sort_order`);
		await sql`update assessment_periods set bands = ${JSON.stringify(bands)}::jsonb where id = ${periodId}`;
		const links = await sql`select version_id from period_templates where period_id = ${periodId}`;
		for (const link of links) {
			const check = weightsLookValid((await sql`
        select weight from assessment_categories where version_id = ${link.version_id}
      `).map((row) => num(row.weight)));
			if (!check.ok) fail(`Bobot kategori pada versi instrumen belum 100% (saat ini ${check.total}%).`);
			await sql`update assessment_template_versions set status = 'terkunci' where id = ${link.version_id}`;
		}
		await generateAssignments(periodId);
	}
	await sql`
    update assessment_periods set status = ${status}, reopen_reason = ${from === "ditutup" ? reason.trim() : ""}, updated_at = now()
    where id = ${periodId}
  `;
	if (from === "ditutup" && status !== "ditutup") await sql`update assessment_periods set reopen_reason = ${reason.trim()} where id = ${periodId}`;
	await audit(userId, "ubah_status_periode", "assessment_periods", periodId, reason, {
		from,
		to: status
	});
	return { ok: true };
}
async function generateAssignments(periodId) {
	const sql = await db();
	const links = await sql`
    select audience, version_id from period_templates where period_id = ${periodId}
  `;
	const versionBy = new Map(links.map((link) => [link.audience, link.version_id]));
	const employees = await sql`
    select id, group_code, assessor_id, verifier_id, user_id, full_name
    from employees where active = true and include_in_assessment = true
  `;
	const period = await sql`select name from assessment_periods where id = ${periodId}`;
	for (const employee of employees) {
		const versionId = versionBy.get(employee.group_code);
		if (!versionId) continue;
		const exists = await sql`
      select id, status from assessment_assignments where period_id = ${periodId} and employee_id = ${employee.id}
    `;
		let status = "menunggu_evaluasi_diri";
		let hold = "";
		if (!employee.assessor_id || !employee.verifier_id) {
			status = "tertahan";
			hold = "Penilai atau verifikator belum ditetapkan.";
		} else if (employee.assessor_id === employee.id || employee.verifier_id === employee.id || employee.assessor_id === employee.verifier_id) {
			status = "tertahan";
			hold = "Penilai dan verifikator harus berbeda dan tidak boleh menilai diri sendiri.";
		}
		if (exists.length) {
			if (exists[0].status === "tertahan") await sql`
          update assessment_assignments set
            assessor_id = ${employee.assessor_id}, verifier_id = ${employee.verifier_id},
            version_id = ${versionId}, status = ${status}, hold_reason = ${hold}, updated_at = now()
          where id = ${exists[0].id}
        `;
			continue;
		}
		await sql`
      insert into assessment_assignments (
        id, period_id, employee_id, assessor_id, verifier_id, version_id, status, hold_reason
      ) values (
        ${nid("asg")}, ${periodId}, ${employee.id}, ${employee.assessor_id}, ${employee.verifier_id},
        ${versionId}, ${status}, ${hold}
      )
    `;
		await sql`
      insert into notifications (id, user_id, employee_id, title, body, href, kind, dedupe_key)
      values (
        ${nid("ntf")}, ${employee.user_id}, ${employee.id},
        ${"Periode penilaian dibuka"},
        ${`${period[0]?.name ?? "Periode"} sudah dibuka. Silakan lengkapi evaluasi diri.`},
        ${"/evaluasi"}, ${"periode"}, ${`period-open:${periodId}:${employee.id}`}
      )
      on conflict (dedupe_key) do nothing
    `;
	}
}
async function orgTree() {
	const sql = await db();
	await ensureSeed();
	return {
		units: plain(await sql`select * from organizational_units order by name`),
		positions: plain(await sql`select id, name, group_code, active from positions order by name`),
		counts: plain(await sql`
      select unit_id, group_code, count(*) as total
      from employees where active = true
      group by unit_id, group_code
    `).map((row) => ({
			...row,
			total: num(row.total)
		}))
	};
}
//#endregion
export { AppError, db as a, audit, num as c, cloneVersion, currentBandsFromRows, generateAssignments, getInstitution, asText as i, importEmployees, plain as l, listBands, listEmployees, listInstruments, listPeriods, listPositions, listUnits, listUsers, loadActor, workedExamples as n, fail as o, orgTree, Params as r, nid as s, saveBands, saveCategoryWeight, saveEmployee, saveIndicator, saveInstitution, savePeriod, savePosition, saveUnit, setEmployeeActive, setPeriodStatus, setPositionActive, setSimulation, setUnitActive, computeScore as t, updateUserAccess };
