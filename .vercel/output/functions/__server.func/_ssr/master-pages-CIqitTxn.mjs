import { o as __toESM } from "../_runtime.mjs";
import { n as GROUP_LABEL, o as UNIT_LEVEL_LABEL, r as PERIOD_STATUS_LABEL } from "./labels-b_RKwhV6.mjs";
import { a as require_jsx_runtime, i as require_react, r as useQueryClient, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { a as Field, d as inputClass, i as Empty, n as Button, o as Modal, r as Card, s as PageTitle, t as Badge, u as errorText } from "./kit-sHNvXyVM.mjs";
import { A as refreshAssignmentsFn, G as setPositionActiveFn, I as savePeriodFn, N as saveCategoryWeightFn, O as orgTreeFn, P as saveEmployeeFn, R as savePositionFn, S as listPeriodsFn, T as listUnitsFn, U as setEmployeeActiveFn, V as saveUnitFn, W as setPeriodStatusFn, b as listInstrumentsFn, h as importEmployeesFn, i as cloneVersionFn, q as setUnitActiveFn, w as listPositionsFn, y as listEmployeesFn } from "./server-qyauYh16.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/master-pages-CIqitTxn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var str = (row, key) => String(row[key] ?? "");
function PegawaiPage() {
	const client = useQueryClient();
	const [q, setQ] = (0, import_react.useState)("");
	const [unitId, setUnitId] = (0, import_react.useState)("");
	const [group, setGroup] = (0, import_react.useState)("");
	const [active, setActive] = (0, import_react.useState)("aktif");
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [importOpen, setImportOpen] = (0, import_react.useState)(false);
	const units = useQuery({
		queryKey: ["units"],
		queryFn: () => listUnitsFn()
	});
	const positions = useQuery({
		queryKey: ["positions"],
		queryFn: () => listPositionsFn()
	});
	const rows = useQuery({
		queryKey: [
			"employees",
			q,
			unitId,
			group,
			active
		],
		queryFn: () => listEmployeesFn({ data: {
			q,
			unitId,
			group,
			active
		} })
	}).data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, {
			eyebrow: "Data induk",
			title: "Pegawai",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "line",
					onClick: () => setImportOpen(true),
					children: "Impor CSV"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => setEditing({}),
					children: "Tambah pegawai"
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 grid gap-2 md:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: inputClass,
					placeholder: "Cari nama atau kode",
					value: q,
					onChange: (e) => setQ(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: inputClass,
					value: unitId,
					onChange: (e) => setUnitId(e.target.value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "Semua unit"
					}), (units.data ?? []).map((unit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: str(unit, "id"),
						children: str(unit, "name")
					}, str(unit, "id")))]
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
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: inputClass,
					value: active,
					onChange: (e) => setActive(e.target.value),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Semua status"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "aktif",
							children: "Aktif"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "nonaktif",
							children: "Tidak aktif"
						})
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "overflow-x-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[760px] text-left text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "text-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2",
							children: "Kode"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Nama" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Unit" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Jabatan" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Penilai" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-sand",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "py-3 font-semibold",
							children: [
								str(row, "code"),
								" ",
								row.is_demo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "gold",
									children: "Demo"
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: str(row, "full_name") }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: str(row, "unit_name") }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [str(row, "position_name"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted",
							children: GROUP_LABEL[str(row, "group_code")] ?? str(row, "group_code")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: str(row, "assessor_name") || "—" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.active ? "Aktif" : "Tidak aktif" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => setEditing(row),
							children: "Ubah"
						}) })
					]
				}, str(row, "id"))) })]
			}), !rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "Tidak ada pegawai pada filter ini." }) : null]
		}),
		editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmployeeForm, {
			row: editing,
			units: units.data ?? [],
			positions: positions.data ?? [],
			people: rows,
			onClose: () => setEditing(null),
			onSaved: () => {
				setEditing(null);
				client.invalidateQueries({ queryKey: ["employees"] });
			}
		}) : null,
		importOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportDialog, { onClose: () => setImportOpen(false) }) : null
	] });
}
function EmployeeForm({ row, units, positions, people, onClose, onSaved }) {
	const [form, setForm] = (0, import_react.useState)({
		code: str(row, "code"),
		fullName: str(row, "full_name"),
		unitId: str(row, "unit_id"),
		positionId: str(row, "position_id"),
		groupCode: str(row, "group_code") || "guru",
		employmentStatus: str(row, "employment_status") || "tetap",
		startDate: str(row, "start_date").slice(0, 10),
		supervisorId: str(row, "supervisor_id") || "",
		assessorId: str(row, "assessor_id") || "",
		verifierId: str(row, "verifier_id") || "",
		email: str(row, "email"),
		notes: str(row, "notes"),
		active: row.active !== false,
		includeInAssessment: row.include_in_assessment !== false,
		responsibility: (row.responsibilities ?? []).map((item) => item.key).join(", ")
	});
	const set = (key, value) => setForm((prev) => ({
		...prev,
		[key]: value
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
		title: row.id ? "Ubah pegawai" : "Tambah pegawai",
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "grid gap-3 md:grid-cols-2",
			onSubmit: (event) => {
				event.preventDefault();
				saveEmployeeFn({ data: {
					id: row.id ? str(row, "id") : void 0,
					...form,
					supervisorId: form.supervisorId || null,
					assessorId: form.assessorId || null,
					verifierId: form.verifierId || null,
					responsibilities: form.responsibility.split(",").map((key) => key.trim()).filter(Boolean).map((key) => ({
						key,
						label: key
					}))
				} }).then(() => {
					toast.success("Data pegawai disimpan.");
					onSaved();
				}).catch((error) => toast.error(errorText(error)));
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Kode",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: inputClass,
						value: form.code,
						onChange: (e) => set("code", e.target.value),
						required: true
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Nama lengkap",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: inputClass,
						value: form.fullName,
						onChange: (e) => set("fullName", e.target.value),
						required: true
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Unit",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: inputClass,
						value: form.unitId,
						onChange: (e) => set("unitId", e.target.value),
						required: true,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Pilih"
						}), units.map((unit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: str(unit, "id"),
							children: str(unit, "name")
						}, str(unit, "id")))]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Jabatan",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: inputClass,
						value: form.positionId,
						onChange: (e) => set("positionId", e.target.value),
						required: true,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Pilih"
						}), positions.map((position) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: str(position, "id"),
							children: str(position, "name")
						}, str(position, "id")))]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Kelompok",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: inputClass,
						value: form.groupCode,
						onChange: (e) => set("groupCode", e.target.value),
						children: [
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
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Status kepegawaian",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: inputClass,
						value: form.employmentStatus,
						onChange: (e) => set("employmentStatus", e.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "tetap",
								children: "Tetap"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "kontrak",
								children: "Kontrak"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "honorer",
								children: "Honorer"
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Mulai bekerja",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: inputClass,
						type: "date",
						value: form.startDate,
						onChange: (e) => set("startDate", e.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Surel",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: inputClass,
						value: form.email,
						onChange: (e) => set("email", e.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Atasan langsung",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: inputClass,
						value: form.supervisorId,
						onChange: (e) => set("supervisorId", e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Belum ditetapkan"
						}), people.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: str(person, "id"),
							children: str(person, "full_name")
						}, str(person, "id")))]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Penilai",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: inputClass,
						value: form.assessorId,
						onChange: (e) => set("assessorId", e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Belum ditetapkan"
						}), people.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: str(person, "id"),
							children: str(person, "full_name")
						}, str(person, "id")))]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Verifikator",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: inputClass,
						value: form.verifierId,
						onChange: (e) => set("verifierId", e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Belum ditetapkan"
						}), people.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: str(person, "id"),
							children: str(person, "full_name")
						}, str(person, "id")))]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Tanggung jawab khusus",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: inputClass,
						value: form.responsibility,
						onChange: (e) => set("responsibility", e.target.value),
						placeholder: "contoh: tahfiz"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: form.includeInAssessment,
						onChange: (e) => set("includeInAssessment", e.target.checked)
					}), " Ikut penilaian"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: form.active,
						onChange: (e) => set("active", e.target.checked)
					}), " Aktif"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "md:col-span-2 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Simpan"
					}), row.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "line",
						onClick: () => void setEmployeeActiveFn({ data: {
							id: str(row, "id"),
							active: !form.active
						} }).then(onSaved),
						children: [" ", form.active ? "Nonaktifkan" : "Aktifkan"]
					}) : null]
				})
			]
		})
	});
}
function ImportDialog({ onClose }) {
	const client = useQueryClient();
	const [csv, setCsv] = (0, import_react.useState)("kode,nama,unit,jabatan,kelompok,status,mulai,penilai,verifikator\n");
	const [preview, setPreview] = (0, import_react.useState)([]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
		title: "Impor pegawai",
		onClose,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-sm text-muted",
				children: "Kolom: kode, nama, unit, jabatan, kelompok, status, mulai, atasan, penilai, verifikator, email, tanggung_jawab. Unit dan jabatan diisi kode yang sudah ada. Baris duplikat ditolak."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				className: inputClass,
				rows: 8,
				value: csv,
				onChange: (e) => setCsv(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "line",
					onClick: () => void importEmployeesFn({ data: {
						csv,
						commit: false
					} }).then((result) => setPreview(result.preview)).catch((error) => toast.error(errorText(error))),
					children: "Periksa"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => void importEmployeesFn({ data: {
						csv,
						commit: true
					} }).then((result) => {
						toast.success(`${result.imported} pegawai diimpor.`);
						client.invalidateQueries({ queryKey: ["employees"] });
						onClose();
					}).catch((error) => toast.error(errorText(error))),
					children: "Impor"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-1 text-sm",
				children: preview.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: row.ok ? "text-moss" : "text-danger",
					children: [
						"Baris ",
						row.line,
						": ",
						row.code,
						" ",
						row.name,
						" — ",
						row.message
					]
				}, row.line))
			})
		]
	});
}
function UnitPage() {
	const client = useQueryClient();
	const units = useQuery({
		queryKey: ["units"],
		queryFn: () => listUnitsFn()
	});
	const [form, setForm] = (0, import_react.useState)({
		id: "",
		code: "",
		name: "",
		levelCode: "sd",
		address: "",
		phone: "",
		email: "",
		headTitle: "",
		headName: "",
		parentId: "yayasan"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, {
		eyebrow: "Organisasi",
		title: "Unit pendidikan"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[1fr_320px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-left text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "text-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2",
							children: "Unit"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Aktif" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Pegawai" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: (units.data ?? []).map((unit) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-sand",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold",
								children: str(unit, "name")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: [
									str(unit, "head_title"),
									" ",
									str(unit, "head_name")
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: unit.active ? "Aktif" : "Tidak aktif" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: String(unit.active_employees ?? 0) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "space-x-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => setForm({
									id: str(unit, "id"),
									code: str(unit, "code"),
									name: str(unit, "name"),
									levelCode: str(unit, "level_code"),
									address: str(unit, "address"),
									phone: str(unit, "phone"),
									email: str(unit, "email"),
									headTitle: str(unit, "head_title"),
									headName: str(unit, "head_name"),
									parentId: str(unit, "parent_id") || "yayasan"
								}),
								children: "Ubah"
							}), str(unit, "id") !== "yayasan" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => void setUnitActiveFn({ data: {
									id: str(unit, "id"),
									active: !unit.active
								} }).then(() => client.invalidateQueries({ queryKey: ["units"] })),
								children: unit.active ? "Nonaktifkan" : "Aktifkan"
							}) : null]
						})
					]
				}, str(unit, "id"))) })]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-2xl text-forest",
			children: form.id ? "Ubah unit" : "Unit baru"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-3 space-y-3",
			onSubmit: (event) => {
				event.preventDefault();
				saveUnitFn({ data: {
					...form,
					id: form.id || void 0,
					parentId: form.parentId || null
				} }).then(() => {
					toast.success("Unit disimpan. Unit yang punya riwayat tidak dihapus.");
					setForm({
						id: "",
						code: "",
						name: "",
						levelCode: "sd",
						address: "",
						phone: "",
						email: "",
						headTitle: "",
						headName: "",
						parentId: "yayasan"
					});
					client.invalidateQueries({ queryKey: ["units"] });
				}).catch((error) => toast.error(errorText(error)));
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Kode",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: inputClass,
						value: form.code,
						onChange: (e) => setForm({
							...form,
							code: e.target.value
						}),
						required: true
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Nama",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: inputClass,
						value: form.name,
						onChange: (e) => setForm({
							...form,
							name: e.target.value
						}),
						required: true
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Jenjang",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: inputClass,
						value: form.levelCode,
						onChange: (e) => setForm({
							...form,
							levelCode: e.target.value
						}),
						children: Object.entries(UNIT_LEVEL_LABEL).map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: key,
							children: label
						}, key))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Jabatan pimpinan",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: inputClass,
						value: form.headTitle,
						onChange: (e) => setForm({
							...form,
							headTitle: e.target.value
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Nama pimpinan",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: inputClass,
						value: form.headName,
						onChange: (e) => setForm({
							...form,
							headName: e.target.value
						}),
						placeholder: "Isi jika sudah ditetapkan"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Alamat",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: inputClass,
						value: form.address,
						onChange: (e) => setForm({
							...form,
							address: e.target.value
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Telepon",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: inputClass,
						value: form.phone,
						onChange: (e) => setForm({
							...form,
							phone: e.target.value
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
function JabatanPage() {
	const client = useQueryClient();
	const positions = useQuery({
		queryKey: ["positions"],
		queryFn: () => listPositionsFn()
	});
	const [form, setForm] = (0, import_react.useState)({
		id: "",
		code: "",
		name: "",
		groupCode: "guru",
		description: ""
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, {
			eyebrow: "Organisasi",
			title: "Jabatan"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-4 max-w-3xl text-sm text-muted",
			children: "Penilai dan verifikator ditetapkan pada data pegawai, bukan pada jabatan semata, agar tidak terjadi penilaian terhadap diri sendiri."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-[1fr_320px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: (positions.data ?? []).map((position) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2 border-b border-sand py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold",
					children: str(position, "name")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: [
						GROUP_LABEL[str(position, "group_code")],
						" · ",
						position.active ? "Aktif" : "Tidak aktif"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: () => setForm({
						id: str(position, "id"),
						code: str(position, "code"),
						name: str(position, "name"),
						groupCode: str(position, "group_code"),
						description: str(position, "description")
					}),
					children: "Ubah"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: () => void setPositionActiveFn({ data: {
						id: str(position, "id"),
						active: !position.active
					} }).then(() => client.invalidateQueries({ queryKey: ["positions"] })),
					children: position.active ? "Nonaktifkan" : "Aktifkan"
				})] })]
			}, str(position, "id"))) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-3",
				onSubmit: (event) => {
					event.preventDefault();
					savePositionFn({ data: {
						...form,
						id: form.id || void 0
					} }).then(() => {
						toast.success("Jabatan disimpan.");
						client.invalidateQueries({ queryKey: ["positions"] });
					}).catch((error) => toast.error(errorText(error)));
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Kode",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: inputClass,
							value: form.code,
							onChange: (e) => setForm({
								...form,
								code: e.target.value
							}),
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Nama",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: inputClass,
							value: form.name,
							onChange: (e) => setForm({
								...form,
								name: e.target.value
							}),
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Kelompok",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: inputClass,
							value: form.groupCode,
							onChange: (e) => setForm({
								...form,
								groupCode: e.target.value
							}),
							children: [
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
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Keterangan",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: inputClass,
							value: form.description,
							onChange: (e) => setForm({
								...form,
								description: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Simpan"
					})
				]
			}) })]
		})
	] });
}
function OrganisasiPage() {
	const tree = useQuery({
		queryKey: ["org"],
		queryFn: () => orgTreeFn()
	});
	const units = tree.data?.units ?? [];
	const counts = tree.data?.counts ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, {
		eyebrow: "Yayasan",
		title: "Struktur organisasi"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-3",
		children: units.filter((unit) => !unit.parent_id).map((root) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-2xl text-forest",
			children: str(root, "name")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 grid gap-3 md:grid-cols-3",
			children: units.filter((unit) => unit.parent_id === root.id).map((unit) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl bg-cream p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: str(unit, "name")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							unit.active ? "Aktif" : "Tidak aktif",
							" · ",
							UNIT_LEVEL_LABEL[str(unit, "level_code")] ?? str(unit, "level_code")
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 text-sm text-muted",
						children: counts.filter((count) => count.unit_id === unit.id).map((count) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							GROUP_LABEL[count.group_code] ?? count.group_code,
							": ",
							count.total
						] }, count.group_code))
					})
				]
			}, str(unit, "id")))
		})] }, str(root, "id")))
	})] });
}
function PeriodePage() {
	const client = useQueryClient();
	const data = useQuery({
		queryKey: ["periods"],
		queryFn: () => listPeriodsFn()
	});
	const instruments = useQuery({
		queryKey: ["instruments"],
		queryFn: () => listInstrumentsFn()
	});
	const periods = data.data?.periods ?? [];
	const versions = instruments.data?.versions ?? [];
	const [form, setForm] = (0, import_react.useState)({
		id: "",
		name: "",
		academicYear: "2026/2027",
		semester: 1,
		startDate: "2027-01-05",
		endDate: "2027-06-19",
		selfStart: "2027-05-01",
		selfEnd: "2027-05-20",
		assessorStart: "2027-05-21",
		assessorEnd: "2027-06-05",
		verifyStart: "2027-06-06",
		verifyEnd: "2027-06-15",
		finalizeDeadline: "2027-06-19",
		versions: {
			guru: "ver_guru_1",
			tendik: "ver_tendik_1",
			pimpinan: "ver_pimpinan_1"
		}
	});
	const versionOptions = (0, import_react.useMemo)(() => versions, [versions]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, {
		eyebrow: "Siklus semester",
		title: "Periode penilaian"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 xl:grid-cols-[1fr_360px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: periods.map((period) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl text-forest",
								children: str(period, "name")
							}),
							period.is_demo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: "gold",
								children: "Contoh"
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: PERIOD_STATUS_LABEL[str(period, "status")] ?? str(period, "status") })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							"Tahun ajaran ",
							str(period, "academic_year"),
							" · Semester ",
							String(period.semester)
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							"Evaluasi diri ",
							String(period.self_start).slice(0, 10),
							" s.d. ",
							String(period.self_end).slice(0, 10)
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						period.status === "persiapan" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => void change(str(period, "id"), "berlangsung", ""),
							children: "Buka periode"
						}) : null,
						period.status !== "ditutup" && period.status !== "persiapan" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "line",
							onClick: () => {
								const reason = window.prompt("Alasan penutupan") ?? "";
								if (reason.trim()) change(str(period, "id"), "ditutup", reason);
							},
							children: "Tutup"
						}) : null,
						period.status === "ditutup" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "line",
							onClick: () => {
								const reason = window.prompt("Alasan pembukaan kembali") ?? "";
								if (reason.trim()) change(str(period, "id"), "berlangsung", reason);
							},
							children: "Buka kembali"
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => void refreshAssignmentsFn({ data: str(period, "id") }).then(() => toast.success("Penugasan diperbarui.")),
							children: "Perbarui penugasan"
						})
					]
				})]
			}) }, str(period, "id")))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-2xl text-forest",
			children: "Periode baru"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-3 space-y-2",
			onSubmit: (event) => {
				event.preventDefault();
				savePeriodFn({ data: form }).then(() => {
					toast.success("Periode disimpan.");
					client.invalidateQueries({ queryKey: ["periods"] });
				}).catch((error) => toast.error(errorText(error)));
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Nama",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: inputClass,
						value: form.name,
						onChange: (e) => setForm({
							...form,
							name: e.target.value
						}),
						required: true
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Tahun ajaran",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: inputClass,
						value: form.academicYear,
						onChange: (e) => setForm({
							...form,
							academicYear: e.target.value
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Semester",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: inputClass,
						value: form.semester,
						onChange: (e) => setForm({
							...form,
							semester: Number(e.target.value)
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: 1,
							children: "1"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: 2,
							children: "2"
						})]
					})
				}),
				[
					"startDate",
					"endDate",
					"selfStart",
					"selfEnd",
					"assessorStart",
					"assessorEnd",
					"verifyStart",
					"verifyEnd",
					"finalizeDeadline"
				].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: key,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "date",
						className: inputClass,
						value: form[key],
						onChange: (e) => setForm({
							...form,
							[key]: e.target.value
						})
					})
				}, key)),
				[
					"guru",
					"tendik",
					"pimpinan"
				].map((audience) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: `Versi instrumen ${audience}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: inputClass,
						value: form.versions[audience],
						onChange: (e) => setForm({
							...form,
							versions: {
								...form.versions,
								[audience]: e.target.value
							}
						}),
						children: versionOptions.filter((version) => str(version, "template_id") === `tpl_${audience}`).map((version) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: str(version, "id"),
							children: [
								str(version, "label"),
								" · ",
								str(version, "status")
							]
						}, str(version, "id")))
					})
				}, audience)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Simpan draf periode"
				})
			]
		})] })]
	})] });
	function change(periodId, status, reason) {
		return setPeriodStatusFn({ data: {
			periodId,
			status,
			reason
		} }).then(() => {
			toast.success("Status periode diperbarui.");
			client.invalidateQueries({ queryKey: ["periods"] });
		}).catch((error) => toast.error(errorText(error)));
	}
}
function InstrumenPage() {
	const client = useQueryClient();
	const data = useQuery({
		queryKey: ["instruments"],
		queryFn: () => listInstrumentsFn()
	});
	const templates = data.data?.templates ?? [];
	const versions = data.data?.versions ?? [];
	const categories = data.data?.categories ?? [];
	const indicators = data.data?.indicators ?? [];
	const [versionId, setVersionId] = (0, import_react.useState)("ver_guru_1");
	const cats = categories.filter((category) => category.version_id === versionId);
	const total = cats.reduce((sum, category) => sum + Number(category.weight), 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, {
			eyebrow: "Instrumen",
			title: "Template dan indikator",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "line",
				onClick: () => void cloneVersionFn({ data: versionId }).then(() => {
					toast.success("Versi baru disalin sebagai draf.");
					client.invalidateQueries({ queryKey: ["instruments"] });
				}).catch((error) => toast.error(errorText(error))),
				children: "Salin versi"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-4 flex flex-wrap gap-2",
			children: versions.map((version) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: versionId === version.id ? "primary" : "line",
				onClick: () => setVersionId(str(version, "id")),
				children: [
					templates.find((template) => template.id === version.template_id)?.name,
					" · ",
					str(version, "label"),
					" · ",
					str(version, "status")
				]
			}, str(version, "id")))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mb-3 text-sm",
			children: [
				"Total bobot kategori: ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [total, "%"] }),
				" ",
				Math.abs(total - 100) < .05 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "forest",
					children: "Siap"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "danger",
					children: "Harus 100%"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: cats.map((category) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl text-forest",
						children: str(category, "name")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-sm text-muted",
						children: [
							"Bobot ",
							String(category.weight),
							"%"
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 space-y-1 text-sm",
					children: indicators.filter((indicator) => indicator.category_id === category.id).map((indicator) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between gap-3 border-t border-sand py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [str(indicator, "name"), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block text-xs text-muted",
							children: [
								indicator.unit_scope !== "all" ? `Khusus ${String(indicator.unit_scope)}` : "Umum",
								indicator.responsibility_key ? ` · tugas ${String(indicator.responsibility_key)}` : "",
								indicator.position_codes ? ` · jabatan ${String(indicator.position_codes)}` : ""
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: String(indicator.weight)
						})]
					}, str(indicator, "id")))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeightEditor, {
					category,
					onSaved: () => void client.invalidateQueries({ queryKey: ["instruments"] })
				})
			] }, str(category, "id")))
		})
	] });
}
function WeightEditor({ category, onSaved }) {
	const [weight, setWeight] = (0, import_react.useState)(String(category.weight));
	const [name, setName] = (0, import_react.useState)(str(category, "name"));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "mt-3 flex flex-wrap gap-2",
		onSubmit: (event) => {
			event.preventDefault();
			saveCategoryWeightFn({ data: {
				categoryId: str(category, "id"),
				weight: Number(weight),
				name
			} }).then((result) => {
				toast.success(result.ok ? "Bobot tersimpan, total 100%." : `Tersimpan. Total saat ini ${result.total}%.`);
				onSaved();
			}).catch((error) => toast.error(errorText(error)));
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: inputClass,
				value: name,
				onChange: (e) => setName(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: `${inputClass} max-w-28`,
				type: "number",
				value: weight,
				onChange: (e) => setWeight(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				variant: "line",
				children: "Simpan bobot"
			})
		]
	});
}
//#endregion
export { PeriodePage as a, PegawaiPage as i, JabatanPage as n, UnitPage as o, OrganisasiPage as r, InstrumenPage as t };
