//#region node_modules/.nitro/vite/services/ssr/assets/labels-b_RKwhV6.js
var ROLES = [
	"super_admin",
	"pengurus_yayasan",
	"kepala_unit",
	"penilai",
	"pegawai"
];
var ROLE_LABEL = {
	super_admin: "Super Administrator",
	pengurus_yayasan: "Pengurus Yayasan",
	kepala_unit: "Kepala Unit",
	penilai: "Atasan Langsung / Penilai",
	pegawai: "Guru / Pegawai"
};
var PERIOD_STATUS_LABEL = {
	persiapan: "Persiapan",
	dibuka: "Dibuka",
	berlangsung: "Berlangsung",
	menunggu_finalisasi: "Menunggu Finalisasi",
	ditutup: "Ditutup"
};
var ASSIGNMENT_STATUS_LABEL = {
	tertahan: "Tertahan",
	menunggu_evaluasi_diri: "Menunggu Evaluasi Diri",
	evaluasi_diri_draf: "Draf Evaluasi Diri",
	menunggu_penilaian: "Menunggu Penilaian Atasan",
	penilaian_draf: "Draf Penilaian Atasan",
	menunggu_verifikasi: "Menunggu Verifikasi",
	dikembalikan: "Dikembalikan",
	terverifikasi: "Terverifikasi",
	final: "Final",
	dipublikasikan: "Dipublikasikan"
};
var GROUP_LABEL = {
	guru: "Guru",
	tendik: "Tenaga Kependidikan",
	pimpinan: "Pimpinan"
};
var PLAN_STATUS_LABEL = {
	belum_dimulai: "Belum Dimulai",
	sedang_berjalan: "Sedang Berjalan",
	selesai: "Selesai",
	perlu_evaluasi_ulang: "Perlu Evaluasi Ulang"
};
var UNIT_LEVEL_LABEL = {
	yayasan: "Yayasan",
	kbtk: "KB-TK",
	sd: "SD",
	smptq: "SMPTQ"
};
function isRole(value) {
	return ROLES.includes(value);
}
//#endregion
export { ROLE_LABEL as a, PLAN_STATUS_LABEL as i, GROUP_LABEL as n, UNIT_LEVEL_LABEL as o, PERIOD_STATUS_LABEL as r, isRole as s, ASSIGNMENT_STATUS_LABEL as t };
