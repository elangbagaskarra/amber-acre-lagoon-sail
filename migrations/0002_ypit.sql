-- Skema Sistem Informasi Penilaian Kinerja Guru dan Pegawai YPIT.
-- Identitas memakai text (bukan uuid) agar kompatibel dengan PGLite dan Better Auth.

create table if not exists organizational_units (
  id text primary key,
  code text not null unique,
  name text not null,
  kind text not null check (kind in ('yayasan', 'unit')),
  parent_id text references organizational_units (id),
  level_code text not null,
  address text not null default '',
  phone text not null default '',
  email text not null default '',
  head_title text not null default '',
  head_name text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists positions (
  id text primary key,
  code text not null unique,
  name text not null,
  group_code text not null check (group_code in ('guru', 'tendik', 'pimpinan')),
  description text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists employees (
  id text primary key,
  code text not null unique,
  full_name text not null,
  unit_id text not null references organizational_units (id),
  position_id text not null references positions (id),
  group_code text not null check (group_code in ('guru', 'tendik', 'pimpinan')),
  employment_status text not null default 'tetap',
  start_date date,
  supervisor_id text references employees (id),
  assessor_id text references employees (id),
  verifier_id text references employees (id),
  user_id text unique,
  active boolean not null default true,
  is_demo boolean not null default false,
  include_in_assessment boolean not null default true,
  demo_role text,
  email text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists employees_unit_idx on employees (unit_id);
create index if not exists employees_position_idx on employees (position_id);
create index if not exists employees_active_idx on employees (active);

create table if not exists employee_responsibilities (
  employee_id text not null references employees (id) on delete cascade,
  responsibility_key text not null,
  label text not null default '',
  primary key (employee_id, responsibility_key)
);

create table if not exists employee_assignments (
  id text primary key,
  employee_id text not null references employees (id) on delete cascade,
  unit_id text not null references organizational_units (id),
  position_id text not null references positions (id),
  start_date date,
  end_date date,
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists employee_assignments_emp_idx on employee_assignments (employee_id);

create table if not exists profiles (
  user_id text primary key,
  full_name text not null default '',
  email text not null default '',
  role text not null default 'pegawai',
  unit_id text references organizational_units (id),
  employee_id text references employees (id),
  cross_unit boolean not null default false,
  simulation_employee_id text references employees (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists result_bands (
  id text primary key,
  min_score numeric not null,
  max_score numeric not null,
  min_inclusive boolean not null default true,
  max_inclusive boolean not null default false,
  label text not null,
  sort_order int not null,
  active boolean not null default true
);

create table if not exists assessment_templates (
  id text primary key,
  code text not null unique,
  name text not null,
  audience text not null check (audience in ('guru', 'tendik', 'pimpinan')),
  description text not null default '',
  active boolean not null default true
);

create table if not exists assessment_template_versions (
  id text primary key,
  template_id text not null references assessment_templates (id),
  version_no int not null,
  label text not null,
  status text not null default 'draf' check (status in ('draf', 'terkunci')),
  created_at timestamptz not null default now(),
  unique (template_id, version_no)
);

create table if not exists assessment_categories (
  id text primary key,
  version_id text not null references assessment_template_versions (id) on delete cascade,
  code text not null,
  name text not null,
  weight numeric not null,
  sort_order int not null,
  description text not null default ''
);

create index if not exists assessment_categories_version_idx on assessment_categories (version_id);

create table if not exists assessment_indicators (
  id text primary key,
  category_id text not null references assessment_categories (id) on delete cascade,
  code text not null,
  name text not null,
  description text not null default '',
  rubric_1 text not null default '',
  rubric_2 text not null default '',
  rubric_3 text not null default '',
  rubric_4 text not null default '',
  rubric_5 text not null default '',
  weight numeric not null,
  sort_order int not null,
  unit_scope text not null default 'all',
  responsibility_key text not null default '',
  position_codes text not null default '',
  active boolean not null default true
);

create index if not exists assessment_indicators_category_idx on assessment_indicators (category_id);

create table if not exists assessment_periods (
  id text primary key,
  name text not null,
  academic_year text not null,
  semester int not null check (semester in (1, 2)),
  start_date date not null,
  end_date date not null,
  self_start date not null,
  self_end date not null,
  assessor_start date not null,
  assessor_end date not null,
  verify_start date not null,
  verify_end date not null,
  finalize_deadline date not null,
  status text not null check (status in ('persiapan', 'dibuka', 'berlangsung', 'menunggu_finalisasi', 'ditutup')),
  is_demo boolean not null default false,
  reopen_reason text not null default '',
  bands jsonb not null default '[]'::jsonb,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists period_templates (
  period_id text not null references assessment_periods (id) on delete cascade,
  audience text not null,
  version_id text not null references assessment_template_versions (id),
  primary key (period_id, audience)
);

create table if not exists assessment_assignments (
  id text primary key,
  period_id text not null references assessment_periods (id) on delete cascade,
  employee_id text not null references employees (id),
  assessor_id text references employees (id),
  verifier_id text references employees (id),
  version_id text not null references assessment_template_versions (id),
  status text not null,
  hold_reason text not null default '',
  final_score numeric,
  final_label text,
  breakdown jsonb,
  self_submitted_at timestamptz,
  assessor_submitted_at timestamptz,
  verified_at timestamptz,
  finalized_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (period_id, employee_id)
);

create index if not exists assessment_assignments_period_idx on assessment_assignments (period_id);
create index if not exists assessment_assignments_employee_idx on assessment_assignments (employee_id);
create index if not exists assessment_assignments_assessor_idx on assessment_assignments (assessor_id);
create index if not exists assessment_assignments_verifier_idx on assessment_assignments (verifier_id);
create index if not exists assessment_assignments_status_idx on assessment_assignments (status);

create table if not exists self_assessments (
  assignment_id text primary key references assessment_assignments (id) on delete cascade,
  achievements text not null default '',
  completed_tasks text not null default '',
  obstacles text not null default '',
  competencies_to_improve text not null default '',
  training_needs text not null default '',
  next_targets text not null default '',
  status text not null default 'draf',
  submitted_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists self_scores (
  id text primary key,
  assignment_id text not null references assessment_assignments (id) on delete cascade,
  indicator_id text not null references assessment_indicators (id),
  score int,
  is_na boolean not null default false,
  na_reason text not null default '',
  note text not null default '',
  unique (assignment_id, indicator_id)
);

create table if not exists supervisor_assessments (
  assignment_id text primary key references assessment_assignments (id) on delete cascade,
  overall_feedback text not null default '',
  strengths text not null default '',
  improvements text not null default '',
  status text not null default 'draf',
  submitted_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists assessment_scores (
  id text primary key,
  assignment_id text not null references assessment_assignments (id) on delete cascade,
  indicator_id text not null references assessment_indicators (id),
  score int,
  is_na boolean not null default false,
  na_reason text not null default '',
  na_status text not null default 'none',
  note text not null default '',
  evidence_note text not null default '',
  recommendation text not null default '',
  unique (assignment_id, indicator_id)
);

create table if not exists assessment_evidence (
  id text primary key,
  assignment_id text not null references assessment_assignments (id) on delete cascade,
  indicator_id text references assessment_indicators (id),
  author_user_id text not null,
  kind text not null,
  title text not null,
  body text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists approval_histories (
  id text primary key,
  assignment_id text not null references assessment_assignments (id) on delete cascade,
  actor_user_id text not null,
  action text not null,
  from_status text not null default '',
  to_status text not null default '',
  reason text not null default '',
  meta jsonb,
  created_at timestamptz not null default now()
);

create index if not exists approval_histories_assignment_idx on approval_histories (assignment_id);

create table if not exists assessment_feedback (
  id text primary key,
  assignment_id text not null references assessment_assignments (id) on delete cascade,
  author_user_id text not null,
  author_role text not null default '',
  kind text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists development_plans (
  id text primary key,
  assignment_id text references assessment_assignments (id) on delete set null,
  employee_id text not null references employees (id),
  period_id text references assessment_periods (id) on delete set null,
  aspect text not null,
  gap_found text not null default '',
  goal text not null default '',
  activity text not null default '',
  support_needed text not null default '',
  owner_name text not null default '',
  due_date date,
  success_indicator text not null default '',
  status text not null default 'belum_dimulai',
  follow_up_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists development_plans_employee_idx on development_plans (employee_id);

create table if not exists development_plan_updates (
  id text primary key,
  plan_id text not null references development_plans (id) on delete cascade,
  status text not null,
  note text not null default '',
  actor_user_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id text primary key,
  user_id text,
  employee_id text,
  title text not null,
  body text not null default '',
  href text not null default '/',
  kind text not null default 'info',
  read_at timestamptz,
  dedupe_key text,
  created_at timestamptz not null default now()
);

create unique index if not exists notifications_dedupe_idx on notifications (dedupe_key);

create table if not exists audit_logs (
  id text primary key,
  actor_user_id text not null,
  action text not null,
  entity_type text not null,
  entity_id text not null default '',
  reason text not null default '',
  before_json jsonb,
  after_json jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_idx on audit_logs (created_at desc);

create table if not exists app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
