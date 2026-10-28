import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/kit-sHNvXyVM.js
var import_jsx_runtime = require_jsx_runtime();
function cn(...parts) {
	return parts.filter(Boolean).join(" ");
}
function errorText(error) {
	if (error instanceof Error && error.message) return error.message.replace(/^AppError:\s*/, "");
	if (typeof error === "object" && error && "message" in error) return String(error.message);
	return "Terjadi kesalahan. Periksa isian, lalu coba lagi.";
}
function Button({ variant = "primary", className, ...props }) {
	const styles = {
		primary: "bg-forest text-cream hover:bg-moss",
		gold: "bg-gold text-ink hover:brightness-105",
		ghost: "bg-transparent text-forest hover:bg-sand/70",
		danger: "bg-danger text-paper hover:brightness-110",
		line: "border border-line bg-paper text-ink hover:border-forest"
	}[variant];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		...props,
		className: cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50", styles, className)
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block space-y-1.5 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-semibold text-ink",
			children: label
		}), children]
	});
}
var inputClass = "w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none ring-gold/40 placeholder:text-muted focus:ring-2";
function Badge({ children, tone = "sand" }) {
	const tones = {
		sand: "bg-sand text-ink",
		forest: "bg-forest text-cream",
		gold: "bg-gold-soft text-ink",
		danger: "bg-danger-soft text-danger"
	}[tone];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", tones),
		children
	});
}
function Card({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: cn("rounded-[var(--radius-card)] border border-line bg-paper p-4 shadow-[0_1px_0_rgba(18,56,47,0.04)] md:p-5", className),
		children
	});
}
function PageTitle({ eyebrow, title, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-5 flex flex-wrap items-end justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [eyebrow ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-semibold tracking-[0.16em] text-gold uppercase",
			children: eyebrow
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl text-forest md:text-4xl",
			children: title
		})] }), action]
	});
}
function Empty({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-2xl border border-dashed border-line bg-cream/60 px-4 py-8 text-center text-sm text-muted",
		children
	});
}
function Modal({ title, children, onClose }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 grid place-items-end bg-ink/40 p-3 md:place-items-center",
		role: "dialog",
		"aria-modal": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-h-[92vh] w-full max-w-2xl overflow-auto rounded-3xl bg-paper p-5 shadow-xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl text-forest",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: onClose,
					type: "button",
					children: "Tutup"
				})]
			}), children]
		})
	});
}
function downloadBase64(filename, base64, mime) {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
	const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}
//#endregion
export { Field as a, cn as c, inputClass as d, Empty as i, downloadBase64 as l, Button as n, Modal as o, Card as r, PageTitle as s, Badge as t, errorText as u };
