import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import type { Role } from "./labels";
import type { Band } from "./scoring";
import type { Institution } from "./workflow-core";

async function core() {
  return import("./workflow-core");
}
async function assess() {
  return import("./workflow-assess");
}
async function report() {
  return import("./workflow-report");
}

export const getSession = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { syncReminders } = await assess();
    return syncReminders(context.userId) as any;
  });

export const setSimulationFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((employeeId: string | null) => employeeId)
  .handler(async ({ context, data }) => ((await core()).setSimulation(context.userId, data)) as any);

export const listUnitsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => (await (await core()).listUnits()) as any);

export const saveUnitFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: Parameters<Awaited<ReturnType<typeof core>>["saveUnit"]>[1]) => input)
  .handler(async ({ context, data }) => ((await core()).saveUnit(context.userId, data)) as any);

export const setUnitActiveFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; active: boolean }) => input)
  .handler(async ({ context, data }) => ((await core()).setUnitActive(context.userId, data.id, data.active)) as any);

export const listPositionsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => (await (await core()).listPositions()) as any);

export const savePositionFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: Parameters<Awaited<ReturnType<typeof core>>["savePosition"]>[1]) => input)
  .handler(async ({ context, data }) => ((await core()).savePosition(context.userId, data)) as any);

export const setPositionActiveFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; active: boolean }) => input)
  .handler(async ({ context, data }) => ((await core()).setPositionActive(context.userId, data.id, data.active)) as any);

export const listEmployeesFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((filter: { q?: string; unitId?: string; positionId?: string; group?: string; active?: string }) => filter ?? {})
  .handler(async ({ context, data }) => ((await core()).listEmployees(context.userId, data)) as any);

export const saveEmployeeFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: Parameters<Awaited<ReturnType<typeof core>>["saveEmployee"]>[1]) => input)
  .handler(async ({ context, data }) => ((await core()).saveEmployee(context.userId, data)) as any);

export const setEmployeeActiveFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; active: boolean }) => input)
  .handler(async ({ context, data }) => ((await core()).setEmployeeActive(context.userId, data.id, data.active)) as any);

export const importEmployeesFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { csv: string; commit: boolean }) => input)
  .handler(async ({ context, data }) => ((await core()).importEmployees(context.userId, data.csv, data.commit)) as any);

export const listUsersFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => ((await core()).listUsers(context.userId)) as any);

export const updateUserAccessFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { targetUserId: string; role: Role; unitId: string | null; employeeId: string | null; crossUnit: boolean }) => input)
  .handler(async ({ context, data }) => ((await core()).updateUserAccess(context.userId, data)) as any);

export const listBandsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => (await (await core()).listBands()) as any);

export const saveBandsFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((bands: Band[]) => bands)
  .handler(async ({ context, data }) => ((await core()).saveBands(context.userId, data)) as any);

export const listInstrumentsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => (await (await core()).listInstruments()) as any);

export const saveCategoryWeightFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { categoryId: string; weight: number; name: string }) => input)
  .handler(async ({ context, data }) => ((await core()).saveCategoryWeight(context.userId, data.categoryId, data.weight, data.name)) as any);

export const saveIndicatorFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: Parameters<Awaited<ReturnType<typeof core>>["saveIndicator"]>[1]) => input)
  .handler(async ({ context, data }) => ((await core()).saveIndicator(context.userId, data)) as any);

export const cloneVersionFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((versionId: string) => versionId)
  .handler(async ({ context, data }) => ((await core()).cloneVersion(context.userId, data)) as any);

export const listPeriodsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => (await (await core()).listPeriods()) as any);

export const savePeriodFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: Parameters<Awaited<ReturnType<typeof core>>["savePeriod"]>[1]) => input)
  .handler(async ({ context, data }) => ((await core()).savePeriod(context.userId, data)) as any);

export const setPeriodStatusFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { periodId: string; status: string; reason: string }) => input)
  .handler(async ({ context, data }) => ((await core()).setPeriodStatus(context.userId, data.periodId, data.status, data.reason)) as any);

export const refreshAssignmentsFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((periodId: string) => periodId)
  .handler(async ({ context, data }) => {
    const { loadActor, generateAssignments } = await core();
    const actor = await loadActor(context.userId);
    if (actor.profileRole !== "super_admin" || actor.simulating) throw new Error("Hanya Super Administrator.");
    await generateAssignments(data);
    return { ok: true } as any;
  });

