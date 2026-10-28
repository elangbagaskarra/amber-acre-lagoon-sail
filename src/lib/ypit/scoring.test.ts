import assert from "node:assert/strict";
import test from "node:test";
import { computeScore, labelFor, weightsLookValid, workedExamples, DEFAULT_BANDS } from "./scoring.ts";

test("bobot kategori 100 diterima dan 99 ditolak", () => {
  assert.equal(weightsLookValid([15, 25, 15, 10, 10, 10, 10, 5]).ok, true);
  assert.equal(weightsLookValid([15, 25, 15, 10, 10, 10, 10, 4]).ok, false);
});

test("label mengikuti batas konfigurasi awal", () => {
  assert.equal(labelFor(100, DEFAULT_BANDS), "Sangat Baik");
  assert.equal(labelFor(90, DEFAULT_BANDS), "Sangat Baik");
  assert.equal(labelFor(89.99, DEFAULT_BANDS), "Baik");
  assert.equal(labelFor(80, DEFAULT_BANDS), "Baik");
  assert.equal(labelFor(70, DEFAULT_BANDS), "Cukup");
  assert.equal(labelFor(60, DEFAULT_BANDS), "Perlu Pembinaan");
  assert.equal(labelFor(59.99, DEFAULT_BANDS), "Memerlukan Evaluasi Intensif");
});

test("kasus manual cocok dengan mesin hitung", () => {
  for (const example of workedExamples()) {
    const result = computeScore(example.items);
    assert.equal(result.complete, true, example.name);
    assert.equal(result.finalScore, example.expected, example.name);
  }
});

test("N/A yang belum disetujui menghalangi nilai akhir", () => {
  const result = computeScore([
    {
      indicatorId: "a1",
      categoryId: "A",
      categoryName: "A",
      categoryWeight: 100,
      categoryOrder: 1,
      indicatorName: "A1",
      indicatorWeight: 100,
      indicatorOrder: 1,
      score: null,
      isNa: true,
      naApproved: false,
    },
  ]);
  assert.equal(result.complete, false);
  assert.equal(result.finalScore, null);
  assert.equal(result.pendingNa, 1);
});

test("evaluasi diri tidak dihitung: fungsi hanya menerima skor penilai", () => {
  const result = computeScore([
    {
      indicatorId: "a1",
      categoryId: "A",
      categoryName: "A",
      categoryWeight: 100,
      categoryOrder: 1,
      indicatorName: "A1",
      indicatorWeight: 100,
      indicatorOrder: 1,
      score: 5,
      isNa: false,
      naApproved: false,
    },
  ]);
  assert.equal(result.finalScore, 100);
  assert.equal(result.label, "Sangat Baik");
});
