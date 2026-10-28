/** Perhitungan nilai kinerja. Murni, tanpa akses basis data, agar dapat diuji. */

export type Band = {
  min: number;
  max: number;
  minInclusive: boolean;
  maxInclusive: boolean;
  label: string;
};

export type ScoreInput = {
  indicatorId: string;
  categoryId: string;
  categoryName: string;
  categoryWeight: number;
  categoryOrder: number;
  indicatorName: string;
  indicatorWeight: number;
  indicatorOrder: number;
  score: number | null;
  isNa: boolean;
  naApproved: boolean;
};

export type CategoryResult = {
  categoryId: string;
  name: string;
  weight: number;
  normalizedWeight: number;
  score: number | null;
  excluded: boolean;
  indicators: Array<{
    indicatorId: string;
    name: string;
    weight: number;
    normalizedWeight: number;
    score: number | null;
    percent: number | null;
    excluded: boolean;
    pendingNa: boolean;
  }>;
};

export type ScoreResult = {
  complete: boolean;
  finalScore: number | null;
  label: string | null;
  pendingNa: number;
  missing: number;
  categories: CategoryResult[];
  warnings: string[];
};

export const DEFAULT_BANDS: Band[] = [
  { min: 90, max: 100, minInclusive: true, maxInclusive: true, label: "Sangat Baik" },
  { min: 80, max: 90, minInclusive: true, maxInclusive: false, label: "Baik" },
  { min: 70, max: 80, minInclusive: true, maxInclusive: false, label: "Cukup" },
  { min: 60, max: 70, minInclusive: true, maxInclusive: false, label: "Perlu Pembinaan" },
  { min: 0, max: 60, minInclusive: true, maxInclusive: false, label: "Memerlukan Evaluasi Intensif" },
];

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function labelFor(score: number, bands: Band[]): string {
  const ordered = [...bands].sort((a, b) => b.min - a.min);
  for (const band of ordered) {
    const above = band.minInclusive ? score >= band.min : score > band.min;
    const below = band.maxInclusive ? score <= band.max : score < band.max;
    if (above && below) return band.label;
  }
  return "Belum diklasifikasi";
}

export function weightsLookValid(weights: number[]): { ok: boolean; total: number } {
  const total = round2(weights.reduce((s, w) => s + w, 0));
  return { ok: Math.abs(total - 100) < 0.05, total };
}

/**
 * Nilai indikator = (skor / 5) × 100.
 * Nilai kategori = rata-rata tertimbang indikator yang berlaku.
 * Nilai akhir = jumlah (nilai kategori × bobot kategori), dengan normalisasi
 * jika ada indikator atau kategori yang disetujui tidak berlaku.
 * Evaluasi diri tidak masuk ke nilai akhir.
 */
