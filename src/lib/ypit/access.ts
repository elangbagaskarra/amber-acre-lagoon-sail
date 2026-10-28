import type { Role } from "./labels";

export type Actor = {
  userId: string;
  fullName: string;
  email: string;
  profileRole: Role;
  effectiveRole: Role;
  employeeId: string | null;
  employeeName: string | null;
  unitId: string | null;
  unitName: string | null;
  crossUnit: boolean;
  simulating: boolean;
  simulationEmployeeId: string | null;
  simulationName: string | null;
};

export type NavKey =
  | "dashboard"
  | "pegawai"
  | "organisasi"
  | "unit"
  | "jabatan"
  | "periode"
  | "instrumen"
  | "evaluasi"
  | "penilaian"
  | "verifikasi"
  | "hasil"
  | "pengembangan"
  | "laporan"
  | "notifikasi"
  | "audit"
  | "pengaturan"
  | "panduan";

const ALL: NavKey[] = [
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
  "panduan",
];

export function navFor(role: Role): NavKey[] {
  if (role === "super_admin") return ALL;
  if (role === "pengurus_yayasan") {
    return [
      "dashboard",
      "pegawai",
      "verifikasi",
      "hasil",
      "pengembangan",
      "laporan",
      "notifikasi",
      "panduan",
    ];
  }
  if (role === "kepala_unit") {
    return [
      "dashboard",
      "pegawai",
      "evaluasi",
      "verifikasi",
      "hasil",
      "pengembangan",
      "laporan",
      "notifikasi",
      "panduan",
    ];
  }
  if (role === "penilai") {
    return ["dashboard", "evaluasi", "penilaian", "hasil", "pengembangan", "notifikasi", "panduan"];
  }
  return ["dashboard", "evaluasi", "hasil", "pengembangan", "notifikasi", "panduan"];
}

export function seesAllUnits(actor: Actor): boolean {
  return actor.effectiveRole === "super_admin" || actor.effectiveRole === "pengurus_yayasan" || actor.crossUnit;
}

export function canManageMaster(actor: Actor): boolean {
  return actor.profileRole === "super_admin" && !actor.simulating;
}

export function canSimulate(actor: Actor): boolean {
  return actor.profileRole === "super_admin";
}

export function canVerifyAssignment(
  actor: Actor,
  input: { verifierId: string | null; employeeId: string; unitId: string },
): boolean {
  if (canManageMaster(actor)) return true;
  if (actor.employeeId && actor.employeeId === input.verifierId) return true;
  if (actor.effectiveRole === "pengurus_yayasan") return true;
  if (
    actor.effectiveRole === "kepala_unit" &&
    actor.unitId === input.unitId &&
    actor.employeeId !== input.employeeId
  ) {
    return true;
  }
  return false;
}

export function canAssess(actor: Actor, assessorId: string | null): boolean {
  if (canManageMaster(actor)) return true;
  return !!actor.employeeId && actor.employeeId === assessorId;
}

export function canFillSelf(actor: Actor, employeeId: string): boolean {
  if (canManageMaster(actor)) return true;
  return actor.employeeId === employeeId;
}

export function canSeeEmployee(actor: Actor, employee: { id: string; unitId: string; assessorId: string | null }): boolean {
  if (seesAllUnits(actor) || canManageMaster(actor)) return true;
  if (actor.employeeId && actor.employeeId === employee.id) return true;
  if (actor.effectiveRole === "penilai" && actor.employeeId === employee.assessorId) return true;
  if (actor.effectiveRole === "kepala_unit" && actor.unitId && actor.unitId === employee.unitId) return true;
  if (actor.crossUnit) return true;
  return false;
}
