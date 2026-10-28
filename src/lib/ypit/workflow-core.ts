import type { Actor } from "./access";
import { AppError, Params, asText, db, fail, nid, num, plain } from "./db-helpers";
import { isRole, type Role } from "./labels";
import type { Band } from "./scoring";
import { DEFAULT_BANDS, weightsLookValid } from "./scoring";
import { ensureSeed } from "./seed";

type ProfileRow = {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  unit_id: string | null;
  employee_id: string | null;
  cross_unit: boolean;
  simulation_employee_id: string | null;
};

export async function loadActor(userId: string): Promise<Actor> {
  const sql = await db();
  await ensureSeed();
  const authRows = await sql<{ name: string; email: string }>`
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
  const profiles = await sql<ProfileRow>`select * from profiles where user_id = ${userId}`;
  const profile = profiles[0];
  if (!profile || !isRole(profile.role)) fail("Profil pengguna tidak valid.");

  let employeeId = profile.employee_id;
  let unitId = profile.unit_id;
  let employeeName: string | null = null;
  let unitName: string | null = null;
  if (employeeId) {
    const rows = await sql<{ full_name: string; unit_id: string; unit_name: string }>`
      select e.full_name, e.unit_id, u.name as unit_name
      from employees e
      join organizational_units u on u.id = e.unit_id
      where e.id = ${employeeId}
    `;
    employeeName = rows[0]?.full_name ?? null;
    unitId = rows[0]?.unit_id ?? unitId;
    unitName = rows[0]?.unit_name ?? null;
  } else if (unitId) {
    const rows = await sql<{ name: string }>`select name from organizational_units where id = ${unitId}`;
    unitName = rows[0]?.name ?? null;
  }

  let effectiveRole: Role = profile.role;
  let simulating = false;
  let simulationName: string | null = null;
  const simulationEmployeeId = profile.simulation_employee_id;
  if (profile.role === "super_admin" && simulationEmployeeId) {
    const rows = await sql<{
      id: string;
      full_name: string;
      unit_id: string;
      unit_name: string;
      demo_role: string | null;
      is_demo: boolean;
    }>`
      select e.id, e.full_name, e.unit_id, u.name as unit_name, e.demo_role, e.is_demo
      from employees e
      join organizational_units u on u.id = e.unit_id
      where e.id = ${simulationEmployeeId}
    `;
    const sim = rows[0];
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
    simulationName,
  };
}

export async function setSimulation(userId: string, employeeId: string | null): Promise<Actor> {
  const actor = await loadActor(userId);
  if (actor.profileRole !== "super_admin") fail("Hanya Super Administrator yang dapat menjalankan simulasi peran.");
  const sql = await db();
  if (employeeId) {
    const rows = await sql<{ id: string }>`
      select id from employees where id = ${employeeId} and is_demo = true and active = true
    `;
    if (!rows.length) fail("Simulasi hanya tersedia untuk pegawai demo yang aktif.");
  }
  await sql`
    update profiles set simulation_employee_id = ${employeeId}, updated_at = now() where user_id = ${userId}
  `;
  await audit(userId, employeeId ? "simulasi_mulai" : "simulasi_selesai", "profiles", userId, "", {
    employeeId,
  });
  return loadActor(userId);
}

export async function audit(
  actorUserId: string,
  action: string,
  entityType: string,
  entityId: string,
  reason = "",
  after?: unknown,
  before?: unknown,
): Promise<void> {
  const sql = await db();
  await sql`
    insert into audit_logs (id, actor_user_id, action, entity_type, entity_id, reason, before_json, after_json)
    values (
      ${nid("aud")}, ${actorUserId}, ${action}, ${entityType}, ${entityId}, ${reason},
      ${before ? JSON.stringify(before) : null}::jsonb,
      ${after ? JSON.stringify(after) : null}::jsonb
    )
  `;
}

async function assertMaster(userId: string): Promise<Actor> {
  const actor = await loadActor(userId);
  if (actor.profileRole !== "super_admin" || actor.simulating) {
    fail("Tindakan ini hanya untuk Super Administrator di luar mode simulasi.");
  }
  return actor;
}

export async function getInstitution() {
  const sql = await db();
  await ensureSeed();
  const rows = await sql<{ value: Institution }>`select value from app_settings where key = 'institution'`;
  return rows[0]?.value ?? null;
}

export type Institution = {
  foundation_name: string;
  short_name: string;
  app_name: string;
  address: string;
  phone: string;
  email: string;
  head_name: string;
  head_title: string;
  logo_data_url: string;
};

export async function saveInstitution(userId: string, input: Institution): Promise<Institution> {
  await assertMaster(userId);
  if (!input.foundation_name.trim()) fail("Nama yayasan wajib diisi.");
  if (input.logo_data_url && !input.logo_data_url.startsWith("data:image/")) {
    fail("Logo harus berupa berkas gambar.");
  }
  if (input.logo_data_url.length > 180_000) fail("Logo terlalu besar. Gunakan gambar di bawah 120 KB.");
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
    logo_data_url: input.logo_data_url,
  };
  await sql`
    insert into app_settings (key, value, updated_at)
    values ('institution', ${JSON.stringify(next)}::jsonb, now())
    on conflict (key) do update set value = excluded.value, updated_at = now()
  `;
  await audit(userId, "ubah_pengaturan", "app_settings", "institution", "", { ...next, logo_data_url: next.logo_data_url ? "[logo]" : "" });
  return next;
}

export async function listUnits() {
  const sql = await db();
  await ensureSeed();
  const rows = await sql`
    select u.*, (select count(*) from employees e where e.unit_id = u.id and e.active = true) as active_employees
    from organizational_units u
    order by case u.kind when 'yayasan' then 0 else 1 end, u.name
  `;
  return plain(rows).map((row) => ({ ...row, active_employees: num((row as { active_employees: unknown }).active_employees) }));
}

export async function saveUnit(
  userId: string,
  input: {
    id?: string;
    code: string;
    name: string;
    parentId: string | null;
    levelCode: string;
    address: string;
    phone: string;
    email: string;
    headTitle: string;
    headName: string;
  },
) {
  await assertMaster(userId);
  if (!input.name.trim() || !input.code.trim()) fail("Kode dan nama unit wajib diisi.");
  const sql = await db();
  const id = input.id?.trim() || nid("unit");
  const existing = await sql<{ id: string }>`select id from organizational_units where id = ${id}`;
  if (existing.length) {
    await sql`
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
  } else {
    await sql`
      insert into organizational_units (
        id, code, name, kind, parent_id, level_code, address, phone, email, head_title, head_name, active
      ) values (
        ${id}, ${input.code.trim()}, ${input.name.trim()}, 'unit', ${input.parentId ?? "yayasan"},
        ${input.levelCode || "sd"}, ${input.address.trim()}, ${input.phone.trim()}, ${input.email.trim()},
        ${input.headTitle.trim()}, ${input.headName.trim()}, true
      )
    `;
  }
  await audit(userId, existing.length ? "ubah_unit" : "tambah_unit", "organizational_units", id, "", input);
  return { id };
}