export function computeScore(items: ScoreInput[], bands: Band[] = DEFAULT_BANDS): ScoreResult {
  const warnings: string[] = [];
  const byCat = new Map<string, ScoreInput[]>();
  for (const item of items) {
    const list = byCat.get(item.categoryId) ?? [];
    list.push(item);
    byCat.set(item.categoryId, list);
  }

  let pendingNa = 0;
  let missing = 0;
  const draft: CategoryResult[] = [];

  for (const [categoryId, inds] of byCat) {
    const sample = inds[0];
    const applicable = inds.filter((i) => !(i.isNa && i.naApproved));
    const pending = inds.filter((i) => i.isNa && !i.naApproved);
    pendingNa += pending.length;
    for (const ind of applicable) {
      if (!ind.isNa && (ind.score == null || ind.score < 1 || ind.score > 5)) missing += 1;
    }
    const excluded = applicable.length === 0;
    const weightSum = applicable.reduce((s, i) => s + i.indicatorWeight, 0);
    const indicators = inds
      .slice()
      .sort((a, b) => a.indicatorOrder - b.indicatorOrder)
      .map((ind) => {
        const dropped = ind.isNa && ind.naApproved;
        const pendingItem = ind.isNa && !ind.naApproved;
        const pct =
          !dropped && !pendingItem && ind.score != null ? round2((ind.score / 5) * 100) : null;
        const normalizedWeight =
          !dropped && weightSum > 0 ? round2((ind.indicatorWeight / weightSum) * 100) : 0;
        return {
          indicatorId: ind.indicatorId,
          name: ind.indicatorName,
          weight: ind.indicatorWeight,
          normalizedWeight,
          score: ind.score,
          percent: pct,
          excluded: dropped,
          pendingNa: pendingItem,
        };
      });
    let score: number | null = null;
    if (!excluded && missing === 0 && pending.length === 0 && weightSum > 0) {
      const acc = applicable.reduce((s, ind) => {
        const pct = ((ind.score ?? 0) / 5) * 100;
        return s + pct * ind.indicatorWeight;
      }, 0);
      score = round2(acc / weightSum);
    }
    draft.push({
      categoryId,
      name: sample.categoryName,
      weight: sample.categoryWeight,
      normalizedWeight: 0,
      score,
      excluded,
      indicators,
    });
    draft.sort((a, b) => {
      const ao = inds[0]?.categoryOrder ?? 0;
      return ao - ao;
    });
  }

  const order = new Map<string, number>();
  for (const item of items) order.set(item.categoryId, item.categoryOrder);
  draft.sort((a, b) => (order.get(a.categoryId) ?? 0) - (order.get(b.categoryId) ?? 0));

  const activeCats = draft.filter((c) => !c.excluded);
  const catWeightSum = activeCats.reduce((s, c) => s + c.weight, 0);
  for (const cat of draft) {
    cat.normalizedWeight =
      !cat.excluded && catWeightSum > 0 ? round2((cat.weight / catWeightSum) * 100) : 0;
  }

  const complete =
    items.length > 0 && pendingNa === 0 && missing === 0 && activeCats.length > 0 && activeCats.every((c) => c.score != null);

  let finalScore: number | null = null;
  if (complete && catWeightSum > 0) {
    const acc = activeCats.reduce((s, c) => s + (c.score ?? 0) * c.weight, 0);
    finalScore = round2(acc / catWeightSum);
  }

  if (pendingNa > 0) warnings.push("Ada indikator N/A yang belum disetujui pejabat berwenang.");
  if (missing > 0) warnings.push("Masih ada indikator yang belum diberi skor.");
  if (items.length === 0) warnings.push("Tidak ada indikator yang berlaku untuk pegawai ini.");
  const excludedCats = draft.filter((c) => c.excluded);
  if (excludedCats.length) {
    warnings.push(
      `Kategori dikeluarkan karena seluruh indikatornya tidak berlaku: ${excludedCats.map((c) => c.name).join(", ")}. Bobot dinormalisasi.`,
    );
  }

  return {
    complete,
    finalScore,
    label: finalScore == null ? null : labelFor(finalScore, bands),
    pendingNa,
    missing,
    categories: draft,
    warnings,
  };
}

export type WorkedCase = {
  name: string;
  expected: number;
  items: ScoreInput[];
};

function item(
  partial: Pick<ScoreInput, "indicatorId" | "categoryId" | "categoryName" | "categoryWeight" | "indicatorWeight" | "score"> &
    Partial<ScoreInput>,
): ScoreInput {
  return {
    categoryOrder: partial.categoryOrder ?? 1,
    indicatorName: partial.indicatorName ?? partial.indicatorId,
    indicatorOrder: partial.indicatorOrder ?? 1,
    isNa: partial.isNa ?? false,
    naApproved: partial.naApproved ?? false,
    ...partial,
  };
}

/** Kasus yang dapat dihitung manual. Dipakai uji otomatis dan halaman panduan. */
export function workedExamples(): WorkedCase[] {
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
          score: 4,
        }),
        item({
          indicatorId: "a2",
          categoryId: "A",
          categoryName: "Perencanaan",
          categoryWeight: 60,
          categoryOrder: 1,
          indicatorWeight: 50,
          indicatorOrder: 2,
          score: 4,
        }),
        item({
          indicatorId: "b1",
          categoryId: "B",
          categoryName: "Pelaksanaan",
          categoryWeight: 40,
          categoryOrder: 2,
          indicatorWeight: 100,
          indicatorOrder: 1,
          score: 4,
        }),
      ],
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
          score: 5,
        }),
        item({
          indicatorId: "a2",
          categoryId: "A",
          categoryName: "Perencanaan",
          categoryWeight: 60,
          categoryOrder: 1,
          indicatorWeight: 50,
          indicatorOrder: 2,
          score: 3,
        }),
        item({
          indicatorId: "b1",
          categoryId: "B",
          categoryName: "Pelaksanaan",
          categoryWeight: 40,
          categoryOrder: 2,
          indicatorWeight: 100,
          score: 4,
        }),
      ],
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
          score: 5,
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
          naApproved: true,
        }),
        item({
          indicatorId: "b1",
          categoryId: "B",
          categoryName: "Pelaksanaan",
          categoryWeight: 50,
          categoryOrder: 2,
          indicatorWeight: 100,
          score: 3,
        }),
      ],
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
          score: 4,
        }),
        item({
          indicatorId: "b1",
          categoryId: "B",
          categoryName: "Pelaksanaan",
          categoryWeight: 40,
          categoryOrder: 2,
          indicatorWeight: 100,
          score: 4,
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
          naApproved: true,
        }),
      ],
    },
  ];
}
