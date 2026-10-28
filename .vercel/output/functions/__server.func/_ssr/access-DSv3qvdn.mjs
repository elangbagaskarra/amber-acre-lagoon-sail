//#region node_modules/.nitro/vite/services/ssr/assets/access-DSv3qvdn.js
var ALL = [
	"dashboard",
	"pegawai",
	"organisasi",
	"unit",
	"jabatan",
	"periode",
	"instrumen",
	"evaluasi",
	"penilaian",
	"verifikasi",
	"hasil",
	"pengembangan",
	"laporan",
	"notifikasi",
	"audit",
	"pengaturan",
	"panduan"
];
function navFor(role) {
	if (role === "super_admin") return ALL;
	if (role === "pengurus_yayasan") return [
		"dashboard",
		"pegawai",
		"verifikasi",
		"hasil",
		"pengembangan",
		"laporan",
		"notifikasi",
		"panduan"
	];
	if (role === "kepala_unit") return [
		"dashboard",
		"pegawai",
		"evaluasi",
		"verifikasi",
		"hasil",
		"pengembangan",
		"laporan",
		"notifikasi",
		"panduan"
	];
	if (role === "penilai") return [
		"dashboard",
		"evaluasi",
		"penilaian",
		"hasil",
		"pengembangan",
		"notifikasi",
		"panduan"
	];
	return [
		"dashboard",
		"evaluasi",
		"hasil",
		"pengembangan",
		"notifikasi",
		"panduan"
	];
}
function seesAllUnits(actor) {
	return actor.effectiveRole === "super_admin" || actor.effectiveRole === "pengurus_yayasan" || actor.crossUnit;
}
function canManageMaster(actor) {
	return actor.profileRole === "super_admin" && !actor.simulating;
}
function canVerifyAssignment(actor, input) {
	if (canManageMaster(actor)) return true;
	if (actor.employeeId && actor.employeeId === input.verifierId) return true;
	if (actor.effectiveRole === "pengurus_yayasan") return true;
	if (actor.effectiveRole === "kepala_unit" && actor.unitId === input.unitId && actor.employeeId !== input.employeeId) return true;
	return false;
}
function canAssess(actor, assessorId) {
	if (canManageMaster(actor)) return true;
	return !!actor.employeeId && actor.employeeId === assessorId;
}
function canFillSelf(actor, employeeId) {
	if (canManageMaster(actor)) return true;
	return actor.employeeId === employeeId;
}
//#endregion
export { navFor as a, canVerifyAssignment as i, canFillSelf as n, seesAllUnits as o, canManageMaster as r, canAssess as t };