export async function setUnitActive(userId: string, id: string, active: boolean) {
  await assertMaster(userId);
  if (id === "yayasan" && !active) fail("Unit induk yayasan tidak dapat dinonaktifkan.");
  const sql = await db();
  await sql`update organizational_units set active = ${active}, updated_at = now() where id = ${id}`;
  await audit(userId, active ? "aktifkan_unit" : "nonaktifkan_unit", "organizational_units", id);
  return { ok: true };
}

export async function listPositions() {
  const sql = await db();
  await ensureSeed();
  return plain(await sql`select * from positions order by group_code, name`);
}

export async function savePosition(
  userId: string,
  input: { id?: string; code: string; name: string; groupCode: "guru" | "tendik" | "pimpinan"; description: string },
) {
  await assertMaster(userId);
  if (!input.name.trim() || !input.code.trim()) fail("Kode dan nama jabatan wajib diisi.");
  const sql = await db();
  const id = input.id?.trim() || nid("jab");
  const existing = await sql`select id from positions where id = ${id}`;
  if (existing.length) {
    await sql`
      update positions set code = ${input.code.trim()}, name = ${input.name.trim()},
        group_code = ${input.groupCode}, description = ${input.description.trim()}, updated_at = now()
      where id = ${id}
    `;
  } else {
    await sql`
      insert into positions (id, code, name, group_code, description, active)
      values (${id}, ${input.code.trim()}, ${input.name.trim()}, ${input.groupCode}, ${input.description.trim()}, true)
    `;
  }
  await audit(userId, existing.length ? "ubah_jabatan" : "tambah_jabatan", "positions", id, "", input);
  return { id };
}

