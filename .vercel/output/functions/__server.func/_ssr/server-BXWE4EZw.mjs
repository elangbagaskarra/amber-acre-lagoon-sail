import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-vmgUxBAj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-BXWE4EZw.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
async function core() {
	return import("./workflow-core-Df05Ue6E.mjs");
}
async function assess() {
	return import("./workflow-assess-DxLnSRG5.mjs");
}
async function report() {
	return import("./workflow-report-DLJ-XB1C.mjs");
}
var getSession_createServerFn_handler = createServerRpc({
	id: "ce5fee398de94a64be65f54f1b26449e036289b561b93f80cc6f68c301e83d72",
	name: "getSession",
	filename: "src/lib/ypit/server.ts"
}, (opts) => getSession.__executeServer(opts));
var getSession = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getSession_createServerFn_handler, async ({ context }) => {
	const { syncReminders } = await assess();
	return syncReminders(context.userId);
});
var setSimulationFn_createServerFn_handler = createServerRpc({
	id: "a10531ad34f94a5f0e435c5ef57831a61217bb1a42295b8fc3918971c864943b",
	name: "setSimulationFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => setSimulationFn.__executeServer(opts));
var setSimulationFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((employeeId) => employeeId).handler(setSimulationFn_createServerFn_handler, async ({ context, data }) => (await core()).setSimulation(context.userId, data));
var listUnitsFn_createServerFn_handler = createServerRpc({
	id: "e2f30fa2d1b4067fdf94ac5bf4b4e25f27488059f57968372d247ae341889127",
	name: "listUnitsFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => listUnitsFn.__executeServer(opts));
var listUnitsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listUnitsFn_createServerFn_handler, async () => await (await core()).listUnits());
var saveUnitFn_createServerFn_handler = createServerRpc({
	id: "824befed8b384b8fd4f801e976ed5cdaa8beeff0d076ba391a3b8f0f88393f2e",
	name: "saveUnitFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => saveUnitFn.__executeServer(opts));
var saveUnitFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(saveUnitFn_createServerFn_handler, async ({ context, data }) => (await core()).saveUnit(context.userId, data));
var setUnitActiveFn_createServerFn_handler = createServerRpc({
	id: "9b3058d5e6a0b248519c7d764b510f8da139a273e563547b7da8ad956d1bf2cf",
	name: "setUnitActiveFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => setUnitActiveFn.__executeServer(opts));
var setUnitActiveFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(setUnitActiveFn_createServerFn_handler, async ({ context, data }) => (await core()).setUnitActive(context.userId, data.id, data.active));
var listPositionsFn_createServerFn_handler = createServerRpc({
	id: "e30d020c13a57cf91ab131e45f43ac2aedf1505949e7e7cc4d2bc8c98a990471",
	name: "listPositionsFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => listPositionsFn.__executeServer(opts));
var listPositionsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listPositionsFn_createServerFn_handler, async () => await (await core()).listPositions());
var savePositionFn_createServerFn_handler = createServerRpc({
	id: "a4e5b1a906dba9eedad5988e5eb91ac27e72658e8705d9367c36de2b14615a6a",
	name: "savePositionFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => savePositionFn.__executeServer(opts));
var savePositionFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(savePositionFn_createServerFn_handler, async ({ context, data }) => (await core()).savePosition(context.userId, data));
var setPositionActiveFn_createServerFn_handler = createServerRpc({
	id: "fa37b0bd0e5208bf35fd4e0aed0333f6796d350b4801bbc0c409687ef368dff1",
	name: "setPositionActiveFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => setPositionActiveFn.__executeServer(opts));
var setPositionActiveFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(setPositionActiveFn_createServerFn_handler, async ({ context, data }) => (await core()).setPositionActive(context.userId, data.id, data.active));
var listEmployeesFn_createServerFn_handler = createServerRpc({
	id: "53175de1ba11176b7476876cd9e02f2adc6906ab18fed4b7a90bc4a20a753262",
	name: "listEmployeesFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => listEmployeesFn.__executeServer(opts));
var listEmployeesFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((filter) => filter ?? {}).handler(listEmployeesFn_createServerFn_handler, async ({ context, data }) => (await core()).listEmployees(context.userId, data));
var saveEmployeeFn_createServerFn_handler = createServerRpc({
	id: "71bea1eef528370375e70e897f6304d5c64cdfb64029ee00b1d32a277cdb3ebe",
	name: "saveEmployeeFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => saveEmployeeFn.__executeServer(opts));
var saveEmployeeFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(saveEmployeeFn_createServerFn_handler, async ({ context, data }) => (await core()).saveEmployee(context.userId, data));
var setEmployeeActiveFn_createServerFn_handler = createServerRpc({
	id: "182e2c477e4941340eed0149f7e041a0e1b4c84cde8570e6d4b69dd4fff58578",
	name: "setEmployeeActiveFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => setEmployeeActiveFn.__executeServer(opts));
var setEmployeeActiveFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(setEmployeeActiveFn_createServerFn_handler, async ({ context, data }) => (await core()).setEmployeeActive(context.userId, data.id, data.active));
var importEmployeesFn_createServerFn_handler = createServerRpc({
	id: "8dde88af697b4ebc9037bae97f13d09a3e7c3fcacfadc8cf9a55cbc4cb108fbc",
	name: "importEmployeesFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => importEmployeesFn.__executeServer(opts));
var importEmployeesFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(importEmployeesFn_createServerFn_handler, async ({ context, data }) => (await core()).importEmployees(context.userId, data.csv, data.commit));
var listUsersFn_createServerFn_handler = createServerRpc({
	id: "991c47f9e0e6f7152b25517492102023631a42f15696a43d4d555e427fe7b688",
	name: "listUsersFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => listUsersFn.__executeServer(opts));
var listUsersFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listUsersFn_createServerFn_handler, async ({ context }) => (await core()).listUsers(context.userId));
var updateUserAccessFn_createServerFn_handler = createServerRpc({
	id: "04b698747aa7acc095623658b16f8d0aee015acfdbf8d28b8460dbf6d4369037",
	name: "updateUserAccessFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => updateUserAccessFn.__executeServer(opts));
var updateUserAccessFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(updateUserAccessFn_createServerFn_handler, async ({ context, data }) => (await core()).updateUserAccess(context.userId, data));
var listBandsFn_createServerFn_handler = createServerRpc({
	id: "1338f708f5625adfc6c4e267de26e69e7309db04ae92eeaca0da8bb8e216b4f0",
	name: "listBandsFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => listBandsFn.__executeServer(opts));
var listBandsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listBandsFn_createServerFn_handler, async () => await (await core()).listBands());
var saveBandsFn_createServerFn_handler = createServerRpc({
	id: "a0e9fcb47c3b472cdfb0ca33dc400c9676843452e8176c05e5424cfa8ba31a5f",
	name: "saveBandsFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => saveBandsFn.__executeServer(opts));
var saveBandsFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((bands) => bands).handler(saveBandsFn_createServerFn_handler, async ({ context, data }) => (await core()).saveBands(context.userId, data));
var listInstrumentsFn_createServerFn_handler = createServerRpc({
	id: "598a7cf8963fd91c4d0192d09392eaf3e1f51200de5ba89f752bcd049612b8e6",
	name: "listInstrumentsFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => listInstrumentsFn.__executeServer(opts));
var listInstrumentsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listInstrumentsFn_createServerFn_handler, async () => await (await core()).listInstruments());
var saveCategoryWeightFn_createServerFn_handler = createServerRpc({
	id: "adf0eca3a5b59d157793a1621d0f7eaaba3216c0898a0f9d00d9cd9bdf56bd8a",
	name: "saveCategoryWeightFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => saveCategoryWeightFn.__executeServer(opts));
var saveCategoryWeightFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(saveCategoryWeightFn_createServerFn_handler, async ({ context, data }) => (await core()).saveCategoryWeight(context.userId, data.categoryId, data.weight, data.name));
var saveIndicatorFn_createServerFn_handler = createServerRpc({
	id: "da0ab472da44aed12f781614dc74ec9eeeeab72587c19815f6b8a9d8ef6fc7c7",
	name: "saveIndicatorFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => saveIndicatorFn.__executeServer(opts));
var saveIndicatorFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(saveIndicatorFn_createServerFn_handler, async ({ context, data }) => (await core()).saveIndicator(context.userId, data));
var cloneVersionFn_createServerFn_handler = createServerRpc({
	id: "73e699ab147f8c54bead31991c0e3a510f30d6375e982bd40414a4ef05457e66",
	name: "cloneVersionFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => cloneVersionFn.__executeServer(opts));
var cloneVersionFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((versionId) => versionId).handler(cloneVersionFn_createServerFn_handler, async ({ context, data }) => (await core()).cloneVersion(context.userId, data));
var listPeriodsFn_createServerFn_handler = createServerRpc({
	id: "02e7a77e951f8949fab1676e6292e9d31b1844d415c32e715154e5b2fc5236a3",
	name: "listPeriodsFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => listPeriodsFn.__executeServer(opts));
var listPeriodsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listPeriodsFn_createServerFn_handler, async () => await (await core()).listPeriods());
var savePeriodFn_createServerFn_handler = createServerRpc({
	id: "b09197bdde0e5c6e77133534b7ed556b8be6856cc4fd4e616e6f717cc26ecc78",
	name: "savePeriodFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => savePeriodFn.__executeServer(opts));
var savePeriodFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(savePeriodFn_createServerFn_handler, async ({ context, data }) => (await core()).savePeriod(context.userId, data));
var setPeriodStatusFn_createServerFn_handler = createServerRpc({
	id: "ea9c31fd1fd29a3d54ea647b9873c59722b5910fe53e46cbe6442299e19f3e80",
	name: "setPeriodStatusFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => setPeriodStatusFn.__executeServer(opts));
var setPeriodStatusFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(setPeriodStatusFn_createServerFn_handler, async ({ context, data }) => (await core()).setPeriodStatus(context.userId, data.periodId, data.status, data.reason));
var refreshAssignmentsFn_createServerFn_handler = createServerRpc({
	id: "3f7c28d50fd660aed43c09a9ea2b9b37699e2344626d89cb0e772da28f9a5a50",
	name: "refreshAssignmentsFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => refreshAssignmentsFn.__executeServer(opts));
var refreshAssignmentsFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((periodId) => periodId).handler(refreshAssignmentsFn_createServerFn_handler, async ({ context, data }) => {
	const { loadActor, generateAssignments } = await core();
	const actor = await loadActor(context.userId);
	if (actor.profileRole !== "super_admin" || actor.simulating) throw new Error("Hanya Super Administrator.");
	await generateAssignments(data);
	return { ok: true };
});
var orgTreeFn_createServerFn_handler = createServerRpc({
	id: "390c19dcb2f00fd819cd3969bbdaa9c838ad55cb31c7db772f94d4fef1e42708",
	name: "orgTreeFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => orgTreeFn.__executeServer(opts));
var orgTreeFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(orgTreeFn_createServerFn_handler, async () => await (await core()).orgTree());
var getInstitutionFn_createServerFn_handler = createServerRpc({
	id: "29be0bec71e4a50ea3c19ba7973e51bf20dac60966679dcb5fe7e43eab789d2f",
	name: "getInstitutionFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => getInstitutionFn.__executeServer(opts));
var getInstitutionFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getInstitutionFn_createServerFn_handler, async () => await (await core()).getInstitution());
var saveInstitutionFn_createServerFn_handler = createServerRpc({
	id: "6385dd8098b8bfa8f266d54a5e07930e572886ec5da5bdc531279025b6c1a0a4",
	name: "saveInstitutionFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => saveInstitutionFn.__executeServer(opts));
var saveInstitutionFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(saveInstitutionFn_createServerFn_handler, async ({ context, data }) => (await core()).saveInstitution(context.userId, data));
var listAssignmentsFn_createServerFn_handler = createServerRpc({
	id: "b50ddaec1e1eb05afed407ea5e4648a41ec7abe9dcfea21f073e09bb6422bc32",
	name: "listAssignmentsFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => listAssignmentsFn.__executeServer(opts));
var listAssignmentsFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((scope) => scope).handler(listAssignmentsFn_createServerFn_handler, async ({ context, data }) => (await assess()).listAssignments(context.userId, data));
var getAssignmentFn_createServerFn_handler = createServerRpc({
	id: "f5e68f924222496b2ec4de5dc79f2c4070791eef27c6e09de6bb3445913277fe",
	name: "getAssignmentFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => getAssignmentFn.__executeServer(opts));
var getAssignmentFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(getAssignmentFn_createServerFn_handler, async ({ context, data }) => (await assess()).getAssignment(context.userId, data));
var saveSelfFn_createServerFn_handler = createServerRpc({
	id: "d4e713ec8c19abbcd32487f6224ea7574beaf3ccf6c14a419c01e6a33201f032",
	name: "saveSelfFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => saveSelfFn.__executeServer(opts));
var saveSelfFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(saveSelfFn_createServerFn_handler, async ({ context, data }) => (await assess()).saveSelf(context.userId, data));
var saveSupervisorFn_createServerFn_handler = createServerRpc({
	id: "e1611e812f46f2d499a6ff5e091d1db4606e26ad52ba806d883ac0d083582e3d",
	name: "saveSupervisorFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => saveSupervisorFn.__executeServer(opts));
var saveSupervisorFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(saveSupervisorFn_createServerFn_handler, async ({ context, data }) => (await assess()).saveSupervisor(context.userId, data));
var decideNaFn_createServerFn_handler = createServerRpc({
	id: "2202497ca11630b761e9c7e4ec565d097ec0925d79531ee7234840a406c9ad7d",
	name: "decideNaFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => decideNaFn.__executeServer(opts));
var decideNaFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(decideNaFn_createServerFn_handler, async ({ context, data }) => (await assess()).decideNa(context.userId, data.assignmentId, data.indicatorId, data.approve, data.reason));
var verifyAssignmentFn_createServerFn_handler = createServerRpc({
	id: "93e2d63e98797a72d0cf56a3d83524d3ec6febb35f37b3e09ace6a8506215b65",
	name: "verifyAssignmentFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => verifyAssignmentFn.__executeServer(opts));
var verifyAssignmentFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(verifyAssignmentFn_createServerFn_handler, async ({ context, data }) => (await assess()).verifyAssignment(context.userId, data.assignmentId, data.note));
var returnAssignmentFn_createServerFn_handler = createServerRpc({
	id: "35968c639c65dfb3cf64c917929116afcce9b1bb2810f30c0eb08638b067a27f",
	name: "returnAssignmentFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => returnAssignmentFn.__executeServer(opts));
var returnAssignmentFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(returnAssignmentFn_createServerFn_handler, async ({ context, data }) => (await assess()).returnAssignment(context.userId, data.assignmentId, data.reason));
var finalizeAssignmentFn_createServerFn_handler = createServerRpc({
	id: "8c047118be44d6ebd0fca3ef7f66a08c23ddbc34ece914c4630581f13acb2ad3",
	name: "finalizeAssignmentFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => finalizeAssignmentFn.__executeServer(opts));
var finalizeAssignmentFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((assignmentId) => assignmentId).handler(finalizeAssignmentFn_createServerFn_handler, async ({ context, data }) => (await assess()).finalizeAssignment(context.userId, data));
var publishAssignmentFn_createServerFn_handler = createServerRpc({
	id: "55c6600058a01f213bb93fbdbcfcc9c0bc78bcd1dcab3535fae15229f56e07b1",
	name: "publishAssignmentFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => publishAssignmentFn.__executeServer(opts));
var publishAssignmentFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((assignmentId) => assignmentId).handler(publishAssignmentFn_createServerFn_handler, async ({ context, data }) => (await assess()).publishAssignment(context.userId, data));
var correctScoreFn_createServerFn_handler = createServerRpc({
	id: "b9eb537e54f3324f97aaf3f324793e8c1f94b418b441a1e40e00d3d1d1d866dd",
	name: "correctScoreFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => correctScoreFn.__executeServer(opts));
var correctScoreFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(correctScoreFn_createServerFn_handler, async ({ context, data }) => (await assess()).correctScore(context.userId, data));
var addEvidenceFn_createServerFn_handler = createServerRpc({
	id: "171dafe7738a9b6fa04b106dcb0ea575d034c5a642268be448f947c6a0fb329c",
	name: "addEvidenceFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => addEvidenceFn.__executeServer(opts));
var addEvidenceFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(addEvidenceFn_createServerFn_handler, async ({ context, data }) => (await assess()).addEvidence(context.userId, data));
var addClarificationFn_createServerFn_handler = createServerRpc({
	id: "b9a88f4fb0fd5ee8638df04ae88caf17fd9cde1ed4e2e5e58eb78523a5e4db9f",
	name: "addClarificationFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => addClarificationFn.__executeServer(opts));
var addClarificationFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(addClarificationFn_createServerFn_handler, async ({ context, data }) => (await assess()).addClarification(context.userId, data.assignmentId, data.body));
var gapFn_createServerFn_handler = createServerRpc({
	id: "0412bbfb60e63b4b5c520a7f4c9fdbc20b9bb2ae994daf3a28815eb5341491db",
	name: "gapFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => gapFn.__executeServer(opts));
var gapFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((assignmentId) => assignmentId).handler(gapFn_createServerFn_handler, async ({ context, data }) => (await assess()).gapFor(context.userId, data));
var listPlansFn_createServerFn_handler = createServerRpc({
	id: "e5922d1da76f5b356c1da49cc55d3a02f0e418f8b06016e1d7223e681dc3d547",
	name: "listPlansFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => listPlansFn.__executeServer(opts));
var listPlansFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listPlansFn_createServerFn_handler, async ({ context }) => (await assess()).listPlans(context.userId));
var savePlanFn_createServerFn_handler = createServerRpc({
	id: "c2134cc314ca3382e43299adfe5a74117335add0a3a69f7f245334ac31f83ba6",
	name: "savePlanFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => savePlanFn.__executeServer(opts));
var savePlanFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(savePlanFn_createServerFn_handler, async ({ context, data }) => (await assess()).savePlan(context.userId, data));
var listNotificationsFn_createServerFn_handler = createServerRpc({
	id: "7ae68074f3f71163efb21f9ed23b7bc9e042a047d801144d5a4bdb57bd9280f8",
	name: "listNotificationsFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => listNotificationsFn.__executeServer(opts));
var listNotificationsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listNotificationsFn_createServerFn_handler, async ({ context }) => (await assess()).listNotifications(context.userId));
var markNotificationFn_createServerFn_handler = createServerRpc({
	id: "f770e89d299414b3eeaf47e881ebfce43c83b934bb518a33a65b573fe7d2f42c",
	name: "markNotificationFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => markNotificationFn.__executeServer(opts));
var markNotificationFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(markNotificationFn_createServerFn_handler, async ({ context, data }) => (await assess()).markNotification(context.userId, data));
var listAuditFn_createServerFn_handler = createServerRpc({
	id: "edf273947e09555d2ee47f5ee3c981658e8a81d35597954ae52543907ef50119",
	name: "listAuditFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => listAuditFn.__executeServer(opts));
var listAuditFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listAuditFn_createServerFn_handler, async ({ context }) => (await assess()).listAudit(context.userId));
var getDashboardFn_createServerFn_handler = createServerRpc({
	id: "d4cf1d12bb20fc2f9cee5ae3616842f941c7279e08d1f51437b81f7f8cc4990a",
	name: "getDashboardFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => getDashboardFn.__executeServer(opts));
var getDashboardFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getDashboardFn_createServerFn_handler, async ({ context }) => (await report()).getDashboard(context.userId));
var buildReportFn_createServerFn_handler = createServerRpc({
	id: "277385a11b100544a3d9d92b95148952e54b8987b399a3b0d3f32586838623b4",
	name: "buildReportFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => buildReportFn.__executeServer(opts));
var buildReportFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(buildReportFn_createServerFn_handler, async ({ context, data }) => (await report()).buildReport(context.userId, data));
var exportReportFn_createServerFn_handler = createServerRpc({
	id: "902c4cd743901ed89708f9b9a2cfd548fc77f51971be2cb44c61bd5d22668b09",
	name: "exportReportFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => exportReportFn.__executeServer(opts));
var exportReportFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(exportReportFn_createServerFn_handler, async ({ context, data }) => {
	const { format, ...rest } = data;
	return (await report()).exportReport(context.userId, rest, format);
});
var exportBackupFn_createServerFn_handler = createServerRpc({
	id: "4f18ba09a66675b4b313646da5681f8a41e76bc9d953aa4a37e7f9cf97ccddcc",
	name: "exportBackupFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => exportBackupFn.__executeServer(opts));
var exportBackupFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(exportBackupFn_createServerFn_handler, async ({ context }) => (await report()).exportBackup(context.userId));
var scoreTestFn_createServerFn_handler = createServerRpc({
	id: "5853b58bb4cddb51e1f74a9fa2bc4b2d7906d76bada3268b7f78f09204499e25",
	name: "scoreTestFn",
	filename: "src/lib/ypit/server.ts"
}, (opts) => scoreTestFn.__executeServer(opts));
var scoreTestFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(scoreTestFn_createServerFn_handler, async () => await (await report()).runScoreSelfTest());
//#endregion
export { addClarificationFn_createServerFn_handler, addEvidenceFn_createServerFn_handler, buildReportFn_createServerFn_handler, cloneVersionFn_createServerFn_handler, correctScoreFn_createServerFn_handler, decideNaFn_createServerFn_handler, exportBackupFn_createServerFn_handler, exportReportFn_createServerFn_handler, finalizeAssignmentFn_createServerFn_handler, gapFn_createServerFn_handler, getAssignmentFn_createServerFn_handler, getDashboardFn_createServerFn_handler, getInstitutionFn_createServerFn_handler, getSession_createServerFn_handler, importEmployeesFn_createServerFn_handler, listAssignmentsFn_createServerFn_handler, listAuditFn_createServerFn_handler, listBandsFn_createServerFn_handler, listEmployeesFn_createServerFn_handler, listInstrumentsFn_createServerFn_handler, listNotificationsFn_createServerFn_handler, listPeriodsFn_createServerFn_handler, listPlansFn_createServerFn_handler, listPositionsFn_createServerFn_handler, listUnitsFn_createServerFn_handler, listUsersFn_createServerFn_handler, markNotificationFn_createServerFn_handler, orgTreeFn_createServerFn_handler, publishAssignmentFn_createServerFn_handler, refreshAssignmentsFn_createServerFn_handler, returnAssignmentFn_createServerFn_handler, saveBandsFn_createServerFn_handler, saveCategoryWeightFn_createServerFn_handler, saveEmployeeFn_createServerFn_handler, saveIndicatorFn_createServerFn_handler, saveInstitutionFn_createServerFn_handler, savePeriodFn_createServerFn_handler, savePlanFn_createServerFn_handler, savePositionFn_createServerFn_handler, saveSelfFn_createServerFn_handler, saveSupervisorFn_createServerFn_handler, saveUnitFn_createServerFn_handler, scoreTestFn_createServerFn_handler, setEmployeeActiveFn_createServerFn_handler, setPeriodStatusFn_createServerFn_handler, setPositionActiveFn_createServerFn_handler, setSimulationFn_createServerFn_handler, setUnitActiveFn_createServerFn_handler, updateUserAccessFn_createServerFn_handler, verifyAssignmentFn_createServerFn_handler };
