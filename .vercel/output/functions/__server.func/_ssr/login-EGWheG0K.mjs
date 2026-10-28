import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { a as Field, d as inputClass, n as Button, u as errorText } from "./kit-sHNvXyVM.mjs";
import { S as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as signIn, t as authClient } from "./client-1vAx-gM_.mjs";
import { t as GROK_PROVIDERS } from "./server-DU9XjzlE.mjs";
import { t as useCurrentUserState } from "./use-current-user-c6QUdvAT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-EGWheG0K.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginPage() {
	const { user, isPending } = useCurrentUserState();
	const [mode, setMode] = (0, import_react.useState)("masuk");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center bg-cream text-muted",
		children: "Memuat sesi…"
	});
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	async function submit(event) {
		event.preventDefault();
		setBusy(true);
		try {
			if (mode === "daftar") {
				const result = await authClient.signUp.email({
					email,
					password,
					name,
					callbackURL: "/"
				});
				if (result.error) throw new Error(result.error.message || "Pendaftaran gagal.");
			} else {
				const result = await authClient.signIn.email({
					email,
					password,
					callbackURL: "/"
				});
				if (result.error) throw new Error(result.error.message || "Masuk gagal.");
			}
			window.location.href = "/";
		} catch (error) {
			toast.error(errorText(error));
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "hidden flex-col justify-between bg-forest px-10 py-12 text-cream lg:flex",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-[0.18em] text-gold-soft uppercase",
					children: "Yayasan Pendidikan Islam Tembalang"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display mt-4 max-w-xl text-5xl leading-tight",
					children: "Penilaian kinerja guru dan pegawai"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-lg text-cream/80",
					children: "Satu alur untuk evaluasi diri, penilaian atasan, verifikasi kepala unit, dan rencana pengembangan di KB-TK, SD, serta SMPTQ Islam Pangeran Diponegoro."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "space-y-2 text-sm text-gold-soft",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "KB-TK Islam Pangeran Diponegoro" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "SD Islam Pangeran Diponegoro" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "SMPTQ Pangeran Diponegoro" })
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "grid place-items-center bg-cream px-4 py-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-[0.16em] text-gold uppercase",
						children: "SIPKG YPIT"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display mt-2 text-4xl text-forest",
						children: mode === "masuk" ? "Masuk" : "Daftar akun"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Akun pertama yang mendaftar menjadi Super Administrator. Peran lain ditetapkan oleh administrator."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: mode === "masuk" ? "primary" : "line",
							onClick: () => setMode("masuk"),
							children: "Masuk"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: mode === "daftar" ? "primary" : "line",
							onClick: () => setMode("daftar"),
							children: "Daftar"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-5 space-y-3",
						onSubmit: (event) => void submit(event),
						children: [
							mode === "daftar" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Nama lengkap",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: inputClass,
									value: name,
									onChange: (event) => setName(event.target.value),
									required: true
								})
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Surel",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: inputClass,
									type: "email",
									value: email,
									onChange: (event) => setEmail(event.target.value),
									required: true
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Kata sandi",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: inputClass,
									type: "password",
									minLength: 8,
									value: password,
									onChange: (event) => setPassword(event.target.value),
									required: true
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "w-full",
								disabled: busy,
								children: busy ? "Memproses…" : mode === "masuk" ? "Masuk" : "Buat akun"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 space-y-2",
						children: GROK_PROVIDERS.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "line",
							className: "w-full",
							type: "button",
							onClick: () => void signIn(provider.providerId, { callbackURL: "/" }),
							children: ["Lanjutkan dengan ", provider.label]
						}, provider.providerId))
					})
				]
			})
		})]
	});
}
//#endregion
export { LoginPage as component };
