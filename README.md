# N Space — Premium AI Agent OS

**Your AI Visa Agent Workspace** · Symphony-clean UI · Apple Liquid Glass · Manus-style live agent execution
**v1.2 — Statutory Dossier Engine** (v1.1 — Agent Nova Edition) · One-Click PDF Cloner · URL-to-Dossier · Editorial A4 Engine

> "Premium AI Operating System" — not an admin dashboard, not a chatbot clone.
> Less UI, More Workspace · Live Browser Preview up to ~600px · Mobile feels native

---

## ✨ What's new in v1.1

### 🪐 Agent Nova — Dedicated PDF & Visa Document Architect
Nova joins the agent team (alongside **Raffi** · OCR, the **Browser Conductor**, **Tanya · Dispatch**, **Zayyad · Analytics** and the Maestro) as the exclusive document producer:

- **Inputs:** text prompts, uploaded files (PDFs, scans, photos), or web URLs
- **Output:** an interactive editable on-screen canvas **and** an exportable, pixel-perfect A4 editorial PDF

**One-Click PDF Cloner — 4 phases**
1. **Structural Decomposition** — real PDF text-layer extraction (incl. FlateDecode stream inflation), layout/field detection; image scans go through Gemini Vision when a key is set
2. **Style & Token Mapping** — fields mapped to verified applicant data (passport, DOB, sponsor, dates) ingested by Raffi
3. **Visual Canvas Reconstruction** — live HTML5/CSS A4 layout; tap any field on the page to edit it
4. **Lossless Vector PDF** — client-side `@page { size: A4; margin: 0 }` export, zero watermarks

**URL-to-Dossier** — paste Home Affairs, VFS Global, Saudi MOFA, GOV.UK or IRCC links: Nova attempts a live extraction and always falls back to curated embassy knowledge, then synthesises an *Executive Visa Client Briefing Pack* with checklist, fee schedule and warnings.

**Editorial design** — Midnight Navy `#0B192C`, ivory/alabaster, champagne-gold rules, Playfair serif + Inter; embossed holographic seal with dynamic `VM-XXXXXX` reference; Intake → Verification → Biometrics → Submission → Dispatch timeline; **real scannable QR** (vendored generator, works offline) linking to the verification URL.

**Mobile** — responsive A4 viewport with zoom controls, bottom-sheet field editor (tap a field → drawer slides up), one-tap export.

### 🧹 Declutter pass ("Less UI, More Workspace")
- Rainbow glow & photo hero removed → plain gray canvas + one quiet white card; stats read as **one quiet hairline-divided row** on Home and Dashboard
- Wider centre canvas, slimmer sidebar, browser preview **clamp(450px → 600px)**
- Chat transcript at 13.5px with a thin hairline thread

### 🌐 Browser preview is first-class
- **Session switcher** — every session keeps its own URL, task and execution log (persisted)
- Transport: **Run / Pause / Resume / Step / Replay / Stop**, progress rail, Mouse·Typing·Click·Scroll·Upload·Download indicators, **full-screen** preview, Execution/Console/Details tabs

### 📱 Mobile feels native
Full-bleed shell, blurred sticky header, iOS-style bottom tab bar (**Workspace / Board / Agents / Browser / Docs**), slide-in sidebar, browser preview as a **bottom sheet**, safe-area insets top & bottom, no page zoom (16px inputs prevent iOS focus-zoom).

### 📲 PWA
`display: fullscreen` (with standalone fallback) + maskable icons — Add to Home Screen opens without browser chrome. Offline-first service worker (`nspace-v1.2.0`) caches the full shell incl. the QR engine.

---

## ⚖️ What's new in v1.2

### 🇷🇸 Serbia Statutory Template Engine (Agent Nova → Statutory Templates)
One tap generates the complete **7-page Jedinstvena Dozvola employer package** on the A4 canvas (210×297mm, 15mm margins, Times typography, Cyrillic/Latin preserved, strict page count):
- **P.1 ПОЗИВНО ПИСМО** — official invitation with Art. 27 (Zakon o strancima) undertaking
- **P.2 PISMO POTVRDE O SMEŠTAJU** — accommodation guarantee + bela karta duty
- **P.3 POTVRDA–IZJAVA** — <10-employee rulebook exemption + 9 statutory guarantees
- **P.4–7 UGOVOR O RADU** — 27 articles incl. salary-by-hours table, +110%/+26%/+0.4% increments, two-column signature & M.P. stamp zones

