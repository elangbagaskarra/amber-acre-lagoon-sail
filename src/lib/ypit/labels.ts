export const ROLES = [
  "super_admin",
  "pengurus_yayasan",
  "kepala_unit",
  "penilai",
  "pegawai",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABEL: Record<Role, string> = {
  super_admin: "Super Administrator",
  pengurus_yayasan: "Pengurus Yayasan",
  kepala_unit: "Kepala Unit",
  penilai: "Atasan Langsung / Penilai",
  pegawai: "Guru / Pegawai",
};

export const PERIOD_STATUS_LABEL: Record<string, string> = {
  persiapan: "Persiapan",
  dibuka: "Dibuka",
  berlangsung: "Berlangsung",
  menunggu_finalisasi: "Menunggu Finalisasi",
  ditutup: "Ditutup",
};

export const ASSIGNMENT_STATUS_LABEL: Record<string, string> = {
  tertahan: "Tertahan",
  menunggu_evaluasi_diri: "Menunggu Evaluasi Diri",
  evaluasi_diri_draf: "Draf Evaluasi Diri",
  menunggu_penilaian: "Menunggu Penilaian Atasan",
  penilaian_draf: "Draf Penilaian Atasan",
  menunggu_verifikasi: "Menunggu Verifikasi",
  dikembalikan: "Dikembalikan",
  terverifikasi: "Terverifikasi",
  final: "Final",
  dipublikasikan: "Dipublikasikan",
};

export const GROUP_LABEL: Record<string, string> = {
  guru: "Guru",
  tendik: "Tenaga Kependidikan",
  pimpinan: "Pimpinan",
};

export const EMPLOYMENT_LABEL: Record<string, string> = {
  tetap: "Tetap",
  kontrak: "Kontrak",
  honorer: "Honorer",
  tugas_tambahan: "Tugas Tambahan",
};

export const PLAN_STATUS_LABEL: Record<string, string> = {
  belum_dimulai: "Belum Dimulai",
  sedang_berjalan: "Sedang Berjalan",
  selesai: "Selesai",
  perlu_evaluasi_ulang: "Perlu Evaluasi Ulang",
};

export const UNIT_LEVEL_LABEL: Record<string, string> = {
  yayasan: "Yayasan",
  kbtk: "KB-TK",
  sd: "SD",
  smptq: "SMPTQ",
};

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}
