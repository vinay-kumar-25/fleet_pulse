export const themes = {
// =========================================================
// 1. OBSIDIAN — Premium OLED / Black
// =========================================================
obsidian: {
name: "Obsidian",


bg: "bg-[#050505]",
cardBg: "bg-[#0b0b0d]",
sidebarBg: "bg-[#080809]",

border: "border-white/[0.08]",
borderHover: "hover:border-white/[0.16]",

textPrimary: "text-zinc-100",
textSecondary: "text-zinc-400",
textMuted: "text-zinc-500",

accent:
  "bg-white text-black hover:bg-zinc-200 active:bg-zinc-300",

accentBorder: "border-white/[0.15]",

gradient:
  "bg-gradient-to-br from-zinc-900 via-black to-zinc-950",

gradientText:
  "bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent",

glow:
  "shadow-[0_0_40px_rgba(255,255,255,0.04)]",

card:
  "bg-[#0b0b0d]/90 border border-white/[0.08] backdrop-blur-xl",

cardHover:
  "hover:border-white/[0.14] hover:bg-[#0f0f11] transition-all duration-300",

badge:
  "bg-zinc-800/80 text-zinc-200 border border-zinc-700/70",

input:
  "bg-zinc-900/70 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-zinc-500/20",

button:
  "bg-white text-black hover:bg-zinc-200",

buttonSecondary:
  "bg-zinc-900 text-zinc-200 border border-zinc-800 hover:bg-zinc-800",

success:
  "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",

warning:
  "bg-amber-500/10 text-amber-400 border border-amber-500/20",

danger:
  "bg-red-500/10 text-red-400 border border-red-500/20",

info:
  "bg-blue-500/10 text-blue-400 border border-blue-500/20",

vars: {
  "--bg-main": "#050505",
  "--bg-card": "#0b0b0d",
  "--bg-sidebar": "#080809",
  "--border-color": "rgba(255,255,255,0.08)",
  "--text-primary": "#f4f4f5",
  "--text-secondary": "#a1a1aa",
  "--text-muted": "#71717a",
  "--accent-bg": "#ffffff",
  "--accent-text": "#000000",
  "--input-bg": "#18181b"
}


},

// =========================================================
// 2. MIDNIGHT — Enterprise Blue
// =========================================================
midnight: {
name: "Midnight",


bg: "bg-[#070b14]",
cardBg: "bg-[#0d1424]",
sidebarBg: "bg-[#090f1c]",

border: "border-slate-700/60",
borderHover: "hover:border-blue-500/30",

textPrimary: "text-slate-100",
textSecondary: "text-slate-400",
textMuted: "text-slate-500",

accent:
  "bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700",

accentBorder: "border-blue-500/40",

gradient:
  "bg-gradient-to-br from-[#0f172a] via-[#0b1220] to-[#111827]",

gradientText:
  "bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent",

glow:
  "shadow-[0_0_45px_rgba(37,99,235,0.10)]",

card:
  "bg-slate-900/70 border border-slate-700/60 backdrop-blur-xl",

cardHover:
  "hover:border-blue-500/30 hover:bg-slate-900 transition-all duration-300",

badge:
  "bg-slate-800 text-slate-200 border border-slate-700",

input:
  "bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20",

button:
  "bg-blue-600 text-white hover:bg-blue-500",

buttonSecondary:
  "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700",

success:
  "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",

warning:
  "bg-amber-500/10 text-amber-400 border border-amber-500/20",

danger:
  "bg-red-500/10 text-red-400 border border-red-500/20",

info:
  "bg-blue-500/10 text-blue-400 border border-blue-500/20",

vars: {
  "--bg-main": "#070b14",
  "--bg-card": "#0d1424",
  "--bg-sidebar": "#090f1c",
  "--border-color": "rgba(71,85,105,0.6)",
  "--text-primary": "#f1f5f9",
  "--text-secondary": "#94a3b8",
  "--text-muted": "#64748b",
  "--accent-bg": "#2563eb",
  "--accent-text": "#ffffff",
  "--input-bg": "#0f172a"
}


},

// =========================================================
// 3. AURORA — Premium Gradient / Modern SaaS
// =========================================================
aurora: {
name: "Aurora",


bg: "bg-[#080713]",
cardBg: "bg-[#111025]",
sidebarBg: "bg-[#0b0a18]",

border: "border-indigo-500/20",
borderHover: "hover:border-cyan-400/40",

textPrimary: "text-white",
textSecondary: "text-indigo-200/70",
textMuted: "text-indigo-300/40",

accent:
  "bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white hover:brightness-110",

accentBorder: "border-indigo-400/40",

gradient:
  "bg-gradient-to-br from-indigo-950 via-purple-950 to-cyan-950",

gradientText:
  "bg-gradient-to-r from-cyan-300 via-indigo-400 to-purple-400 bg-clip-text text-transparent",

glow:
  "shadow-[0_0_60px_rgba(99,102,241,0.15)]",

card:
  "bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl",

cardHover:
  "hover:bg-white/[0.06] hover:border-indigo-400/30 transition-all duration-300",

input:
  "bg-white/[0.05] border-white/[0.10] text-white placeholder:text-indigo-200/30 focus:border-indigo-400 focus:ring-indigo-500/20",

badge:
  "bg-indigo-500/10 text-indigo-200 border border-indigo-400/20",

button:
  "bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white hover:brightness-110",

buttonSecondary:
  "bg-white/[0.05] text-indigo-100 border border-white/[0.10] hover:bg-white/[0.08]",

success:
  "bg-emerald-400/10 text-emerald-300 border border-emerald-400/20",

warning:
  "bg-amber-400/10 text-amber-300 border border-amber-400/20",

danger:
  "bg-rose-400/10 text-rose-300 border border-rose-400/20",

info:
  "bg-cyan-400/10 text-cyan-300 border border-cyan-400/20",

vars: {
  "--bg-main": "#080713",
  "--bg-card": "#111025",
  "--bg-sidebar": "#0b0a18",
  "--border-color": "rgba(99,102,241,0.20)",
  "--text-primary": "#ffffff",
  "--text-secondary": "#c7d2fe",
  "--text-muted": "#818cf8",
  "--accent-bg": "#6366f1",
  "--accent-text": "#ffffff",
  "--input-bg": "#111025"
}


},

// =========================================================
// 4. CYBER — Futuristic Neon
// =========================================================
cyber: {
name: "Cyber Neon",


bg: "bg-[#020807]",
cardBg: "bg-[#06100d]",
sidebarBg: "bg-[#030b09]",

border: "border-emerald-500/20",
borderHover: "hover:border-emerald-400/50",

textPrimary: "text-emerald-100",
textSecondary: "text-emerald-400/70",
textMuted: "text-emerald-500/40",

accent:
  "bg-emerald-500 text-black font-semibold hover:bg-emerald-400",

accentBorder: "border-emerald-400/50",

gradient:
  "bg-gradient-to-br from-emerald-950 via-[#020807] to-cyan-950",

gradientText:
  "bg-gradient-to-r from-emerald-300 via-cyan-300 to-teal-400 bg-clip-text text-transparent",

glow:
  "shadow-[0_0_45px_rgba(16,185,129,0.12)]",

card:
  "bg-emerald-950/20 border border-emerald-500/20 backdrop-blur-xl",

cardHover:
  "hover:bg-emerald-950/30 hover:border-emerald-400/40 transition-all duration-300",

badge:
  "bg-emerald-950 text-emerald-300 border border-emerald-500/30",

input:
  "bg-black/40 border-emerald-500/20 text-emerald-100 placeholder:text-emerald-700 focus:border-emerald-400 focus:ring-emerald-500/20",

button:
  "bg-emerald-500 text-black hover:bg-emerald-400",

buttonSecondary:
  "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-950",

success:
  "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",

warning:
  "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",

danger:
  "bg-red-500/10 text-red-400 border border-red-500/30",

info:
  "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30",

vars: {
  "--bg-main": "#020807",
  "--bg-card": "#06100d",
  "--bg-sidebar": "#030b09",
  "--border-color": "rgba(16,185,129,0.20)",
  "--text-primary": "#d1fae5",
  "--text-secondary": "#34d399",
  "--text-muted": "#059669",
  "--accent-bg": "#10b981",
  "--accent-text": "#000000",
  "--input-bg": "#030807"
}


},

// =========================================================
// 5. PEARL — Premium Light
// =========================================================
pearl: {
name: "Pearl",


bg: "bg-[#f7f8fa]",
cardBg: "bg-white",
sidebarBg: "bg-white",

border: "border-slate-200",
borderHover: "hover:border-slate-300",

textPrimary: "text-slate-900",
textSecondary: "text-slate-500",
textMuted: "text-slate-400",

accent:
  "bg-slate-900 text-white hover:bg-slate-800",

accentBorder: "border-slate-900",

gradient:
  "bg-gradient-to-br from-white via-slate-50 to-slate-100",

gradientText:
  "bg-gradient-to-r from-slate-900 via-slate-600 to-slate-400 bg-clip-text text-transparent",

glow:
  "shadow-[0_10px_40px_rgba(15,23,42,0.06)]",

card:
  "bg-white border border-slate-200 shadow-sm",

cardHover:
  "hover:shadow-md hover:border-slate-300 transition-all duration-300",

badge:
  "bg-slate-100 text-slate-700 border border-slate-200",

input:
  "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-500/10",

button:
  "bg-slate-900 text-white hover:bg-slate-800",

buttonSecondary:
  "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",

success:
  "bg-emerald-50 text-emerald-700 border border-emerald-200",

warning:
  "bg-amber-50 text-amber-700 border border-amber-200",

danger:
  "bg-red-50 text-red-700 border border-red-200",

info:
  "bg-blue-50 text-blue-700 border border-blue-200",

vars: {
  "--bg-main": "#f7f8fa",
  "--bg-card": "#ffffff",
  "--bg-sidebar": "#ffffff",
  "--border-color": "#e2e8f0",
  "--text-primary": "#0f172a",
  "--text-secondary": "#64748b",
  "--text-muted": "#94a3b8",
  "--accent-bg": "#0f172a",
  "--accent-text": "#ffffff",
  "--input-bg": "#ffffff"
}


}
};
