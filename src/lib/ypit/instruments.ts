/** Definisi awal instrumen. Admin dapat mengubahnya sebelum periode dibuka. */

export type IndicatorSeed = {
  code: string;
  name: string;
  weight: number;
  unitScope?: string;
  responsibilityKey?: string;
  positionCodes?: string[];
};

export type CategorySeed = {
  code: string;
  name: string;
  weight: number;
  indicators: IndicatorSeed[];
};

export type TemplateSeed = {
  id: string;
  code: string;
  name: string;
  audience: "guru" | "tendik" | "pimpinan";
  description: string;
  categories: CategorySeed[];
};

function ind(code: string, name: string, weight: number, extra?: Partial<IndicatorSeed>): IndicatorSeed {
  return { code, name, weight, ...extra };
}

export const TEMPLATES: TemplateSeed[] = [
  {
    id: "tpl_guru",
    code: "guru",
    name: "Instrumen Guru",
    audience: "guru",
    description:
      "Instrumen awal guru. Indikator umum berlaku di semua unit. Indikator khusus unit atau tanggung jawab hanya dinilai jika relevan.",
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
            responsibilityKey: "tahfiz",
          }),
        ],
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
            responsibilityKey: "tahfiz",
          }),
        ],
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
            responsibilityKey: "tahfiz",
          }),
        ],
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
          ind("lindung-sd-diff", "Pembelajaran yang memperhatikan perbedaan kebutuhan peserta didik.", 20, { unitScope: "sd" }),
        ],
      },
      {
        code: "kompetensi",
        name: "Pengembangan kompetensi profesional",
        weight: 10,
        indicators: [
          ind("komp-refleksi", "Melakukan refleksi praktik mengajar.", 25),
          ind("komp-kegiatan", "Mengikuti kegiatan pengembangan profesional yang relevan.", 25),
          ind("komp-terap", "Menerapkan hasil pelatihan dalam pembelajaran.", 25),
          ind("komp-jabatan", "Mengembangkan kemampuan sesuai kebutuhan jabatan.", 25),
        ],
      },
      {
        code: "disiplin",
        name: "Kedisiplinan dan tanggung jawab",
        weight: 10,
        indicators: [
          ind("disiplin-jadwal", "Memenuhi jadwal mengajar.", 25),
          ind("disiplin-admin", "Menyelesaikan tugas administratif yang relevan.", 25),
          ind("disiplin-tambahan", "Menjalankan tugas tambahan sesuai penugasan.", 25),
          ind("disiplin-aturan", "Mematuhi peraturan dan prosedur lembaga.", 25),
        ],
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
          ind("akhlak-smp", "Keteladanan dan penguatan nilai Islami bagi peserta didik remaja.", 20, { unitScope: "smptq" }),
        ],
      },
      {
        code: "kolaborasi",
        name: "Kolaborasi dan kontribusi lembaga",
        weight: 5,
        indicators: [
          ind("kolab-rekan", "Bekerja sama dengan rekan kerja.", 25),
          ind("kolab-ortu", "Berkomunikasi secara profesional dengan orang tua.", 25),
          ind("kolab-kegiatan", "Berpartisipasi dalam kegiatan lembaga sesuai penugasan.", 25),
          ind("kolab-mutu", "Berkontribusi terhadap perbaikan mutu pendidikan.", 25),
        ],
      },
    ],
  },
  {
    id: "tpl_tendik",
    code: "tendik",
    name: "Instrumen Tenaga Kependidikan",
    audience: "tendik",
    description:
      "Instrumen awal tenaga kependidikan. Indikator khusus jabatan hanya berlaku bagi jabatan tersebut dan bobotnya dinormalisasi.",
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
          ind("t-layan", "Ketepatan layanan loket kepada warga sekolah.", 30, { positionCodes: ["layanan"] }),
        ],
      },
      {
        code: "produktivitas",
        name: "Produktivitas dan pencapaian target",
        weight: 20,
        indicators: [
          ind("t-target", "Pencapaian target sesuai jabatan.", 50),
          ind("t-volume", "Penyelesaian beban kerja pada waktunya.", 50),
        ],
      },
      {
        code: "disiplin",
        name: "Kedisiplinan dan kepatuhan prosedur",
        weight: 15,
        indicators: [
          ind("t-prosedur", "Kepatuhan terhadap prosedur kerja.", 50),
          ind("t-hadir", "Kedisiplinan dan tanggung jawab kehadiran.", 50),
        ],
      },
      {
        code: "pelayanan",
        name: "Pelayanan dan komunikasi",
        weight: 15,
        indicators: [
          ind("t-warga", "Kualitas pelayanan kepada warga sekolah.", 50),
          ind("t-komunikasi", "Komunikasi yang sopan, jelas, dan tepat.", 50),
        ],
      },
      {
        code: "kompetensi",
        name: "Kompetensi dan pemecahan masalah",
        weight: 10,
        indicators: [
          ind("t-skill", "Penguasaan keterampilan kerja.", 50),
          ind("t-masalah", "Kemampuan menyelesaikan masalah.", 50),
        ],
      },
      {
        code: "integritas",
        name: "Integritas, amanah, dan etika kerja Islami",
        weight: 10,
        indicators: [
          ind("t-amanah", "Kejujuran, amanah, dan etika kerja.", 50),
          ind("t-islami", "Etika kerja Islami dalam pelayanan.", 50),
        ],
      },
      {
        code: "kerjasama",
        name: "Kerja sama dan kontribusi lembaga",
        weight: 5,
        indicators: [
          ind("t-tim", "Kerja sama dengan rekan kerja.", 50),
          ind("t-kontribusi", "Kontribusi terhadap unit.", 50),
        ],
      },
    ],
  },
  {
    id: "tpl_pimpinan",
    code: "pimpinan",
    name: "Instrumen Pimpinan Unit",
    audience: "pimpinan",
    description:
      "Instrumen awal kepala unit. Indikator kelas tidak diterapkan agar pimpinan dinilai menurut tanggung jawab pengelolaan, bukan target tahfiz atau administrasi yang bukan tugasnya.",
    categories: [
      {
        code: "kepemimpinan",
        name: "Kepemimpinan dan pengelolaan unit",
        weight: 25,
        indicators: [
          ind("p-arah", "Menetapkan arah kerja unit yang jelas.", 25),
          ind("p-keputusan", "Mengambil keputusan yang adil dan dapat dipertanggungjawabkan.", 25),
          ind("p-iklim", "Menjaga iklim kerja yang aman dan tertib.", 25),
          ind("p-teladan", "Memberi teladan kedisiplinan kepada guru dan pegawai.", 25),
        ],
      },
      {
        code: "mutu",
        name: "Mutu pembelajaran dan layanan",
        weight: 20,
        indicators: [
          ind("p-mutu", "Memantau mutu pembelajaran atau layanan unit.", 50),
          ind("p-tindak", "Menindaklanjuti temuan mutu secara terukur.", 50),
        ],
      },
      {
        code: "pembinaan",
        name: "Pembinaan guru dan pegawai",
        weight: 15,
        indicators: [
          ind("p-bina", "Membina guru dan pegawai berdasarkan kebutuhan.", 50),
          ind("p-adil", "Menegakkan aturan secara adil.", 50),
        ],
      },
      {
        code: "disiplin",
        name: "Kedisiplinan dan kepatuhan",
        weight: 10,
        indicators: [
          ind("p-aturan", "Mematuhi kebijakan yayasan dan prosedur unit.", 50),
          ind("p-laporan", "Menyampaikan laporan unit tepat waktu.", 50),
        ],
      },
      {
        code: "akhlak",
        name: "Akhlak, keteladanan, dan nilai Islami",
        weight: 15,
        indicators: [
          ind("p-amanah", "Menunjukkan kejujuran dan amanah dalam pengelolaan unit.", 34),
          ind("p-islami", "Menguatkan budaya Islami di unit.", 33),
          ind("p-etika", "Menjaga etika komunikasi dengan warga sekolah.", 33),
        ],
      },
      {
        code: "kolaborasi",
        name: "Kolaborasi dengan yayasan dan orang tua",
        weight: 10,
        indicators: [
          ind("p-yayasan", "Berkoordinasi dengan pengurus yayasan.", 50),
          ind("p-ortu", "Membangun komunikasi yang baik dengan orang tua.", 50),
        ],
      },
      {
        code: "pengembangan",
        name: "Pengembangan diri",
        weight: 5,
        indicators: [ind("p-diri", "Mengembangkan kompetensi kepemimpinan.", 100)],
      },
    ],
  },
];

