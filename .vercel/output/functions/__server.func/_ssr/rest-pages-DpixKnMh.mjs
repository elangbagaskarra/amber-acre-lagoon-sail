import { o as __toESM } from "../_runtime.mjs";
import { a as ROLE_LABEL, i as PLAN_STATUS_LABEL } from "./labels-b_RKwhV6.mjs";
import { a as require_jsx_runtime, i as require_react, r as useQueryClient, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { a as Field, d as inputClass, i as Empty, l as downloadBase64, n as Button, r as Card, s as PageTitle, t as Badge, u as errorText } from "./kit-sHNvXyVM.mjs";
import { C as listPlansFn, D as markNotificationFn, E as listUsersFn, F as saveInstitutionFn, H as scoreTestFn, J as updateUserAccessFn, L as savePlanFn, M as saveBandsFn, S as listPeriodsFn, _ as listAuditFn, c as exportReportFn, p as getInstitutionFn, r as buildReportFn, s as exportBackupFn, v as listBandsFn, x as listNotificationsFn, y as listEmployeesFn } from "./server-qyauYh16.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rest-pages-DpixKnMh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var str = (row, key) => String(row[key] ?? "");
function PengembanganPage() {
	const client = useQueryClient();
	const plans = useQuery({
		queryKey: ["plans"],
		queryFn: () => listPlansFn()
	});
	const people = useQuery({
		queryKey: ["employees", "plans"],
		queryFn: () => listEmployeesFn({ data: { active: "aktif" } })
	});
	const periods = useQuery({
		queryKey: ["periods"],
		queryFn: () => listPeriodsFn()
	});
	const [form, setForm] = (0, import_react.useState)({
		employeeId: "",
		periodId: "",
		aspect: "",
		gapFound: "",
		goal: "",
		activity: "",
		supportNeeded: "",
		ownerName: "",
		dueDate: "",
		successIndicator: "",
		status: "belum_dimulai",
		followUpNote: ""
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, {
		eyebrow: "Tindak lanjut",
		title: "Rencana pengembangan"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 xl:grid-cols-[1fr_340px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3",
			children: [(plans.data ?? []).map((plan) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl text-forest",
						children: str(plan, "aspect")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: PLAN_STATUS_LABEL[str(plan, "status")] ?? str(plan, "status") })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [
						str(plan, "employee_name"),
						" · ",
						str(plan, "unit_name")
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm",
					children: str(plan, "goal")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [
						"Aktivitas: ",
						str(plan, "activity") || "—",
						" · Tenggat ",
						str(plan, "due_date").slice(0, 10) || "—"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: Object.keys(PLAN_STATUS_LABEL).map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => void savePlanFn({ data: {
							id: str(plan, "id"),
							employeeId: str(plan, "employee_id"),
							assignmentId: str(plan, "assignment_id") || null,
							periodId: str(plan, "period_id") || null,
							aspect: str(plan, "aspect"),
							gapFound: str(plan, "gap_found"),
							goal: str(plan, "goal"),
							activity: str(plan, "activity"),
							supportNeeded: str(plan, "support_needed"),
							ownerName: str(plan, "owner_name"),
							dueDate: str(plan, "due_date").slice(0, 10),
							successIndicator: str(plan, "success_indicator"),
							status,
							followUpNote: "Pembaruan status"
						} }).then(() => {
							toast.success("Status diperbarui.");
							client.invalidateQueries({ queryKey: ["plans"] });
						}),
						children: PLAN_STATUS_LABEL[status]
					}, status))
				})
			] }, str(plan, "id"))), !(plans.data ?? []).length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "Belum ada rencana pengembangan." }) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-2xl text-forest",
			children: "Rencana baru"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-3 space-y-2",
			onSubmit: (event) => {
				event.preventDefault();
				savePlanFn({ data: {
					...form,
					assignmentId: null,
					periodId: form.periodId || null
				} }).then(() => {
					toast.success("Rencana disimpan.");
					client.invalidateQueries({ queryKey: ["plans"] });
				}).catch((error) => toast.error(errorText(error)));
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Pegawai",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: inputClass,
						value: form.employeeId,
						onChange: (e) => setForm({
							...form,
							employeeId: e.target.value
						}),
						required: true,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Pilih"
						}), (people.data ?? []).map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: str(person, "id"),
							children: str(person, "full_name")
						}, str(person, "id")))]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Periode",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: inputClass,
						value: form.periodId,
						onChange: (e) => setForm({
							...form,
							periodId: e.target.value
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Tidak diikat"
						}), (periods.data?.periods ?? []).map((period) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: str(period, "id"),
							children: str(period, "name")
						}, str(period, "id")))]
					})
				}),
				[
					["aspect", "Aspek"],
					["gapFound", "Kesenjangan"],
					["goal", "Tujuan"],
					["activity", "Aktivitas"],
					["supportNeeded", "Dukungan"],
					["ownerName", "Penanggung jawab"],
					["successIndicator", "Indikator keberhasilan"],
					["followUpNote", "Catatan"]
				].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: inputClass,
						value: form[key],
						onChange: (e) => setForm({
							...form,
							[key]: e.target.value
						})
					})
				}, key)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Tenggat",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "date",
						className: inputClass,
						value: form.dueDate,
						onChange: (e) => setForm({
							...form,
							dueDate: e.target.value
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Simpan"
				})
			]
		})] })]
	})] });
}
var REPORTS = [
	["individu", "Laporan individual"],
	["rekap_kbtk", "Rekap KB-TK"],
	["rekap_sd", "Rekap SD"],
	["rekap_smptq", "Rekap SMPTQ"],
	["rekap_yayasan", "Rekap yayasan"],
	["kelompok", "Kelompok jabatan"],
	["kategori", "Kategori indikator"],
	["progres", "Progres"],
	["kesenjangan", "Evaluasi diri vs atasan"],
	["kebutuhan", "Kebutuhan pengembangan"],
	["tindak_lanjut", "Tindak lanjut"],
	["tren", "Tren antarsemester"]
];
function LaporanPage() {
	const periods = useQuery({
		queryKey: ["periods"],
		queryFn: () => listPeriodsFn()
	});
	const people = useQuery({
		queryKey: ["employees", "lap"],
		queryFn: () => listEmployeesFn({ data: {} })
	});
	const [type, setType] = (0, import_react.useState)("progres");
	const [periodId, setPeriodId] = (0, import_react.useState)("periode-demo-2026-1");
	const [employeeId, setEmployeeId] = (0, import_react.useState)("");
	const [group, setGroup] = (0, import_react.useState)("");
	const report = useQuery({
		queryKey: [
			"report",
			type,
			periodId,
			employeeId,
			group
		],
		queryFn: () => buildReportFn({ data: {
			type,
			periodId,
			employeeId,
			group
		} })
	});
	async function download(format) {
		try {
			const file = await exportReportFn({ data: {
				format,
				type,
				periodId,
				employeeId,
				group
			} });
			downloadBase64(file.filename, file.base64, file.mime);
		} catch (error) {
			toast.error(errorText(error));
		}
	}
	const table = report.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, {
			eyebrow: "Dokumen",
			title: "Laporan",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "line",
					onClick: () => void download("pdf"),
					children: "Unduh PDF"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => void download("xlsx"),
					children: "Unduh Excel"
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 grid gap-2 md:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					className: inputClass,
					value: type,
					onChange: (e) => setType(e.target.value),
					children: REPORTS.map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: id,
						children: label
					}, id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					className: inputClass,
					value: periodId,
					onChange: (e) => setPeriodId(e.target.value),
					children: (periods.data?.periods ?? []).map((period) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
						value: str(period, "id"),
						children: [str(period, "name"), period.is_demo ? " (contoh)" : ""]
					}, str(period, "id")))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: inputClass,
					value: employeeId,
					onChange: (e) => setEmployeeId(e.target.value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "Semua / tidak dipakai"
					}), (people.data ?? []).map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: str(person, "id"),
						children: str(person, "full_name")
					}, str(person, "id")))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: inputClass,
					value: group,
					onChange: (e) => setGroup(e.target.value),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Semua kelompok"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "guru",
							children: "Guru"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "tendik",
							children: "Tenaga kependidikan"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "pimpinan",
							children: "Pimpinan"
						})
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "overflow-x-auto",
			children: report.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Menyusun laporan…" }) : report.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-danger",
				children: errorText(report.error)
			}) : table ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl text-forest",
					children: table.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-sm text-muted",
					children: table.subtitle
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[640px] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: table.columns.map((column) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "py-2",
						children: column.label
					}, column.key)) }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: table.rows.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
						className: "border-t border-sand",
						children: table.columns.map((column) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-2 pr-3",
							children: String(row[column.key] ?? "")
						}, column.key))
					}, index)) })]
				}),
				!table.rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "Tidak ada data pada filter ini." }) : null
			] }) : null
		})
	] });
}
function NotifikasiPage() {
	const client = useQueryClient();
	const notes = useQuery({
		queryKey: ["notifications"],
		queryFn: () => listNotificationsFn()
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, {
		eyebrow: "Pengingat",
		title: "Notifikasi",
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "line",
			onClick: () => void markNotificationFn({ data: null }).then(() => client.invalidateQueries({ queryKey: ["notifications"] })),
			children: "Tandai dibaca"
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [(notes.data ?? []).map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
			href: str(note, "href") || "/",
			className: "block rounded-2xl border border-line bg-paper px-4 py-3",
			onClick: () => void markNotificationFn({ data: str(note, "id") }),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold",
					children: str(note, "title")
				}), note.read_at ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "gold",
					children: "Baru"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: str(note, "body")
			})]
		}, str(note, "id"))), !(notes.data ?? []).length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "Belum ada notifikasi." }) : null]
	})] });
}
function AuditPage() {
	const logs = useQuery({
		queryKey: ["audit"],
		queryFn: () => listAuditFn()
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, {
		eyebrow: "Keamanan",
		title: "Audit log"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "overflow-x-auto",
		children: logs.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-danger",
			children: errorText(logs.error)
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[720px] text-left text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "py-2",
					children: "Waktu"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Aksi" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Objek" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Alasan" })
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: (logs.data ?? []).map((log) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t border-sand",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2",
						children: str(log, "created_at").replace("T", " ").slice(0, 19)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: str(log, "action") }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
						str(log, "entity_type"),
						" ",
						str(log, "entity_id")
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: str(log, "reason") })
				]
			}, str(log, "id"))) })]
		})
	})] });
}
function PengaturanPage() {
	const client = useQueryClient();
	const settings = useQuery({
		queryKey: ["settings"],
		queryFn: () => getInstitutionFn()
	});
	const users = useQuery({
		queryKey: ["users"],
		queryFn: () => listUsersFn()
	});
	const bands = useQuery({
		queryKey: ["bands"],
		queryFn: () => listBandsFn()
	});
	const units = useQuery({
		queryKey: ["employees", "users"],
		queryFn: () => listEmployeesFn({ data: {} })
	}).data ?? [];
	const [form, setForm] = (0, import_react.useState)(null);
	const current = form ?? settings.data;
	const tests = useQuery({
		queryKey: ["score-test"],
		queryFn: () => scoreTestFn()
	});
	if (!current) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-muted",
		children: "Memuat pengaturan…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, {
				eyebrow: "Administrator",
				title: "Pengaturan"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl text-forest",
					children: "Identitas lembaga"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-sm text-muted",
					children: "Nama pimpinan, alamat, dan logo tidak diisi otomatis. Lengkapi di sini. Logo resmi hanya dipakai jika Anda mengunggahnya."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "grid gap-3 md:grid-cols-2",
					onSubmit: (event) => {
						event.preventDefault();
						saveInstitutionFn({ data: current }).then(() => {
							toast.success("Pengaturan disimpan.");
							client.invalidateQueries({ queryKey: ["settings"] });
						}).catch((error) => toast.error(errorText(error)));
					},
					children: [
						[
							["foundation_name", "Nama yayasan"],
							["short_name", "Singkatan"],
							["app_name", "Nama aplikasi"],
							["head_title", "Jabatan pimpinan"],
							["head_name", "Nama pimpinan"],
							["address", "Alamat"],
							["phone", "Telepon"],
							["email", "Surel"]
						].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: inputClass,
								value: current[key] ?? "",
								onChange: (e) => setForm({
									...current,
									[key]: e.target.value
								})
							})
						}, key)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Logo",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: inputClass,
								type: "file",
								accept: "image/*",
								onChange: (event) => {
									const file = event.target.files?.[0];
									if (!file) return;
									const reader = new FileReader();
									reader.onload = () => setForm({
										...current,
										logo_data_url: String(reader.result ?? "")
									});
									reader.readAsDataURL(file);
								}
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "md:col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "Simpan identitas"
							})
						})
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "overflow-x-auto",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl text-forest",
						children: "Akun dan peran"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "mt-3 w-full min-w-[720px] text-left text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Nama" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Peran" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Pegawai terhubung" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Lintas unit" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: (users.data ?? []).map((user) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRow, {
							user,
							people: units,
							onSaved: () => void client.invalidateQueries({ queryKey: ["users"] })
						}, str(user, "user_id"))) })]
					}),
					users.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-danger",
						children: errorText(users.error)
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl text-forest",
					children: "Batas kategori hasil"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "my-2 text-sm",
					children: (bands.data ?? []).map((band) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						band.min,
						"–",
						band.max,
						": ",
						band.label
					] }, band.label))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "line",
					onClick: () => void saveBandsFn({ data: bands.data ?? [] }).then(() => toast.success("Batas tetap tersimpan.")).catch((error) => toast.error(errorText(error))),
					children: "Kunci ulang batas saat ini"
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl text-forest",
					children: "Uji hitung"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 space-y-1 text-sm",
					children: (tests.data ?? []).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						item.pass ? "Lulus" : "Gagal",
						" · ",
						item.name,
						": diharapkan ",
						item.expected,
						", sistem ",
						item.actual,
						" (",
						item.label,
						")"
					] }, item.name))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-3",
					variant: "line",
					onClick: () => void exportBackupFn().then((file) => downloadBase64(file.filename, file.base64, file.mime)).catch((error) => toast.error(errorText(error))),
					children: "Unduh cadangan data"
				})
			] })
		]
	});
}
function UserRow({ user, people, onSaved }) {
	const [role, setRole] = (0, import_react.useState)(str(user, "role"));
	const [employeeId, setEmployeeId] = (0, import_react.useState)(str(user, "employee_id"));
	const [crossUnit, setCrossUnit] = (0, import_react.useState)(Boolean(user.cross_unit));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
		className: "border-t border-sand",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
				className: "py-2",
				children: [str(user, "full_name"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-muted",
					children: str(user, "email")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				className: inputClass,
				value: role,
				onChange: (e) => setRole(e.target.value),
				children: Object.keys(ROLE_LABEL).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: item,
					children: ROLE_LABEL[item]
				}, item))
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
				className: inputClass,
				value: employeeId,
				onChange: (e) => setEmployeeId(e.target.value),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "",
					children: "Belum dihubungkan"
				}), people.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: str(person, "id"),
					children: str(person, "full_name")
				}, str(person, "id")))]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "checkbox",
				checked: crossUnit,
				onChange: (e) => setCrossUnit(e.target.checked)
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				onClick: () => void updateUserAccessFn({ data: {
					targetUserId: str(user, "user_id"),
					role,
					unitId: null,
					employeeId: employeeId || null,
					crossUnit
				} }).then(() => {
					toast.success("Akses diperbarui.");
					onSaved();
				}).catch((error) => toast.error(errorText(error))),
				children: "Simpan"
			}) })
		]
	});
}
function PanduanPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, {
				eyebrow: "Dokumentasi",
				title: "Panduan penggunaan"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl text-forest",
				children: "Cara mulai"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
				className: "mt-2 list-decimal space-y-1 pl-5 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Daftar dengan surel. Akun pertama menjadi Super Administrator." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Lengkapi identitas yayasan di Pengaturan. Nama pimpinan sengaja dikosongkan." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Periksa tiga unit: KB-TK, SD, dan SMPTQ Islam Pangeran Diponegoro." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Data bertanda Demo bukan pegawai sungguhan. Gunakan untuk mencoba alur, lalu isi data nyata." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Super Administrator dapat masuk mode simulasi untuk melihat layar tiap peran. Tindakan tetap tercatat." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Untuk peran sungguhan, minta pengguna mendaftar lalu hubungkan akunnya ke data pegawai." })
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl text-forest",
				children: "Alur persetujuan"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
				className: "mt-2 list-decimal space-y-1 pl-5 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Administrator menyiapkan periode, instrumen, dan penilai. Bobot kategori harus 100% sebelum periode dibuka." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Pegawai mengisi evaluasi diri. Nilainya tidak digabung ke nilai akhir." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Atasan memberi skor 1–5, catatan, bukti, dan rekomendasi secara independen." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Indikator yang tidak berlaku wajib beralasan dan disetujui verifikator. Bobot kemudian dinormalisasi." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Kepala unit menyetujui atau mengembalikan dengan alasan. Nilai dikunci saat verifikasi." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Finalisasi lalu publikasi. Pegawai hanya melihat hasilnya sendiri setelah dipublikasikan." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Perubahan nilai setelah verifikasi hanya lewat koreksi administratif yang menulis audit log." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Kepala unit dinilai oleh penilai yayasan dan diverifikasi oleh orang yang berbeda." })
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl text-forest",
				children: "Rumus"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm",
				children: "Nilai indikator = (skor / 5) × 100. Nilai kategori = rata-rata tertimbang indikator yang berlaku. Nilai akhir = jumlah nilai kategori kali bobotnya. Jika ada indikator atau kategori yang disetujui tidak berlaku, bobot yang tersisa dinormalisasi. Batas awal: 90 sampai 100 Sangat Baik, 80 sampai kurang dari 90 Baik, 70 sampai kurang dari 80 Cukup, 60 sampai kurang dari 70 Perlu Pembinaan, di bawah 60 Memerlukan Evaluasi Intensif."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl text-forest",
				children: "Pencadangan"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm",
				children: "Super Administrator mengunduh cadangan JSON dari Pengaturan. Di lingkungan tayang, basis data juga dipulihkan dari cadangan platform. Jangan menghapus unit atau pegawai yang sudah punya riwayat; nonaktifkan saja. Periode yang ditutup mengunci hasil. Pembukaan kembali wajib beralasan."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl text-forest",
				children: "Yang belum otomatis"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm",
				children: "Pengingat berjalan saat dasbor dibuka, bukan sebagai jadwal server terpisah. Berkas bukti disimpan sebagai uraian teks, bukan unggahan besar, agar aman pada lingkungan tayang. Nama pimpinan dan logo resmi menunggu isian administrator."
			})] })
		]
	});
}
//#endregion
export { PengaturanPage as a, PanduanPage as i, LaporanPage as n, PengembanganPage as o, NotifikasiPage as r, AuditPage as t };
