import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-vmgUxBAj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-qyauYh16.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getSession = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("ce5fee398de94a64be65f54f1b26449e036289b561b93f80cc6f68c301e83d72"));
var setSimulationFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((employeeId) => employeeId).handler(createSsrRpc("a10531ad34f94a5f0e435c5ef57831a61217bb1a42295b8fc3918971c864943b"));
var listUnitsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("e2f30fa2d1b4067fdf94ac5bf4b4e25f27488059f57968372d247ae341889127"));
var saveUnitFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("824befed8b384b8fd4f801e976ed5cdaa8beeff0d076ba391a3b8f0f88393f2e"));
var setUnitActiveFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("9b3058d5e6a0b248519c7d764b510f8da139a273e563547b7da8ad956d1bf2cf"));
var listPositionsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("e30d020c13a57cf91ab131e45f43ac2aedf1505949e7e7cc4d2bc8c98a990471"));
var savePositionFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("a4e5b1a906dba9eedad5988e5eb91ac27e72658e8705d9367c36de2b14615a6a"));
var setPositionActiveFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("fa37b0bd0e5208bf35fd4e0aed0333f6796d350b4801bbc0c409687ef368dff1"));
var listEmployeesFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((filter) => filter ?? {}).handler(createSsrRpc("53175de1ba11176b7476876cd9e02f2adc6906ab18fed4b7a90bc4a20a753262"));
var saveEmployeeFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("71bea1eef528370375e70e897f6304d5c64cdfb64029ee00b1d32a277cdb3ebe"));
var setEmployeeActiveFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("182e2c477e4941340eed0149f7e041a0e1b4c84cde8570e6d4b69dd4fff58578"));
var importEmployeesFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("8dde88af697b4ebc9037bae97f13d09a3e7c3fcacfadc8cf9a55cbc4cb108fbc"));
var listUsersFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("991c47f9e0e6f7152b25517492102023631a42f15696a43d4d555e427fe7b688"));
var updateUserAccessFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("04b698747aa7acc095623658b16f8d0aee015acfdbf8d28b8460dbf6d4369037"));
var listBandsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("1338f708f5625adfc6c4e267de26e69e7309db04ae92eeaca0da8bb8e216b4f0"));
var saveBandsFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((bands) => bands).handler(createSsrRpc("a0e9fcb47c3b472cdfb0ca33dc400c9676843452e8176c05e5424cfa8ba31a5f"));
var listInstrumentsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("598a7cf8963fd91c4d0192d09392eaf3e1f51200de5ba89f752bcd049612b8e6"));
var saveCategoryWeightFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("adf0eca3a5b59d157793a1621d0f7eaaba3216c0898a0f9d00d9cd9bdf56bd8a"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("da0ab472da44aed12f781614dc74ec9eeeeab72587c19815f6b8a9d8ef6fc7c7"));
var cloneVersionFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((versionId) => versionId).handler(createSsrRpc("73e699ab147f8c54bead31991c0e3a510f30d6375e982bd40414a4ef05457e66"));
var listPeriodsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("02e7a77e951f8949fab1676e6292e9d31b1844d415c32e715154e5b2fc5236a3"));
var savePeriodFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("b09197bdde0e5c6e77133534b7ed556b8be6856cc4fd4e616e6f717cc26ecc78"));
var setPeriodStatusFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("ea9c31fd1fd29a3d54ea647b9873c59722b5910fe53e46cbe6442299e19f3e80"));
var refreshAssignmentsFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((periodId) => periodId).handler(createSsrRpc("3f7c28d50fd660aed43c09a9ea2b9b37699e2344626d89cb0e772da28f9a5a50"));
var orgTreeFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("390c19dcb2f00fd819cd3969bbdaa9c838ad55cb31c7db772f94d4fef1e42708"));
var getInstitutionFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("29be0bec71e4a50ea3c19ba7973e51bf20dac60966679dcb5fe7e43eab789d2f"));
var saveInstitutionFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("6385dd8098b8bfa8f266d54a5e07930e572886ec5da5bdc531279025b6c1a0a4"));
var listAssignmentsFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((scope) => scope).handler(createSsrRpc("b50ddaec1e1eb05afed407ea5e4648a41ec7abe9dcfea21f073e09bb6422bc32"));
var getAssignmentFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(createSsrRpc("f5e68f924222496b2ec4de5dc79f2c4070791eef27c6e09de6bb3445913277fe"));
var saveSelfFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("d4e713ec8c19abbcd32487f6224ea7574beaf3ccf6c14a419c01e6a33201f032"));
var saveSupervisorFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("e1611e812f46f2d499a6ff5e091d1db4606e26ad52ba806d883ac0d083582e3d"));
var decideNaFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("2202497ca11630b761e9c7e4ec565d097ec0925d79531ee7234840a406c9ad7d"));
var verifyAssignmentFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("93e2d63e98797a72d0cf56a3d83524d3ec6febb35f37b3e09ace6a8506215b65"));
var returnAssignmentFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("35968c639c65dfb3cf64c917929116afcce9b1bb2810f30c0eb08638b067a27f"));
var finalizeAssignmentFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((assignmentId) => assignmentId).handler(createSsrRpc("8c047118be44d6ebd0fca3ef7f66a08c23ddbc34ece914c4630581f13acb2ad3"));
var publishAssignmentFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((assignmentId) => assignmentId).handler(createSsrRpc("55c6600058a01f213bb93fbdbcfcc9c0bc78bcd1dcab3535fae15229f56e07b1"));
var correctScoreFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("b9eb537e54f3324f97aaf3f324793e8c1f94b418b441a1e40e00d3d1d1d866dd"));
var addEvidenceFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("171dafe7738a9b6fa04b106dcb0ea575d034c5a642268be448f947c6a0fb329c"));
var addClarificationFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("b9a88f4fb0fd5ee8638df04ae88caf17fd9cde1ed4e2e5e58eb78523a5e4db9f"));
var gapFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((assignmentId) => assignmentId).handler(createSsrRpc("0412bbfb60e63b4b5c520a7f4c9fdbc20b9bb2ae994daf3a28815eb5341491db"));
var listPlansFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("e5922d1da76f5b356c1da49cc55d3a02f0e418f8b06016e1d7223e681dc3d547"));
var savePlanFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("c2134cc314ca3382e43299adfe5a74117335add0a3a69f7f245334ac31f83ba6"));
var listNotificationsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("7ae68074f3f71163efb21f9ed23b7bc9e042a047d801144d5a4bdb57bd9280f8"));
var markNotificationFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(createSsrRpc("f770e89d299414b3eeaf47e881ebfce43c83b934bb518a33a65b573fe7d2f42c"));
var listAuditFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("edf273947e09555d2ee47f5ee3c981658e8a81d35597954ae52543907ef50119"));
var getDashboardFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("d4cf1d12bb20fc2f9cee5ae3616842f941c7279e08d1f51437b81f7f8cc4990a"));
var buildReportFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("277385a11b100544a3d9d92b95148952e54b8987b399a3b0d3f32586838623b4"));
var exportReportFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("902c4cd743901ed89708f9b9a2cfd548fc77f51971be2cb44c61bd5d22668b09"));
var exportBackupFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("4f18ba09a66675b4b313646da5681f8a41e76bc9d953aa4a37e7f9cf97ccddcc"));
var scoreTestFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("5853b58bb4cddb51e1f74a9fa2bc4b2d7906d76bada3268b7f78f09204499e25"));
//#endregion
export { refreshAssignmentsFn as A, saveSupervisorFn as B, listPlansFn as C, markNotificationFn as D, listUsersFn as E, saveInstitutionFn as F, setPositionActiveFn as G, scoreTestFn as H, savePeriodFn as I, updateUserAccessFn as J, setSimulationFn as K, savePlanFn as L, saveBandsFn as M, saveCategoryWeightFn as N, orgTreeFn as O, saveEmployeeFn as P, savePositionFn as R, listPeriodsFn as S, listUnitsFn as T, setEmployeeActiveFn as U, saveUnitFn as V, setPeriodStatusFn as W, verifyAssignmentFn as Y, listAuditFn as _, correctScoreFn as a, listInstrumentsFn as b, exportReportFn as c, getAssignmentFn as d, getDashboardFn as f, listAssignmentsFn as g, importEmployeesFn as h, cloneVersionFn as i, returnAssignmentFn as j, publishAssignmentFn as k, finalizeAssignmentFn as l, getSession as m, addEvidenceFn as n, decideNaFn as o, getInstitutionFn as p, setUnitActiveFn as q, buildReportFn as r, exportBackupFn as s, addClarificationFn as t, gapFn as u, listBandsFn as v, listPositionsFn as w, listNotificationsFn as x, listEmployeesFn as y, saveSelfFn as z };
