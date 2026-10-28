import { o as __toESM } from "../_runtime.mjs";
import { t as ASSIGNMENT_STATUS_LABEL } from "./labels-b_RKwhV6.mjs";
import { a as require_jsx_runtime, i as require_react, r as useQueryClient, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { a as Field, d as inputClass, i as Empty, n as Button, r as Card, s as PageTitle, t as Badge, u as errorText } from "./kit-sHNvXyVM.mjs";
import { B as saveSupervisorFn, Y as verifyAssignmentFn, a as correctScoreFn, d as getAssignmentFn, g as listAssignmentsFn, j as returnAssignmentFn, k as publishAssignmentFn, l as finalizeAssignmentFn, n as addEvidenceFn, o as decideNaFn, t as addClarificationFn, u as gapFn, z as saveSelfFn } from "./server-qyauYh16.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/assess-pages-CqQp39b4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var scopeOf = {
	self: "self",
	assessor: "assessor",
	verify: "verify",
	result: "results"
};
function AssessPage({ mode }) {
	const titles = {
		self: "Evaluasi diri",
		assessor: "Penilaian atasan",
		verify: "Verifikasi kepala unit",
		result: "Hasil penilaian"
	};
	const rows = useQuery({
		queryKey: ["assignments", mode],
		queryFn: () => listAssignmentsFn({ data: scopeOf[mode] })
	}).data ?? [];
	const [id, setId] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!id && rows[0]?.id) setId(String(rows[0].id));
	}, [rows, id]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, {
		eyebrow: "Alur penilaian",
		title: titles[mode]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[300px_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "max-h-[70vh] overflow-auto",
			children: rows.length ? rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				className: `mb-2 w-full rounded-2xl px-3 py-3 text-left ${id === row.id ? "bg-forest text-cream" : "bg-cream"}`,
				onClick: () => setId(String(row.id)),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: String(row.employee_name)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: `text-xs ${id === row.id ? "text-gold-soft" : "text-muted"}`,
						children: [
							String(row.unit_name),
							" · ",
							ASSIGNMENT_STATUS_LABEL[String(row.status)] ?? String(row.status)
						]
					}),
					row.is_demo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs",
						children: "Data demo"
					}) : null
				]
			}, String(row.id))) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "Tidak ada penilaian pada kewenangan Anda." })
		}), id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Detail, {
			id,
			mode
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "Pilih penilaian." })]
	})] });
}
function Detail({ id, mode }) {
	const client = useQueryClient();
	const detail = useQuery({
		queryKey: ["assignment", id],
		queryFn: () => getAssignmentFn({ data: id })
	});
	const gap = useQuery({
		queryKey: ["gap", id],
		queryFn: () => gapFn({ data: id }),
		enabled: mode === "result"
	});
	const data = detail.data;
	const indicators = data?.indicators ?? [];
	const permissions = data?.permissions ?? {};
	const head = data?.head ?? {};
	const self = data?.self ?? {};
	const supervisor = data?.supervisor ?? {};
	const [reflection, setReflection] = (0, import_react.useState)({
		achievements: "",
		completedTasks: "",
		obstacles: "",
		competencies: "",
		trainingNeeds: "",
		nextTargets: ""
	});
	const [feedback, setFeedback] = (0, import_react.useState)({
		overall: "",
		strengths: "",
		improvements: ""
	});
	const [scores, setScores] = (0, import_react.useState)({});
	const [note, setNote] = (0, import_react.useState)("");
	const [reason, setReason] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!data) return;
		setReflection({
			achievements: self.achievements ?? "",
			completedTasks: self.completed_tasks ?? "",
			obstacles: self.obstacles ?? "",
			competencies: self.competencies_to_improve ?? "",
			trainingNeeds: self.training_needs ?? "",
			nextTargets: self.next_targets ?? ""
		});
		setFeedback({
			overall: supervisor.overall_feedback ?? "",
			strengths: supervisor.strengths ?? "",
			improvements: supervisor.improvements ?? ""
		});
		const source = mode === "self" ? data.selfScores : data.supervisorScores;
		const next = {};
		for (const indicator of indicators) {
			const found = source.find((row) => row.indicator_id === indicator.id);
			next[String(indicator.id)] = {
				score: found?.score == null ? "" : String(found.score),
				isNa: Boolean(found?.is_na),
				naReason: String(found?.na_reason ?? ""),
				note: String(found?.note ?? ""),
				evidenceNote: String(found?.evidence_note ?? ""),
				recommendation: String(found?.recommendation ?? "")
			};
		}
		setScores(next);
	}, [data, mode]);
	const grouped = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const indicator of indicators) {
			const key = String(indicator.category_name);
			map.set(key, [...map.get(key) ?? [], indicator]);
		}
		return [...map.entries()];
	}, [indicators]);
	if (detail.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-muted",
		children: "Memuat formulir…"
	});
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-danger",
		children: "Formulir gagal dimuat."
	});
	const official = data.official;
	function payloadScores() {
		return indicators.map((indicator) => {
			const draft = scores[String(indicator.id)] ?? {
				score: "",
				isNa: false,
				naReason: "",
				note: "",
				evidenceNote: "",
				recommendation: ""
			};
			return {
				indicatorId: String(indicator.id),
				...draft,
				score: draft.score ? Number(draft.score) : null
			};
		});
	}
	function refresh() {
		client.invalidateQueries({ queryKey: ["assignment", id] });
		client.invalidateQueries({ queryKey: ["assignments"] });
		client.invalidateQueries({ queryKey: ["dashboard"] });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-3xl text-forest",
							children: String(head.employee_name)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								String(head.position_name),
								" · ",
								String(head.unit_name),
								" · ",
								String(head.period_name)
							]
						}),
						head.is_demo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "gold",
							children: "Pegawai demo"
						}) : null
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: ASSIGNMENT_STATUS_LABEL[String(head.status)] ?? String(head.status) })]
				}),
				head.hold_reason ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-danger",
					children: String(head.hold_reason)
				}) : null,
				official ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-sm",
					children: [
						"Nilai dihitung di server: ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: official.finalScore ?? "belum lengkap" }),
						" ",
						official.label ? `· ${official.label}` : ""
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: "Skor atasan ditampilkan setelah hasil dipublikasikan."
				}),
				official?.warnings?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 text-sm text-muted",
					children: official.warnings.map((warning) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: warning }, warning))
				}) : null
			] }),
			mode === "self" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "grid gap-3 md:grid-cols-2",
				children: [
					["achievements", "Pencapaian utama"],
					["completedTasks", "Tugas yang berhasil diselesaikan"],
					["obstacles", "Kendala"],
					["competencies", "Kompetensi yang perlu ditingkatkan"],
					["trainingNeeds", "Kebutuhan pelatihan"],
					["nextTargets", "Target semester berikutnya"]
				].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						className: inputClass,
						rows: 3,
						value: reflection[key],
						onChange: (e) => setReflection({
							...reflection,
							[key]: e.target.value
						})
					})
				}, key))
			}) : null,
			mode !== "self" && mode !== "result" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Umpan balik umum",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							className: inputClass,
							rows: 3,
							value: feedback.overall,
							onChange: (e) => setFeedback({
								...feedback,
								overall: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Kekuatan",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							className: inputClass,
							rows: 2,
							value: feedback.strengths,
							onChange: (e) => setFeedback({
								...feedback,
								strengths: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Aspek yang perlu diperbaiki",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							className: inputClass,
							rows: 2,
							value: feedback.improvements,
							onChange: (e) => setFeedback({
								...feedback,
								improvements: e.target.value
							})
						})
					})
				]
			}) : null,
			grouped.map(([category, items]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-xl text-forest",
				children: category
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 space-y-4",
				children: items.map((indicator) => {
					const key = String(indicator.id);
					const draft = scores[key] ?? {
						score: "",
						isNa: false,
						naReason: "",
						note: "",
						evidenceNote: "",
						recommendation: ""
					};
					const sup = (data.supervisorScores ?? []).find((row) => row.indicator_id === key);
					const editable = mode === "self" && permissions.fillSelf || mode === "assessor" && permissions.fillAssessor;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl bg-cream p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold",
								children: String(indicator.name)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted",
								children: [
									"1 ",
									String(indicator.rubric_1),
									" · 3 ",
									String(indicator.rubric_3),
									" · 5 ",
									String(indicator.rubric_5)
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex flex-wrap items-center gap-2",
								children: [
									[
										1,
										2,
										3,
										4,
										5
									].map((score) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: !editable || draft.isNa,
										className: `grid h-11 w-11 place-items-center rounded-full border ${draft.score === String(score) ? "border-forest bg-forest text-cream" : "border-line bg-paper"}`,
										onClick: () => setScores((prev) => ({
											...prev,
											[key]: {
												...prev[key] ?? draft,
												score: String(score),
												isNa: false
											}
										})),
										children: score
									}, score)),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex items-center gap-2 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											disabled: !editable,
											checked: draft.isNa,
											onChange: (e) => setScores({
												...scores,
												[key]: {
													...draft,
													isNa: e.target.checked,
													score: ""
												}
											})
										}), " Tidak berlaku"]
									}),
									sup?.na_status && sup.na_status !== "none" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: sup.na_status === "approved" ? "forest" : sup.na_status === "rejected" ? "danger" : "gold",
										children: String(sup.na_status)
									}) : null
								]
							}),
							draft.isNa ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: `${inputClass} mt-2`,
								placeholder: "Alasan tidak berlaku",
								value: draft.naReason,
								disabled: !editable,
								onChange: (e) => setScores({
									...scores,
									[key]: {
										...draft,
										naReason: e.target.value
									}
								})
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								className: `${inputClass} mt-2`,
								rows: 2,
								placeholder: "Catatan",
								disabled: !editable && !permissions.correct,
								value: draft.note,
								onChange: (e) => setScores({
									...scores,
									[key]: {
										...draft,
										note: e.target.value
									}
								})
							}),
							mode !== "self" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								className: `${inputClass} mt-2`,
								rows: 2,
								placeholder: "Bukti dan rekomendasi perbaikan",
								disabled: !editable,
								value: `${draft.evidenceNote}${draft.recommendation ? `\n${draft.recommendation}` : ""}`,
								onChange: (e) => setScores({
									...scores,
									[key]: {
										...draft,
										evidenceNote: e.target.value,
										recommendation: ""
									}
								})
							}) : null,
							permissions.verify && sup?.is_na && sup.na_status === "pending" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "line",
									onClick: () => {
										const why = window.prompt("Alasan persetujuan N/A") ?? "";
										if (why.trim()) decideNaFn({ data: {
											assignmentId: id,
											indicatorId: key,
											approve: true,
											reason: why
										} }).then(refresh).catch((error) => toast.error(errorText(error)));
									},
									children: "Setujui N/A"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									onClick: () => {
										const why = window.prompt("Alasan penolakan N/A") ?? "";
										if (why.trim()) decideNaFn({ data: {
											assignmentId: id,
											indicatorId: key,
											approve: false,
											reason: why
										} }).then(refresh).catch((error) => toast.error(errorText(error)));
									},
									children: "Tolak N/A"
								})]
							}) : null,
							permissions.correct ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-2",
								variant: "ghost",
								onClick: () => {
									const why = window.prompt("Alasan koreksi administratif") ?? "";
									if (!why.trim()) return;
									correctScoreFn({ data: {
										assignmentId: id,
										indicatorId: key,
										score: draft.score ? Number(draft.score) : null,
										isNa: draft.isNa,
										naReason: draft.naReason,
										reason: why
									} }).then(() => {
										toast.success("Koreksi tercatat di audit.");
										refresh();
									}).catch((error) => toast.error(errorText(error)));
								},
								children: "Koreksi tercatat"
							}) : null
						]
					}, key);
				})
			})] }, category)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "flex flex-wrap gap-2",
				children: [
					permissions.fillSelf ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "line",
						onClick: () => void saveSelfFn({ data: {
							assignmentId: id,
							submit: false,
							reflection,
							scores: payloadScores()
						} }).then(() => {
							toast.success("Draf evaluasi diri disimpan.");
							refresh();
						}).catch((error) => toast.error(errorText(error))),
						children: "Simpan draf"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => {
							if (!window.confirm("Kirim evaluasi diri? Setelah dikirim, isian dikunci.")) return;
							saveSelfFn({ data: {
								assignmentId: id,
								submit: true,
								reflection,
								scores: payloadScores()
							} }).then(() => {
								toast.success("Evaluasi diri terkirim.");
								refresh();
							}).catch((error) => toast.error(errorText(error)));
						},
						children: "Kirim evaluasi diri"
					})] }) : null,
					permissions.fillAssessor ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "line",
						onClick: () => void saveSupervisorFn({ data: {
							assignmentId: id,
							submit: false,
							feedback,
							scores: payloadScores()
						} }).then(() => {
							toast.success("Draf penilaian disimpan.");
							refresh();
						}).catch((error) => toast.error(errorText(error))),
						children: "Simpan draf"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => {
							if (!window.confirm("Kirim penilaian untuk diverifikasi?")) return;
							saveSupervisorFn({ data: {
								assignmentId: id,
								submit: true,
								feedback,
								scores: payloadScores()
							} }).then(() => {
								toast.success("Penilaian dikirim.");
								refresh();
							}).catch((error) => toast.error(errorText(error)));
						},
						children: "Kirim untuk verifikasi"
					})] }) : null,
					permissions.verify ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: inputClass,
							placeholder: "Catatan verifikasi",
							value: note,
							onChange: (e) => setNote(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => {
								if (!window.confirm("Setujui dan kunci nilai hasil verifikasi?")) return;
								verifyAssignmentFn({ data: {
									assignmentId: id,
									note
								} }).then(() => {
									toast.success("Penilaian terverifikasi.");
									refresh();
								}).catch((error) => toast.error(errorText(error)));
							},
							children: "Setujui"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: inputClass,
							placeholder: "Alasan pengembalian",
							value: reason,
							onChange: (e) => setReason(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "danger",
							onClick: () => void returnAssignmentFn({ data: {
								assignmentId: id,
								reason
							} }).then(() => {
								toast.success("Penilaian dikembalikan.");
								refresh();
							}).catch((error) => toast.error(errorText(error))),
							children: "Kembalikan"
						})
					] }) : null,
					permissions.finalize ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => {
							if (!window.confirm("Finalisasi hasil ini?")) return;
							finalizeAssignmentFn({ data: id }).then(() => {
								toast.success("Hasil difinalisasi.");
								refresh();
							}).catch((error) => toast.error(errorText(error)));
						},
						children: "Finalisasi"
					}) : null,
					permissions.publish ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "gold",
						onClick: () => {
							if (!window.confirm("Publikasikan hasil kepada pegawai?")) return;
							publishAssignmentFn({ data: id }).then(() => {
								toast.success("Hasil dipublikasikan.");
								refresh();
							}).catch((error) => toast.error(errorText(error)));
						},
						children: "Publikasikan"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvidenceBox, {
						id,
						kind: mode === "self" ? "diri" : "penilai",
						onDone: refresh
					})
				]
			}),
			mode === "result" && gap.data && !gap.data.hidden ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-2xl text-forest",
					children: "Kesenjangan persepsi"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [
						"Selisih skor adalah bahan diskusi, bukan dasar hukuman. Kekuatan: ",
						(gap.data.strong ?? []).join(", ") || "—",
						". Perlu peningkatan: ",
						(gap.data.weak ?? []).join(", ") || "—",
						"."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[640px] text-left text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Indikator" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Diri" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Atasan" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Selisih" })
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: gap.data.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-sand",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-2",
									children: row.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.selfScore ?? "—" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.supervisorScore ?? "—" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.gap ?? "—" })
							]
						}, row.indicatorId)) })]
					})
				}),
				String(head.status) === "dipublikasikan" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clarification, {
					id,
					onDone: refresh
				}) : null
			] }) : null
		]
	});
}
function EvidenceBox({ id, kind, onDone }) {
	const [title, setTitle] = (0, import_react.useState)("");
	const [body, setBody] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "flex w-full flex-wrap gap-2",
		onSubmit: (event) => {
			event.preventDefault();
			addEvidenceFn({ data: {
				assignmentId: id,
				indicatorId: null,
				kind,
				title,
				body
			} }).then(() => {
				toast.success("Bukti ditambahkan.");
				setTitle("");
				setBody("");
				onDone();
			}).catch((error) => toast.error(errorText(error)));
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: inputClass,
				placeholder: "Judul bukti",
				value: title,
				onChange: (e) => setTitle(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: inputClass,
				placeholder: "Uraian bukti",
				value: body,
				onChange: (e) => setBody(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				variant: "line",
				children: "Tambah bukti"
			})
		]
	});
}
function Clarification({ id, onDone }) {
	const [body, setBody] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "mt-3 flex gap-2",
		onSubmit: (event) => {
			event.preventDefault();
			addClarificationFn({ data: {
				assignmentId: id,
				body
			} }).then(() => {
				toast.success("Klarifikasi tersimpan.");
				setBody("");
				onDone();
			}).catch((error) => toast.error(errorText(error)));
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			className: inputClass,
			placeholder: "Tanggapan atau klarifikasi",
			value: body,
			onChange: (e) => setBody(e.target.value)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "submit",
			variant: "line",
			children: "Kirim"
		})]
	});
}
//#endregion
export { AssessPage as t };