export async function setPositionActive(userId: string, id: string, active: boolean) {
  await assertMaster(userId);
  const sql = await db();
  await sql`update positions set active = ${active}, updated_at = now() where id = ${id}`;
  await audit(userId, active ? "aktifkan_jabatan" : "nonaktifkan_jabatan", "positions", id);
  return { ok: true };
}

export async function listEmployees(userId: string, filter: { q?: string; unitId?: string; positionId?: string; group?: string; active?: string }) {
  const actor = await loadActor(userId);
  const sql = await db();
  const p = new Params();
  let where = "where 1=1";
  if (!(actor.effectiveRole === "super_admin" || actor.effectiveRole === "pengurus_yayasan" || actor.crossUnit) || actor.simulating) {
    if (actor.effectiveRole === "super_admin" && !actor.simulating) {
      /* semua */
    } else if (actor.effectiveRole === "pengurus_yayasan") {
      /* semua */
    } else if (actor.effectiveRole === "kepala_unit" && actor.unitId) {
      where += ` and e.unit_id = ${p.add(actor.unitId)}`;
    } else if (actor.effectiveRole === "penilai" && actor.employeeId) {
      const id = p.add(actor.employeeId);
      where += ` and (e.id = ${id} or e.assessor_id = ${id})`;
    } else if (actor.employeeId) {
      where += ` and e.id = ${p.add(actor.employeeId)}`;
    } else {
      where += " and 1=0";
    }
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
  const rows = await sql.query(
    `select e.*, u.name as unit_name, u.level_code, p.name as position_name,
            s.full_name as supervisor_name, a.full_name as assessor_name, v.full_name as verifier_name
     from employees e
     join organizational_units u on u.id = e.unit_id
     join positions p on p.id = e.position_id
     left join employees s on s.id = e.supervisor_id
     left join employees a on a.id = e.assessor_id
     left join employees v on v.id = e.verifier_id
     ${where}
     order by u.name, e.full_name`,
    p.values,
  );
  const responsibilities = await sql<{ employee_id: string; responsibility_key: string; label: string }>`
    select employee_id, responsibility_key, label from employee_responsibilities
  `;
  const byEmp = new Map<string, Array<{ key: string; label: string }>>();
  for (const row of responsibilities) {
    const list = byEmp.get(row.employee_id) ?? [];
    list.push({ key: row.responsibility_key, label: row.label });
    byEmp.set(row.employee_id, list);
  }
  return plain(rows).map((row) => {
    const item = row as { id: string };
    return { ...item, responsibilities: byEmp.get(item.id) ?? [] };
  });
}

type EmployeeInput = {
  id?: string;
  code: string;
  fullName: string;
  unitId: string;
  positionId: string;
  groupCode: "guru" | "tendik" | "pimpinan";
  employmentStatus: string;
  startDate: string;
  supervisorId: string | null;
  assessorId: string | null;
  verifierId: string | null;
  active: boolean;
  includeInAssessment: boolean;
  email: string;
  notes: string;
  responsibilities: Array<{ key: string; label: string }>;
};

function checkAssignmentTriangle(input: EmployeeInput) {
  if (input.assessorId && input.assessorId === input.id) fail("Pegawai tidak dapat menjadi penilai dirinya sendiri.");
  if (input.verifierId && input.verifierId === input.id) fail("Pegawai tidak dapat menjadi verifikator dirinya sendiri.");
  if (input.assessorId && input.verifierId && input.assessorId === input.verifierId) {
    fail("Penilai dan verifikator harus orang yang berbeda.");
  }
}

export async function saveEmployee(userId: string, input: EmployeeInput) {
  await assertMaster(userId);
  if (!input.code.trim() || !input.fullName.trim()) fail("Kode dan nama pegawai wajib diisi.");
  if (!input.unitId || !input.positionId) fail("Unit dan jabatan wajib dipilih.");
  const sql = await db();
  const dup = await sql<{ id: string }>`select id from employees where lower(code) = ${input.code.trim().toLowerCase()}`;
  if (dup.length && dup[0].id !== input.id) fail("Kode pegawai sudah digunakan.");
  const id = input.id?.trim() || nid("peg");
  checkAssignmentTriangle({ ...input, id });
  const position = await sql<{ group_code: string }>`select group_code from positions where id = ${input.positionId}`;
  if (!position.length) fail("Jabatan tidak ditemukan.");
  const existing = await sql<{ unit_id: string; position_id: string }>`
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
    name: input.fullName,
  });
  return { id };
}

export async function setEmployeeActive(userId: string, id: string, active: boolean) {
  await assertMaster(userId);
  const sql = await db();
  await sql`update employees set active = ${active}, updated_at = now() where id = ${id}`;
  await audit(userId, active ? "aktifkan_pegawai" : "nonaktifkan_pegawai", "employees", id);
  return { ok: true };
}

export async function importEmployees(userId: string, csv: string, commit: boolean) {
  await assertMaster(userId);
  const sql = await db();
  const lines = csv.replace(/^\uFEFF/, "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) fail("Berkas kosong. Baris pertama harus berupa judul kolom.");
  const header = splitCsv(lines[0]).map((cell) => cell.trim().toLowerCase());
  const required = ["kode", "nama", "unit", "jabatan", "kelompok"];
  for (const key of required) {
    if (!header.includes(key)) fail(`Kolom ${key} tidak ditemukan.`);
  }
  const units = await sql<{ id: string; code: string }>`select id, code from organizational_units`;
  const positions = await sql<{ id: string; code: string; group_code: string }>`select id, code, group_code from positions`;
  const existing = await sql<{ id: string; code: string }>`select id, code from employees`;
  const unitBy = new Map(units.flatMap((unit) => [[unit.id.toLowerCase(), unit.id], [unit.code.toLowerCase(), unit.id]]));
  const positionBy = new Map(positions.flatMap((position) => [[position.id.toLowerCase(), position], [position.code.toLowerCase(), position]]));
  const codeSet = new Set(existing.map((row) => row.code.toLowerCase()));
  const seen = new Set<string>();
  const preview: Array<{ line: number; ok: boolean; message: string; code: string; name: string }> = [];
  const ready: EmployeeInput[] = [];
  for (let index = 1; index < lines.length; index += 1) {
    const cells = splitCsv(lines[index]);
    const get = (key: string) => cells[header.indexOf(key)]?.trim() ?? "";
    const code = get("kode");
    const name = get("nama");
    const problems: string[] = [];
    if (!code || !name) problems.push("Kode dan nama wajib diisi.");
    if (code && (codeSet.has(code.toLowerCase()) || seen.has(code.toLowerCase()))) problems.push("Kode duplikat.");
    const unitId = unitBy.get(get("unit").toLowerCase());
    const position = positionBy.get(get("jabatan").toLowerCase());
    if (!unitId) problems.push("Unit tidak dikenali.");
    if (!position) problems.push("Jabatan tidak dikenali.");
    const group = (get("kelompok") || position?.group_code || "").toLowerCase();
    if (!["guru", "tendik", "pimpinan"].includes(group)) problems.push("Kelompok harus guru, tendik, atau pimpinan.");
    const assessorCode = get("penilai").toLowerCase();
    const verifierCode = get("verifikator").toLowerCase();
    const supervisorCode = get("atasan").toLowerCase();
    const findEmp = (codeValue: string) => existing.find((row) => row.code.toLowerCase() === codeValue)?.id ?? null;
    if (problems.length) {
      preview.push({ line: index + 1, ok: false, message: problems.join(" "), code, name });
      continue;
    }
    seen.add(code.toLowerCase());
    preview.push({ line: index + 1, ok: true, message: "Siap diimpor", code, name });
    ready.push({
      code,
      fullName: name,
      unitId: unitId!,
      positionId: position!.id,
      groupCode: group as EmployeeInput["groupCode"],
      employmentStatus: get("status") || "tetap",
      startDate: get("mulai"),
      supervisorId: supervisorCode ? findEmp(supervisorCode) : null,
      assessorId: assessorCode ? findEmp(assessorCode) : null,
      verifierId: verifierCode ? findEmp(verifierCode) : null,
      active: true,
      includeInAssessment: true,
      email: get("email"),
      notes: "Diimpor dari berkas.",
      responsibilities: get("tanggung_jawab")
        ? get("tanggung_jawab").split("|").filter(Boolean).map((key) => ({ key, label: key }))
        : [],
    });
  }
  if (commit) {
    if (preview.some((row) => !row.ok)) fail("Impor dibatalkan karena masih ada baris yang tidak valid.");
    for (const row of ready) await saveEmployee(userId, row);
  }
  return { preview, imported: commit ? ready.length : 0 };
}

function splitCsv(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
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

export async function listUsers(userId: string) {
  await assertMaster(userId);
  const sql = await db();
  return plain(await sql`
    select p.user_id, p.full_name, p.email, p.role, p.unit_id, p.employee_id, p.cross_unit,
           e.full_name as employee_name, u.name as unit_name
    from profiles p
    left join employees e on e.id = p.employee_id
    left join organizational_units u on u.id = p.unit_id
    order by p.full_name
  `);
}

export async function updateUserAccess(
  userId: string,
  input: { targetUserId: string; role: Role; unitId: string | null; employeeId: string | null; crossUnit: boolean },
) {
  const actor = await assertMaster(userId);
  if (!isRole(input.role)) fail("Peran tidak dikenal.");
  const sql = await db();
  if (input.targetUserId === actor.userId && input.role !== "super_admin") {
    const count = await sql<{ count: number }>`select count(*) from profiles where role = 'super_admin'`;
    if (num(count[0]?.count) <= 1) fail("Tidak dapat menurunkan Super Administrator terakhir.");
  }
  if (input.role !== "super_admin") {
    const others = await sql<{ count: number }>`
      select count(*) from profiles where role = 'super_admin' and user_id <> ${input.targetUserId}
    `;
    const current = await sql<{ role: string }>`select role from profiles where user_id = ${input.targetUserId}`;
    if (current[0]?.role === "super_admin" && num(others[0]?.count) === 0) {
      fail("Tidak dapat menurunkan Super Administrator terakhir.");
    }
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

export async function listBands() {
  const sql = await db();
  await ensureSeed();
  const rows = await sql`
    select * from result_bands where active = true order by sort_order
  `;
  return plain(rows).map((row) => ({
    id: (row as { id: string }).id,
    min: num((row as { min_score: unknown }).min_score),
    max: num((row as { max_score: unknown }).max_score),
    minInclusive: Boolean((row as { min_inclusive: boolean }).min_inclusive),
    maxInclusive: Boolean((row as { max_inclusive: boolean }).max_inclusive),
    label: (row as { label: string }).label,
  }));
}

export async function saveBands(userId: string, bands: Band[]) {
  await assertMaster(userId);
  if (bands.length < 2) fail("Sekurang-kurangnya dua kategori hasil.");
  const sql = await db();
  const open = await sql<{ id: string }>`
    select id from assessment_periods where status <> 'persiapan' and status <> 'ditutup'
  `;
  if (open.length) fail("Batas kategori hasil dikunci selama ada periode yang sedang berjalan. Ubah sebelum periode dibuka.");
  await sql`update result_bands set active = false`;
  let order = 1;
  for (const band of bands) {
    if (!band.label.trim()) fail("Label kategori hasil wajib diisi.");
    const id = nid("band");
    await sql`
      insert into result_bands (id, min_score, max_score, min_inclusive, max_inclusive, label, sort_order, active)
      values (${id}, ${band.min}, ${band.max}, ${band.minInclusive}, ${band.maxInclusive}, ${band.label.trim()}, ${order}, true)
    `;
    order += 1;
  }
  await audit(userId, "ubah_batas_nilai", "result_bands", "global", "", bands);
  return listBands();
}

export function currentBandsFromRows(rows: Array<{ min_score: unknown; max_score: unknown; min_inclusive: boolean; max_inclusive: boolean; label: string }>): Band[] {
  if (!rows.length) return DEFAULT_BANDS;
  return rows.map((row) => ({
    min: num(row.min_score),
    max: num(row.max_score),
    minInclusive: row.min_inclusive,
    maxInclusive: row.max_inclusive,
    label: row.label,
  }));
}

export async function listInstruments() {
  const sql = await db();
  await ensureSeed();
  const templates = await sql`select * from assessment_templates order by name`;
  const versions = await sql`select * from assessment_template_versions order by version_no desc`;
  const categories = await sql`select * from assessment_categories order by sort_order`;
  const indicators = await sql`select * from assessment_indicators order by sort_order`;
  return plain({ templates, versions, categories, indicators });
}

async function versionEditable(versionId: string) {
  const sql = await db();
  const versions = await sql<{ status: string }>`select status from assessment_template_versions where id = ${versionId}`;
  if (!versions.length) fail("Versi instrumen tidak ditemukan.");
  if (versions[0].status !== "draf") fail("Versi instrumen terkunci karena sudah dipakai periode yang berjalan.");
  const used = await sql<{ id: string }>`
    select p.id from period_templates pt
    join assessment_periods p on p.id = pt.period_id
    where pt.version_id = ${versionId} and p.status <> 'persiapan'
  `;
  if (used.length) fail("Versi ini sudah dirujuk periode yang tidak lagi dalam persiapan.");
}

export async function saveCategoryWeight(userId: string, categoryId: string, weight: number, name: string) {
  await assertMaster(userId);
  const sql = await db();
  const rows = await sql<{ version_id: string }>`select version_id from assessment_categories where id = ${categoryId}`;
  if (!rows.length) fail("Kategori tidak ditemukan.");
  await versionEditable(rows[0].version_id);
  await sql`update assessment_categories set weight = ${weight}, name = ${name.trim()} where id = ${categoryId}`;
  const all = await sql<{ weight: unknown }>`select weight from assessment_categories where version_id = ${rows[0].version_id}`;
  const check = weightsLookValid(all.map((row) => num(row.weight)));
  await audit(userId, "ubah_bobot_kategori", "assessment_categories", categoryId, "", { weight, total: check.total });
  return { total: check.total, ok: check.ok };
}

export async function saveIndicator(
  userId: string,
  input: {
    id?: string;
    categoryId: string;
    name: string;
    weight: number;
    unitScope: string;
    responsibilityKey: string;
    positionCodes: string;
    rubric: [string, string, string, string, string];
  },
) {
  await assertMaster(userId);
  const sql = await db();
  const categories = await sql<{ version_id: string }>`select version_id from assessment_categories where id = ${input.categoryId}`;
  if (!categories.length) fail("Kategori tidak ditemukan.");
  await versionEditable(categories[0].version_id);
  if (!input.name.trim() || input.weight <= 0) fail("Nama dan bobot indikator wajib valid.");
  const id = input.id || nid("ind");
  const existing = await sql`select id from assessment_indicators where id = ${id}`;
  if (existing.length) {
    await sql`
      update assessment_indicators set
        name = ${input.name.trim()}, description = ${input.name.trim()}, weight = ${input.weight},
        unit_scope = ${input.unitScope || "all"}, responsibility_key = ${input.responsibilityKey.trim()},
        position_codes = ${input.positionCodes.trim()},
        rubric_1 = ${input.rubric[0]}, rubric_2 = ${input.rubric[1]}, rubric_3 = ${input.rubric[2]},
        rubric_4 = ${input.rubric[3]}, rubric_5 = ${input.rubric[4]}
      where id = ${id}
    `;
  } else {
    const orderRows = await sql<{ sort_order: number }>`
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
  await audit(userId, "ubah_indikator", "assessment_indicators", id, "", { name: input.name, weight: input.weight });
  return { id };
}

export async function cloneVersion(userId: string, versionId: string) {
  await assertMaster(userId);
  const sql = await db();
  const versions = await sql<{ template_id: string; version_no: number; label: string }>`
    select template_id, version_no, label from assessment_template_versions where id = ${versionId}
  `;
  if (!versions.length) fail("Versi tidak ditemukan.");
  const nextNo = num(versions[0].version_no) + 1;
  const nextId = nid("ver");
  await sql`
    insert into assessment_template_versions (id, template_id, version_no, label, status)
    values (${nextId}, ${versions[0].template_id}, ${nextNo}, ${`Versi ${nextNo}`}, 'draf')
  `;
  const categories = await sql<{ id: string; code: string; name: string; weight: unknown; sort_order: number; description: string }>`
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
    for (const indicator of indicators as Array<Record<string, unknown>>) {
      await sql`
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
  }
  await audit(userId, "salin_versi_instrumen", "assessment_template_versions", nextId, "", { from: versionId });
  return { id: nextId };
}

