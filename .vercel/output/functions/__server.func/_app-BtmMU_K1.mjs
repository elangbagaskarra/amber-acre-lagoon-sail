import { a as ROLE_LABEL, n as GROUP_LABEL, t as ASSIGNMENT_STATUS_LABEL } from "./_ssr/labels-b_RKwhV6.mjs";
import { a as require_jsx_runtime, t as useQuery } from "./_libs/react+tanstack__react-query.mjs";
import { r as Card, s as PageTitle, t as Badge } from "./_ssr/kit-sHNvXyVM.mjs";
import { f as getDashboardFn } from "./_ssr/server-qyauYh16.mjs";
import { a as ResponsiveContainer, i as Bar, n as YAxis, o as Tooltip, r as XAxis, t as BarChart } from "./_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app-BtmMU_K1.js
var import_jsx_runtime = require_jsx_runtime();
function DashboardPage() {
	const dash = useQuery({
		queryKey: ["dashboard"],
		queryFn: () => getDashboardFn()
	});
	if (dash.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-muted",
		children: "Memuat dasbor…"
	});
	if (dash.isError || !dash.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-danger",
		children: "Dasbor gagal dimuat."
	});
	const data = dash.data;
	const progress = data.progress.map((row) => ({
		name: ASSIGNMENT_STATUS_LABEL[row.status] ?? row.status,
		total: row.total
	}));
	const doneSelf = data.progress.filter((row) => ![
		"tertahan",
		"menunggu_evaluasi_diri",
		"evaluasi_diri_draf"
	].includes(row.status)).reduce((s, r) => s + r.total, 0);
	const total = data.progress.reduce((s, r) => s + r.total, 0) || 1;
	const assessed = data.progress.filter((row) => ![
		"tertahan",
		"menunggu_evaluasi_diri",
		"evaluasi_diri_draf",
		"menunggu_penilaian",
		"penilaian_draf",
		"dikembalikan"
	].includes(row.status)).reduce((s, r) => s + r.total, 0);
	const verified = data.progress.filter((row) => [
		"terverifikasi",
		"final",
		"dipublikasikan"
	].includes(row.status)).reduce((s, r) => s + r.total, 0);
	const published = data.progress.filter((row) => row.status === "dipublikasikan").reduce((s, r) => s + r.total, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, {
			eyebrow: ROLE_LABEL[data.actor.effectiveRole],
			title: "Dasbor penilaian"
		}),
		data.activePeriod?.is_demo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			tone: "gold",
			children: "Periode contoh, bukan data produksi"
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Pegawai aktif",
					value: String(data.totalActive),
					hint: "Sesuai hak akses Anda"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Evaluasi diri selesai",
					value: `${Math.round(doneSelf / total * 100)}%`,
					hint: `${doneSelf} dari ${data.progress.reduce((s, r) => s + r.total, 0)}`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Penilaian atasan terkirim",
					value: `${Math.round(assessed / total * 100)}%`,
					hint: "Menunggu verifikasi atau lebih"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Terverifikasi / final",
					value: `${verified}`,
					hint: `${published} sudah dipublikasikan`
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "lg:col-span-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl text-forest",
						children: "Progres periode"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-sm text-muted",
						children: data.activePeriod?.name ?? "Belum ada periode"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-64",
						children: progress.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
								data: progress,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "name",
										tick: { fontSize: 11 },
										interval: 0,
										angle: -18,
										height: 70
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { allowDecimals: false }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
										dataKey: "total",
										fill: "var(--color-forest)",
										radius: 6
									})
								]
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Belum ada penugasan pada periode ini."
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "lg:col-span-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl text-forest",
						children: "Perlu pengembangan"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-sm text-muted",
						children: "Kategori dengan nilai di bawah 80 pada hasil yang sudah dihitung. Bukan peringkat orang."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2",
						children: data.weak.length ? data.weak.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: item.total })]
						}, item.name)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "text-sm text-muted",
							children: "Belum ada hasil untuk dianalisis."
						})
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 font-display text-2xl text-forest",
				children: "Pegawai per unit"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2 text-sm",
				children: data.byUnit.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between gap-3 border-b border-sand py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: row.unit_name }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted",
						children: [
							GROUP_LABEL[row.group_code] ?? row.group_code,
							" · ",
							row.total
						]
					})]
				}, `${row.unit_id}-${row.group_code}`))
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 font-display text-2xl text-forest",
				children: "Yang perlu ditindaklanjuti"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2 text-sm",
				children: data.queue.length ? data.queue.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-2xl bg-cream px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: row.employee_name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-muted",
						children: [
							row.unit_name,
							" · ",
							ASSIGNMENT_STATUS_LABEL[row.status] ?? row.status
						]
					})]
				}, row.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-muted",
					children: "Tidak ada antrean."
				})
			})] })]
		})
	] });
}
function Stat({ label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-semibold tracking-[0.14em] text-gold uppercase",
			children: label
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display mt-1 text-3xl text-forest",
			children: value
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: hint
		})
	] });
}
var SplitComponent = DashboardPage;
//#endregion
export { SplitComponent as component };
