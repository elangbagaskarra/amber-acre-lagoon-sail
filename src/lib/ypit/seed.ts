import { DEFAULT_BANDS } from "./scoring";
import { DEMO_EMPLOYEES, POSITIONS, TEMPLATES, rubricFor } from "./instruments";
import { db } from "./db-helpers";

const SETTINGS = {
  foundation_name: "Yayasan Pendidikan Islam Tembalang",
  short_name: "YPIT",
  app_name: "Sistem Informasi Penilaian Kinerja Guru dan Pegawai",
  address: "",
  phone: "",
  email: "",
  head_name: "",
  head_title: "",
  logo_data_url: "",
};

export async function ensureSeed(): Promise<void> {
  const sql = await db();
  const done = await sql<{ key: string }>`select key from app_settings where key = 'seed_version'`;
  if (done.length > 0) return;

  await sql`
    insert into organizational_units (id, code, name, kind, parent_id, level_code, head_title)
    values
      ('yayasan', 'YPIT', 'Yayasan Pendidikan Islam Tembalang', 'yayasan', null, 'yayasan', 'Ketua Yayasan'),
      ('kbtk', 'KB-TK', 'KB-TK Islam Pangeran Diponegoro', 'unit', 'yayasan', 'kbtk', 'Kepala KB-TK'),
      ('sd', 'SD', 'SD Islam Pangeran Diponegoro', 'unit', 'yayasan', 'sd', 'Kepala SD'),
      ('smptq', 'SMPTQ', 'SMPTQ Pangeran Diponegoro', 'unit', 'yayasan', 'smptq', 'Kepala SMPTQ')
    on conflict (id) do nothing
  `;

  for (const band of DEFAULT_BANDS) {
    const id = `band_${band.min}_${band.max}`;
    await sql`
      insert into result_bands (id, min_score, max_score, min_inclusive, max_inclusive, label, sort_order, active)
      values (
        ${id}, ${band.min}, ${band.max}, ${band.minInclusive}, ${band.maxInclusive},
        ${band.label}, ${100 - band.min}, true
      )
      on conflict (id) do nothing
    `;
  }

  for (const position of POSITIONS) {
    await sql`
      insert into positions (id, code, name, group_code, description, active)
      values (${position.id}, ${position.code}, ${position.name}, ${position.group}, ${position.description}, true)
      on conflict (id) do nothing
    `;
  }

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
    for (const responsibility of employee.responsibilities ?? []) {
      await sql`
        insert into employee_responsibilities (employee_id, responsibility_key, label)
        values (${employee.id}, ${responsibility.key}, ${responsibility.label})
        on conflict (employee_id, responsibility_key) do nothing
      `;
    }
  }

  const bands = JSON.stringify(DEFAULT_BANDS);
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
      ${"berlangsung"}, true, ${bands}::jsonb,
      ${"Periode contoh untuk uji coba. Bukan kalender resmi yang sudah ditetapkan yayasan."}
    )
    on conflict (id) do nothing
  `;

  for (const audience of ["guru", "tendik", "pimpinan"] as const) {
    await sql`
      insert into period_templates (period_id, audience, version_id)
      values (${"periode-demo-2026-1"}, ${audience}, ${`ver_${audience}_1`})
      on conflict (period_id, audience) do nothing
    `;
    await sql`
      update assessment_template_versions set status = 'terkunci' where id = ${`ver_${audience}_1`}
    `;
  }

  const employees = await sql<{
    id: string;
    group_code: string;
    assessor_id: string | null;
    verifier_id: string | null;
  }>`
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
    } else if (
      employee.assessor_id === employee.id ||
      employee.verifier_id === employee.id ||
      employee.assessor_id === employee.verifier_id
    ) {
      status = "tertahan";
      hold = "Penilai dan verifikator harus orang yang berbeda, dan tidak boleh menilai diri sendiri.";
    }
    const id = `asg_periode-demo-2026-1_${employee.id}`;
    await sql`
      insert into assessment_assignments (
        id, period_id, employee_id, assessor_id, verifier_id, version_id, status, hold_reason
      ) values (
        ${id}, ${"periode-demo-2026-1"}, ${employee.id}, ${employee.assessor_id}, ${employee.verifier_id},
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