export const orgTreeFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => (await (await core()).orgTree()) as any);

export const getInstitutionFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => (await (await core()).getInstitution()) as any);

export const saveInstitutionFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: Institution) => input)
  .handler(async ({ context, data }) => ((await core()).saveInstitution(context.userId, data)) as any);

export const listAssignmentsFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((scope: "self" | "assessor" | "verify" | "results" | "all") => scope)
  .handler(async ({ context, data }) => ((await assess()).listAssignments(context.userId, data)) as any);

export const getAssignmentFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data }) => ((await assess()).getAssignment(context.userId, data)) as any);

export const saveSelfFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: Parameters<Awaited<ReturnType<typeof assess>>["saveSelf"]>[1]) => input)
  .handler(async ({ context, data }) => ((await assess()).saveSelf(context.userId, data)) as any);

export const saveSupervisorFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: Parameters<Awaited<ReturnType<typeof assess>>["saveSupervisor"]>[1]) => input)
  .handler(async ({ context, data }) => ((await assess()).saveSupervisor(context.userId, data)) as any);

export const decideNaFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { assignmentId: string; indicatorId: string; approve: boolean; reason: string }) => input)
  .handler(async ({ context, data }) => ((await assess()).decideNa(context.userId, data.assignmentId, data.indicatorId, data.approve, data.reason)) as any);

export const verifyAssignmentFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { assignmentId: string; note: string }) => input)
  .handler(async ({ context, data }) => ((await assess()).verifyAssignment(context.userId, data.assignmentId, data.note)) as any);

export const returnAssignmentFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { assignmentId: string; reason: string }) => input)
  .handler(async ({ context, data }) => ((await assess()).returnAssignment(context.userId, data.assignmentId, data.reason)) as any);

export const finalizeAssignmentFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((assignmentId: string) => assignmentId)
  .handler(async ({ context, data }) => ((await assess()).finalizeAssignment(context.userId, data)) as any);

export const publishAssignmentFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((assignmentId: string) => assignmentId)
  .handler(async ({ context, data }) => ((await assess()).publishAssignment(context.userId, data)) as any);

export const correctScoreFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: Parameters<Awaited<ReturnType<typeof assess>>["correctScore"]>[1]) => input)
  .handler(async ({ context, data }) => ((await assess()).correctScore(context.userId, data)) as any);

export const addEvidenceFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: Parameters<Awaited<ReturnType<typeof assess>>["addEvidence"]>[1]) => input)
  .handler(async ({ context, data }) => ((await assess()).addEvidence(context.userId, data)) as any);

export const addClarificationFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { assignmentId: string; body: string }) => input)
  .handler(async ({ context, data }) => ((await assess()).addClarification(context.userId, data.assignmentId, data.body)) as any);

export const gapFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((assignmentId: string) => assignmentId)
  .handler(async ({ context, data }) => ((await assess()).gapFor(context.userId, data)) as any);

export const listPlansFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => ((await assess()).listPlans(context.userId)) as any);

export const savePlanFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: Parameters<Awaited<ReturnType<typeof assess>>["savePlan"]>[1]) => input)
  .handler(async ({ context, data }) => ((await assess()).savePlan(context.userId, data)) as any);

export const listNotificationsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => ((await assess()).listNotifications(context.userId)) as any);

export const markNotificationFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string | null) => id)
  .handler(async ({ context, data }) => ((await assess()).markNotification(context.userId, data)) as any);

export const listAuditFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => ((await assess()).listAudit(context.userId)) as any);

export const getDashboardFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => ((await report()).getDashboard(context.userId)) as any);

export const buildReportFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { type: string; periodId?: string; unitId?: string; group?: string; employeeId?: string }) => input)
  .handler(async ({ context, data }) => ((await report()).buildReport(context.userId, data)) as any);

export const exportReportFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { format: "pdf" | "xlsx"; type: string; periodId?: string; unitId?: string; group?: string; employeeId?: string }) => input)
  .handler(async ({ context, data }) => {
    const { format, ...rest } = data;
    return (await report()).exportReport(context.userId, rest, format) as any;
  });

export const exportBackupFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => ((await report()).exportBackup(context.userId)) as any);

export const scoreTestFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => (await (await report()).runScoreSelfTest()) as any);