export async function listPeriods() {
  const sql = await db();
  await ensureSeed();
  const periods = await sql`select * from assessment_periods order by start_date desc`;
  const links = await sql`select * from period_templates`;
  return plain({ periods, links });
}

export async function savePeriod(
  userId: string,
  input: {
    id?: string;
    name: string;
    academicYear: string;
    semester: number;
    startDate: string;
    endDate: string;
    selfStart: string;
    selfEnd: string;
    assessorStart: string;
    assessorEnd: string;
    verifyStart: string;
    verifyEnd: string;
    finalizeDeadline: string;
    versions: { guru: string; tendik: string; pimpinan: string };
  },
) {
  await assertMaster(userId);
  if (!input.name.trim() || !input.academicYear.trim()) fail("Nama periode dan tahun ajaran wajib diisi.");
  const sql = await db();
  const id = input.id || nid("periode");
  const existing = await sql<{ status: string }>`select status from assessment_periods where id = ${id}`;
  if (existing.length && existing[0].status !== "persiapan") {
    await sql`
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
  } else if (existing.length) {
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
    for (const audience of ["guru", "tendik", "pimpinan"] as const) {
      await sql`
        insert into period_templates (period_id, audience, version_id)
        values (${id}, ${audience}, ${input.versions[audience]})
        on conflict (period_id, audience) do update set version_id = excluded.version_id
      `;
    }
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
    for (const audience of ["guru", "tendik", "pimpinan"] as const) {
      await sql`
        insert into period_templates (period_id, audience, version_id)
        values (${id}, ${audience}, ${input.versions[audience]})
      `;
    }
  }
  await audit(userId, "simpan_periode", "assessment_periods", id, "", { name: input.name });
  return { id };
}

export async function setPeriodStatus(userId: string, periodId: string, status: string, reason: string) {
  await assertMaster(userId);
  const allowed = ["persiapan", "dibuka", "berlangsung", "menunggu_finalisasi", "ditutup"];
  if (!allowed.includes(status)) fail("Status periode tidak dikenal.");
  const sql = await db();
  const rows = await sql<{ status: string }>`select status from assessment_periods where id = ${periodId}`;
  if (!rows.length) fail("Periode tidak ditemukan.");
  const from = rows[0].status;
  if (status === "ditutup" && !reason.trim()) fail("Penutupan periode memerlukan alasan.");
  if (from === "ditutup" && status !== "ditutup" && !reason.trim()) {
    fail("Pembukaan kembali periode memerlukan alasan yang tercatat.");
  }
  if ((status === "dibuka" || status === "berlangsung") && (from === "persiapan" || from === "dibuka")) {
    const bandRows = await sql<{
      min_score: unknown;
      max_score: unknown;
      min_inclusive: boolean;
      max_inclusive: boolean;
      label: string;
    }>`select * from result_bands where active = true order by sort_order`;
    const bands = currentBandsFromRows(bandRows);
    await sql`update assessment_periods set bands = ${JSON.stringify(bands)}::jsonb where id = ${periodId}`;
    const links = await sql<{ version_id: string }>`select version_id from period_templates where period_id = ${periodId}`;
    for (const link of links) {
      const weights = await sql<{ weight: unknown }>`
        select weight from assessment_categories where version_id = ${link.version_id}
      `;
      const check = weightsLookValid(weights.map((row) => num(row.weight)));
      if (!check.ok) fail(`Bobot kategori pada versi instrumen belum 100% (saat ini ${check.total}%).`);
      await sql`update assessment_template_versions set status = 'terkunci' where id = ${link.version_id}`;
    }
    await generateAssignments(periodId);
  }
  await sql`
    update assessment_periods set status = ${status}, reopen_reason = ${from === "ditutup" ? reason.trim() : ""}, updated_at = now()
    where id = ${periodId}
  `;
  if (from === "ditutup" && status !== "ditutup") {
    await sql`update assessment_periods set reopen_reason = ${reason.trim()} where id = ${periodId}`;
  }
  await audit(userId, "ubah_status_periode", "assessment_periods", periodId, reason, { from, to: status });
  return { ok: true };
}

export async function generateAssignments(periodId: string) {
  const sql = await db();
  const links = await sql<{ audience: string; version_id: string }>`
    select audience, version_id from period_templates where period_id = ${periodId}
  `;
  const versionBy = new Map(links.map((link) => [link.audience, link.version_id]));
  const employees = await sql<{
    id: string;
    group_code: string;
    assessor_id: string | null;
    verifier_id: string | null;
    user_id: string | null;
    full_name: string;
  }>`
    select id, group_code, assessor_id, verifier_id, user_id, full_name
    from employees where active = true and include_in_assessment = true
  `;
  const period = await sql<{ name: string }>`select name from assessment_periods where id = ${periodId}`;
  for (const employee of employees) {
    const versionId = versionBy.get(employee.group_code);
    if (!versionId) continue;
    const exists = await sql<{ id: string; status: string }>`
      select id, status from assessment_assignments where period_id = ${periodId} and employee_id = ${employee.id}
    `;
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
      hold = "Penilai dan verifikator harus berbeda dan tidak boleh menilai diri sendiri.";
    }
    if (exists.length) {
      if (exists[0].status === "tertahan") {
        await sql`
          update assessment_assignments set
            assessor_id = ${employee.assessor_id}, verifier_id = ${employee.verifier_id},
            version_id = ${versionId}, status = ${status}, hold_reason = ${hold}, updated_at = now()
          where id = ${exists[0].id}
        `;
      }
      continue;
    }
    const id = nid("asg");
    await sql`
      insert into assessment_assignments (
        id, period_id, employee_id, assessor_id, verifier_id, version_id, status, hold_reason
      ) values (
        ${id}, ${periodId}, ${employee.id}, ${employee.assessor_id}, ${employee.verifier_id},
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

export async function orgTree() {
  const sql = await db();
  await ensureSeed();
  const units = plain(await sql`select * from organizational_units order by name`);
  const positions = plain(await sql`select id, name, group_code, active from positions order by name`);
  const counts = plain(
    await sql`
      select unit_id, group_code, count(*) as total
      from employees where active = true
      group by unit_id, group_code
    `,
  );
  return { units, positions, counts: (counts as Array<Record<string, unknown>>).map((row) => ({ ...row, total: num(row.total) })) };
}

export { AppError };