export function rubricFor(name: string): [string, string, string, string, string] {
  return [
    `Jauh di bawah standar. ${name} belum tampak dan memerlukan pendampingan intensif.`,
    `Di bawah standar. ${name} baru sebagian terpenuhi dan perlu perbaikan terarah.`,
    `Memenuhi standar. ${name} sesuai ekspektasi jabatan.`,
    `Melampaui standar. ${name} lebih baik dari ekspektasi dengan bukti yang jelas.`,
    `Jauh melampaui standar. ${name} konsisten unggul dan menunjukkan kontribusi tambahan.`,
  ];
}

export type DemoEmployee = {
  id: string;
  code: string;
  fullName: string;
  unitId: string;
  positionId: string;
  group: "guru" | "tendik" | "pimpinan";
  demoRole: "pengurus_yayasan" | "kepala_unit" | "penilai" | "pegawai";
  assessorId?: string;
  verifierId?: string;
  supervisorId?: string;
  include: boolean;
  responsibilities?: Array<{ key: string; label: string }>;
  status?: string;
};

export const DEMO_EMPLOYEES: DemoEmployee[] = [
  {
    id: "demo-yay-pengurus",
    code: "DEMO-YAY-PENGURUS",
    fullName: "Pengurus Yayasan (Demo)",
    unitId: "yayasan",
    positionId: "pengurus",
    group: "pimpinan",
    demoRole: "pengurus_yayasan",
    include: false,
  },
  {
    id: "demo-yay-penilai",
    code: "DEMO-YAY-PENILAI",
    fullName: "Penilai Yayasan (Demo)",
    unitId: "yayasan",
    positionId: "pengurus",
    group: "pimpinan",
    demoRole: "penilai",
    include: false,
  },
  {
    id: "demo-yay-ver",
    code: "DEMO-YAY-VER",
    fullName: "Verifikator Yayasan (Demo)",
    unitId: "yayasan",
    positionId: "pengurus",
    group: "pimpinan",
    demoRole: "pengurus_yayasan",
    include: false,
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
    include: true,
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
    include: true,
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
    include: true,
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
    include: true,
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
    include: true,
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
    include: true,
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
    include: true,
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
    include: true,
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
    include: true,
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
    include: true,
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
    include: true,
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
    responsibilities: [{ key: "tahfiz", label: "Pembelajaran Al-Qur'an, tahsin, atau tahfiz" }],
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
    include: true,
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
    include: true,
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
    include: true,
  },
];