Every field is click-to-edit and mapped to applicant data. **Legal safeguard:** these are **DRAFT templates** — every page carries a `NACRT · DRAFT` marking and a counsel-verification footer; employer fields ship as placeholders (no third-party company or personal data is pre-filled). Authorised draft preparation only — verify with licensed Serbian legal counsel before signature or submission.

### 🌍 Portal Quick-Dispatcher (8 nations)
Australia · Serbia · Russia · Turkey · Singapore · Malaysia · Saudi · Bahrain — one tap loads the official portal into the Live Browser session and copies the selected applicant's data to the clipboard.

### 👁️ Reference side-by-side preview
Uploaded PDFs/images now preview beside the cloned canvas (blob-URL viewer), so reference vs. clone can be compared while editing.

### 📱 Sidebar-only navigation + purpose-driven Knowledge & Skills
Per product feedback the mobile bottom tab bar is **removed**: the slide-in sidebar is the single navigation on every device (compact spacing fits all 19 sections incl. **Knowledge** and **Skills**, whose purpose is now stated in-page and seeded with the Serbia guide, 8-nation matrix and a Statutory Drafting skill).

### 📲 PWA
Service worker bumped to `nspace-v1.2.0`; fullscreen standalone manifest, maskable icons, offline fallback — installable on iOS, Android, Windows and macOS.

---

## ✅ Build Completion Checklist

- [x] Symphony-inspired premium white UI, clean grouped sidebar, frosted glass
- [x] Applicants, Visa Cases (kanban), Recruitment, CRM, Partners, PDF Center (preview/download/share/print/versions/regenerate)
- [x] **10 AI agents** with personas: Maestro, Visa, Browser Conductor, **Nova**, **Tanya (Dispatch)**, **Zayyad (Analytics)**, **Raffi (OCR)**, Compliance, Recruitment, Research
- [x] Persistent chats · Skills & Knowledge · Automations · ⌘K palette · Bangla voice in/out
- [x] Browser Agent with sessions, transport controls, execution logs & Stop
- [x] Gemini (live chat **and** vision extraction when key is set), Browser Use key support
- [x] Responsive Mobile / iPad / Desktop · PWA manifest, service worker, offline fallback & install
- [x] **51 automated functional tests passing** (`tests/smoke-test.js`) + HTTP smoke test

## 🚀 Run locally

```bash
cd n-space
python3 -m http.server 8000 --bind 0.0.0.0
# open http://localhost:8000  ·  Nova Studio: http://localhost:8000/#nova
```

## ☁️ Production deployment

Static hosting anywhere — drag `n-space/` (or `n-space-deploy.zip` contents) onto **Netlify Drop**, or `npx vercel deploy`, GitHub Pages, Cloudflare Pages. HTTPS (free on all) enables PWA install + fullscreen mode.

## 🔑 Going live with real AI

1. **Gemini** — Settings → paste a Google AI Studio key. Chat goes live (gemini-2.0-flash with workspace context) and Nova's cloner gains **vision OCR** for photos/scans.
2. **Browser Use Cloud** — key is stored & detected; in production route cloud sessions through a small backend proxy so keys stay server-side.
3. **Sync (roadmap)** — swap the single `DB`/`save()` localStorage store for Supabase/Firebase; the v1.0→v1.1 automatic migration in `app.js` shows the pattern.

## 🧪 Testing

```bash
cd n-space && npm i jsdom && node tests/smoke-test.js   # 51 checks
```
Covers: boot, orbit (10 agents), all 19 views, chat intents (EN/বাংলা), Nova canvas (2×A4, seal, real QR, VM-ref, timeline), cloner text extraction from real PDF bytes, URL knowledge matching, browser Step/Pause/Stop transport, declutter assertions, persistence, PDF byte validity, ⌘K.

## 📁 Structure

```
n-space/
├── index.html        # Shell: sidebar · workspace · Live Browser · chat bar
├── styles.css        # Quiet Symphony system + editorial A4 engine + mobile shell
├── app.js            # Store, 19 views, Browser sessions/transport, Agent Nova, voice, PWA
├── vendor/qrcode.js  # QR generator (MIT, Kazuhiko Arase) — fully offline
├── manifest.json     # Fullscreen PWA + shortcuts (incl. Nova)
├── sw.js             # Offline-first service worker (v1.1.0)
├── offline.html      # Offline fallback
├── tests/smoke-test.js
├── icons/            # 192 / 512 / maskable / apple-touch
└── assets/           # Sydney imagery (browser mock)
```

---

N Space v1.2.0 · Built for Nasim Ahmed · Dhaka, Bangladesh 🇧🇩 · iOS · Android · Windows · macOS · PWA
