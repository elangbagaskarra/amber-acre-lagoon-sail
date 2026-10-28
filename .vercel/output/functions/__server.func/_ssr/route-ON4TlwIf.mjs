import { o as __toESM } from "../_runtime.mjs";
import { a as ROLE_LABEL } from "./labels-b_RKwhV6.mjs";
import { a as require_jsx_runtime, i as require_react, r as useQueryClient, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { c as cn } from "./kit-sHNvXyVM.mjs";
import { S as Navigate, _ as Outlet, m as useRouterState, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { K as setSimulationFn, m as getSession, x as listNotificationsFn, y as listEmployeesFn } from "./server-qyauYh16.mjs";
import { i as signOut } from "./client-1vAx-gM_.mjs";
import { a as hasGateSessionMarker } from "./server-DU9XjzlE.mjs";
import { t as useCurrentUserState } from "./use-current-user-c6QUdvAT.mjs";
import { a as navFor } from "./access-DSv3qvdn.mjs";
import { _ as Building2, a as Sprout, c as ScrollText, d as LogOut, f as ListChecks, g as CalendarRange, h as ClipboardCheck, l as Network, m as FileChartColumnIncreasing, n as Users, o as Shield, p as LayoutDashboard, r as UserRound, s as Settings, t as X, u as Menu, v as BookOpen, y as Bell } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-ON4TlwIf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var NAV = {
	dashboard: {
		to: "/",
		label: "Dasbor",
		icon: LayoutDashboard
	},
	pegawai: {
		to: "/pegawai",
		label: "Data pegawai",
		icon: Users
	},
	organisasi: {
		to: "/organisasi",
		label: "Struktur organisasi",
		icon: Network
	},
	unit: {
		to: "/unit",
		label: "Unit pendidikan",
		icon: Building2
	},
	jabatan: {
		to: "/jabatan",
		label: "Jabatan dan penilai",
		icon: UserRound
	},
	periode: {
		to: "/periode",
		label: "Periode penilaian",
		icon: CalendarRange
	},
	instrumen: {
		to: "/instrumen",
		label: "Template dan indikator",
		icon: ListChecks
	},
	evaluasi: {
		to: "/evaluasi",
		label: "Evaluasi diri",
		icon: ClipboardCheck
	},
	penilaian: {
		to: "/penilaian",
		label: "Penilaian atasan",
		icon: ClipboardCheck
	},
	verifikasi: {
		to: "/verifikasi",
		label: "Verifikasi",
		icon: Shield
	},
	hasil: {
		to: "/hasil",
		label: "Hasil penilaian",
		icon: FileChartColumnIncreasing
	},
	pengembangan: {
		to: "/pengembangan",
		label: "Rencana pengembangan",
		icon: Sprout
	},
	laporan: {
		to: "/laporan",
		label: "Laporan",
		icon: ScrollText
	},
	notifikasi: {
		to: "/notifikasi",
		label: "Notifikasi",
		icon: Bell
	},
	audit: {
		to: "/audit",
		label: "Audit log",
		icon: Shield
	},
	pengaturan: {
		to: "/pengaturan",
		label: "Pengaturan",
		icon: Settings
	},
	panduan: {
		to: "/panduan",
		label: "Panduan",
		icon: BookOpen
	}
};
function Shell({ children }) {
	const session = useQuery({
		queryKey: ["session"],
		queryFn: () => getSession()
	});
	const notes = useQuery({
		queryKey: ["notifications"],
		queryFn: () => listNotificationsFn(),
		enabled: !!session.data
	});
	const people = useQuery({
		queryKey: ["employees", "sim"],
		queryFn: () => listEmployeesFn({ data: { active: "aktif" } }),
		enabled: session.data?.profileRole === "super_admin"
	});
	const client = useQueryClient();
	const path = useRouterState({ select: (state) => state.location.pathname });
	const [open, setOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setOpen(false), [path]);
	const actor = session.data;
	const unread = (notes.data ?? []).filter((item) => !item.read_at).length;
	const items = actor ? navFor(actor.effectiveRole) : [];
	const gateSession = (0, import_react.useSyncExternalStore)(() => () => {}, hasGateSessionMarker, () => false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen md:grid md:grid-cols-[270px_1fr]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: cn("fixed inset-y-0 left-0 z-40 w-[270px] border-r border-line bg-forest text-cream transition md:static", open ? "translate-x-0" : "-translate-x-full md:translate-x-0"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 px-5 py-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid h-11 w-11 place-items-center rounded-2xl bg-gold font-display text-lg text-ink",
						children: "YP"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-lg leading-none",
						children: "SIPKG YPIT"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-gold-soft",
						children: "Penilaian kinerja semester"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "space-y-1 px-3 pb-8",
					children: items.map((key) => {
						const item = NAV[key];
						const Icon = item.icon;
						const active = path === item.to;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm", active ? "bg-cream text-forest" : "text-cream/90 hover:bg-white/10"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.label }),
								key === "notifikasi" && unread > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-auto rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-ink",
									children: unread
								}) : null
							]
						}, key);
					})
				})]
			}),
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "fixed inset-0 z-30 bg-ink/40 md:hidden",
				"aria-label": "Tutup menu",
				onClick: () => setOpen(false)
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-cream/90 px-4 py-3 backdrop-blur md:px-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "grid h-11 w-11 place-items-center rounded-2xl border border-line bg-paper md:hidden",
								onClick: () => setOpen(true),
								"aria-label": "Buka menu",
								children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "h-5 w-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-semibold text-forest",
									children: "Yayasan Pendidikan Islam Tembalang"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-xs text-muted",
									children: actor ? `${ROLE_LABEL[actor.effectiveRole]}${actor.unitName ? ` · ${actor.unitName}` : ""}` : "Memuat profil…"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/notifikasi",
								className: "relative grid h-11 w-11 place-items-center rounded-2xl border border-line bg-paper",
								"aria-label": "Notifikasi",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-4 w-4" }), unread > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-2 right-2 h-2 w-2 rounded-full bg-gold" }) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hidden items-center gap-2 sm:flex",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "max-w-40 truncate text-sm font-semibold",
									children: actor?.fullName
								}), !gateSession ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: "inline-flex min-h-11 items-center gap-1 text-sm text-muted",
									onClick: () => void signOut("/"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" }), " Keluar"]
								}) : null]
							})
						]
					}),
					actor?.simulating ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2 bg-gold px-4 py-2 text-sm text-ink md:px-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"Mode simulasi: Anda bertindak sebagai ",
							actor.simulationName,
							". Setiap tindakan tetap tercatat atas akun Anda."
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "font-semibold underline",
							onClick: () => void setSimulationFn({ data: null }).then(() => client.invalidateQueries()),
							children: "Keluar simulasi"
						})]
					}) : null,
					actor?.profileRole === "super_admin" && !actor.simulating ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2 border-b border-line bg-paper px-4 py-2 text-sm md:px-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: "Simulasi peran demo"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "min-h-11 rounded-xl border border-line bg-cream px-3 text-sm",
							value: "",
							onChange: (event) => {
								if (!event.target.value) return;
								setSimulationFn({ data: event.target.value }).then(() => client.invalidateQueries());
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Pilih pegawai demo…"
							}), (people.data ?? []).filter((person) => person.is_demo).map((person) => {
								const row = person;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: row.id,
									children: row.full_name
								}, row.id);
							})]
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
						className: "px-4 py-5 md:px-6 md:py-7",
						children: session.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-danger",
							children: session.error instanceof Error ? session.error.message : "Sesi gagal dimuat."
						}) : children
					})
				]
			})
		]
	});
}
function AppLayout() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center bg-cream text-muted",
		children: "Memuat sesi…"
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/login" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) });
}
//#endregion
export { AppLayout as component };