export const POSITIONS: Array<{ id: string; code: string; name: string; group: "guru" | "tendik" | "pimpinan"; description: string }> = [
  { id: "guru-kelas", code: "GURU-KELAS", name: "Guru Kelas", group: "guru", description: "Guru yang mengampu kelas." },
  { id: "guru-mapel", code: "GURU-MAPEL", name: "Guru Mata Pelajaran", group: "guru", description: "Guru mata pelajaran." },
  { id: "guru-pai", code: "GURU-PAI", name: "Guru Pendidikan Agama Islam", group: "guru", description: "Guru PAI." },
  { id: "guru-quran", code: "GURU-QURAN", name: "Guru Al-Qur'an", group: "guru", description: "Guru dengan tugas Al-Qur'an, tahsin, atau tahfiz." },
  { id: "kepala-unit", code: "KEPALA-UNIT", name: "Kepala Unit", group: "pimpinan", description: "Kepala unit pendidikan." },
  { id: "wakil-kepala", code: "WAKIL-KEPALA", name: "Wakil Kepala", group: "pimpinan", description: "Wakil kepala atau penilai yang ditunjuk." },
  { id: "pengurus", code: "PENGURUS", name: "Pengurus Yayasan", group: "pimpinan", description: "Pengurus pada tingkat yayasan." },
  { id: "tu", code: "TU", name: "Tenaga Administrasi", group: "tendik", description: "Tata usaha dan administrasi." },
  { id: "keuangan", code: "KEUANGAN", name: "Tenaga Keuangan", group: "tendik", description: "Pengelola keuangan unit." },
  { id: "perpustakaan", code: "PERPUSTAKAAN", name: "Pustakawan", group: "tendik", description: "Pengelola perpustakaan." },
  { id: "laboratorium", code: "LABORATORIUM", name: "Laboran", group: "tendik", description: "Pengelola laboratorium." },
  { id: "operator", code: "OPERATOR", name: "Operator", group: "tendik", description: "Operator data dan sistem." },
  { id: "layanan", code: "LAYANAN", name: "Petugas Layanan", group: "tendik", description: "Petugas layanan warga sekolah." },
  { id: "kebersihan", code: "KEBERSIHAN", name: "Petugas Kebersihan", group: "tendik", description: "Petugas kebersihan." },
  { id: "keamanan", code: "KEAMANAN", name: "Petugas Keamanan", group: "tendik", description: "Petugas keamanan." },
];
