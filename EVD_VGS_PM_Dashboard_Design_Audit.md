# EVD PropCo & VGS Homeland — PM Dashboard
# Full-Spectrum Design & UX Audit + Modernization Blueprint
### Authored by: Senior Product Design + UX Strategy Review
### Date: May 2026 | Version 1.0

---

> **Preface:** This document is the result of a line-by-line audit of the actual HTML/CSS/JS implementation of `PM_Dashboard_v2.html`. Every critique is grounded in specific implementation patterns observed in the code — not generic UI advice. Every recommendation is actionable at the engineering level. This is not a style guide. It is a transformation roadmap.

---

# SECTION 1 — EXECUTIVE DESIGN ASSESSMENT

## Maturity Scorecard

| Dimension | Score | Rationale |
|---|---|---|
| **UI Maturity** | 5.5 / 10 | Competent, consistent dark UI but lacks depth, elevation hierarchy, and visual sophistication beyond its template origins |
| **UX Maturity** | 5.0 / 10 | Navigation and information architecture are logical but workflows are passive — the system reports, it does not guide |
| **Enterprise Readiness** | 4.5 / 10 | Critically limited by single-file architecture, localStorage persistence, no auth layer, no audit trail, no real collaboration |
| **Scalability** | 2.5 / 10 | A single monolithic HTML file with data hardcoded in a SAMPLE object is the most unscalable frontend pattern possible |
| **Visual Sophistication** | 5.0 / 10 | The dark mode foundation is good; glassmorphism gestures exist but are skin-deep; no elevation system, no depth |
| **Accessibility** | 2.0 / 10 | Almost entirely absent — no ARIA labels, no landmark roles, no focus management, no skip links, no screen reader support |
| **AI-Native Readiness** | 2.5 / 10 | The AI panel is a cosmetic feature — keyword matching with hardcoded responses. There is no real intelligence layer |

---

## What Currently Feels Outdated

**1. The table-dominant information architecture.** Eight out of sixteen pages render their primary content as a standard HTML table. Tables are the correct pattern for dense tabular data, but when every entity type — risks, issues, visits, meetings, documents, procurement, RFIs, payments, and punchlist — is represented as a table with the same visual treatment, the interface becomes cognitively flat. There is no differentiation between high-stakes content (a critical risk rated "9" with no mitigation) and routine content (a completed milestone). Every row has equal weight.

**2. The topbar's dual dropdown filter pattern.** The Company filter and Project filter sitting as bare `<select>` elements in the topbar is a 2015 pattern. It assumes the user knows which company and project they want before navigating, when in reality, modern PM dashboards are context-aware — they show you what is relevant based on your role, urgency signals, and recent activity.

**3. The AI panel as a chat sidebar.** The AI panel is a right-side slide-in drawer containing a chat interface. This is the most common, most misused, and least effective AI integration pattern in 2026. It is "AI as feature" rather than "AI as substrate." The intelligence is not woven into the surface — it is isolated, optional, and feels bolted on. The hardcoded chip responses (`aiChip('View River Park Issues')` triggers a template response) confirm this is a simulation of intelligence, not a real capability.

**4. The shimmer animation on the wordmark.** `animation: shimmer 3s linear infinite` on the `EVD·VGS` logo badge creates a perpetual, looping, attention-grabbing gradient sweep. Animated branding elements in application chrome are a pattern from the early 2020s mobile app era. In a professional command center used by executives and project managers during high-stakes moments, this animation is noise that competes with actual data signals.

**5. Font size fragmentation.** The CSS contains font sizes at: 10px, 11px, 12px, 13px, 14px, 15px, 16px, 18px, 20px, 22px, 32px, 36px, 40px. That is thirteen distinct sizes with no governing scale. The result is a typographic system that reads as ad hoc — because it is. There is no modular scale, no intentional rhythm, no grid-based spacing.

**6. KPI card visual monotony.** All five KPI cards share identical visual treatment — same background gradient, same border opacity, same padding, same accent-line top border. The only differentiator is the value text. Cards representing ₦8.49bn in total investment and 13 open critical risks look identical to cards representing "4 completed" projects. There is no visual weight hierarchy communicating importance.

---

## What Already Works Well

**The CSS custom property foundation is genuinely strong.** The token set — `--bg`, `--bg-2`, `--bg-3`, `--card`, `--text`, `--text-2`, `--text-3`, `--muted`, `--accent`, `--border`, `--shadow`, `--r`, `--r-lg`, `--r-xl` — is well-named and semantically coherent. The light mode override (`body.light { ... }`) that swaps all variables cleanly is exactly the correct architecture for a theme system. This is a solid foundation to build a proper design token system on top of.

**The badge system is comprehensive and semantically rich.** Twenty-eight badge variants covering status, priority, document state, RFI state, payment state, and company affiliation. The naming convention (`b-on_track`, `b-critical`, `b-ifc`, `b-overdue`) is consistent. The color philosophy — muted backgrounds with colored text and subtle borders — is the correct pattern for data-dense tables.

**The command palette (⌘K) is a high-value feature that is correctly implemented.** Keyboard-accessible, overlay with blur backdrop, arrow key navigation, category labels, footer hints. This is a modern SaaS pattern that most construction PM tools do not have. It signals product-company thinking.

**The breadcrumb + page title pattern in the topbar is correct.** Having both a page title and a breadcrumb trail in the topbar is proper wayfinding for a multi-page application, and the implementation is clean.

**The inline SVG icon system is the right call.** Using inline SVGs (all from the Lucide icon set) means zero external dependency, zero flash-of-icon-font, perfect color inheritance via `currentColor`, and perfect scaling. This is the modern standard.

**The real project data creates genuine domain credibility.** The dashboard contains real construction data — actual Nigerian project names, real BoQ figures (₦2.93bn PAU contract), real milestone states, real RFI subjects, real contractor names. This is not lorem ipsum. The system is genuinely useful to its user, which means the design work has a real, high-stakes context to improve.

---

## What Creates Cognitive Overload

**The sidebar has sixteen navigation items across seven sections in a 220px column.** A first-time user encounters: Portfolio Dashboard, Projects, Schedule & Milestones, Budget & Costs, Risk Register, Issues Register, Site Visits, Meetings & Minutes, Monthly Reports, Document Register, AI Co-Pilot, Procurement Tracker, RFI Tracker, Payment Certs, Handover & Punchlist, Document Wizard. That is sixteen destinations with zero visual hierarchy beyond ALL CAPS section labels in `--muted` color. The cognitive load of parsing this list before knowing where to go is significant. There is no concept of "primary actions" vs "reference modules."

**Every page opens with its full data set.** Navigate to Risk Register — all risks for all projects. Navigate to Documents — all 32 documents. Navigate to RFI — all RFIs. There is no progressive disclosure, no "most relevant first" ranking, no AI-powered prioritization. The user must mentally filter everything themselves.

**The Dashboard page presents: 5 KPI cards, 2 company comparison blocks, 2 charts, and a project grid — all at once.** On a laptop screen, this is approximately 8-10 scroll positions of content, all presented at the same visual hierarchy level. The user's eye has no clear starting point.

---

## What Breaks Immersion

**`localStorage` as the persistence layer.** The line `let DATA = {}` loaded from `localStorage.getItem(STORAGE_KEY)` means every data entry is device-local, volatile, and siloed. If Segun opens this on his phone after updating it on his laptop, the data is different. This is not a minor technical concern — it fundamentally undermines enterprise trust. Any serious construction PM tool must have server-side persistence.

**The `doc-preview` element renders as a white box inside a dark dashboard.** The document wizard generates a white-background document preview (`background:#fff; color:#1e293b; font-family:Georgia,serif`) that appears inside the dark interface as a jarring white rectangle. This breaks the visual immersion completely and signals that the document generation system was added as an afterthought without design consideration for its container environment.

**The AI "responses" are template strings.** When a user clicks "Budget Summary," the AI returns a pre-written string about the current budget state pulled from the DATA object. This is not AI — it is a template renderer with an AI aesthetic. For a Head of Projects managing ₦8+ billion in active construction, this deception erodes trust the moment it becomes apparent.

**The `btn-add` button in the topbar that says "+ Add" opens a generic modal that asks "What would you like to add?" with a type selector.** This pattern — a single undifferentiated "add" action — is the opposite of contextual design. On the Risk Register page, the + Add button should immediately open a "New Risk" form. On the Payment Certs page, it should open an IPC form. The current implementation adds cognitive friction at the exact moment the user needs speed.

---

## What Feels Premium vs Amateur

**Premium:** The modal entrance animation (`cubic-bezier(0.34, 1.56, 0.64, 1)` spring curve), the KPI hover glow effect, the collapsible sidebar with icon-only mode, the toast notification system with directional slide-in, the radial gradient background.

**Amateur:** The `cursor:default` on KPI cards that are also tagged as `cursor:pointer` (conflicting declarations in the same ruleset at lines 97 and 99 of the CSS — a genuine bug), the `font-size: 40px` empty state icon using an emoji, the hardcoded `topbar-meta` date rendered by `document.getElementById('topbar-date').textContent = new Date().toLocaleDateString(...)` with no locale formatting, the `+ Add` generic button, and the static "AI" responses.

---

## What Limits Scalability

The architecture has exactly one scaling ceiling: the single HTML file. As of the current state, the file is approximately 3,500+ lines. Adding a Gantt chart module, a resource allocation matrix, a financial forecasting view, real collaboration features, or a proper AI integration would push this to 8,000-12,000 lines before it becomes unmaintainable. More critically: there is no component abstraction, no module system, no state management beyond global `let DATA = {}`, and no build pipeline. The entire state lives in one mutable global variable that every function reads from and writes to directly.

---

---

# SECTION 2 — MODERN DESIGN DIRECTION

## Design Philosophy Candidates

### Option A: Minimal Enterprise
**Description:** Clean, white/light surfaces, generous whitespace, restrained typography, subtle color. Think Linear, Vercel dashboard, Stripe.
**Pros:** Maximally legible, ages well, low cognitive load.
**Cons:** Does not communicate the operational gravity of construction project management. A ₦2.93bn hostel construction at 22% progress with SPI 0.87 deserves a more serious visual language than what you'd use for a SaaS metrics dashboard.

### Option B: Futuristic AI-Native
**Description:** Dark, glowing, particle effects, animated data streams, bold gradient accents. Think Midjourney UI, AI startup aesthetics.
**Pros:** Feels cutting-edge.
**Cons:** Extremely hard to maintain visual coherence at scale. Becomes exhausting in long work sessions. Completely wrong for a construction industry executive audience in Nigeria who needs to trust the tool above all else.

### Option C: Industrial Construction-Tech Aesthetic
**Description:** Concrete-grey surfaces, orange/amber construction safety accents, technical typography, blueprint-grid textures, robust visual weight.
**Pros:** Domain-authentic. Signals deep industry understanding.
**Cons:** Risks feeling heavy, dark, and inaccessible. Most construction tech tools that have tried this aesthetic (Procore's early UI, construction-focused Jira clones) feel dated quickly because the aesthetic overwhelms the usability.

### Option D: Premium Dark-Mode Command Center (RECOMMENDED)
**Description:** Deep navy/slate foundation (not pure black), calibrated information density, elevation hierarchy through surface depth rather than shadows, brand accent used sparingly, construction-domain color semantics (amber for warnings, orange for EVD brand, teal for VGS brand). Think Linear meets Vercel meets Stripe, but in a construction context.
**Pros:** Matches the existing color foundation. Commands executive trust. Scales cleanly. Works for extended work sessions. Feels modern without being trendy. Can absorb real data at high density without becoming cluttered.
**Cons:** Requires disciplined execution — dark mode systems fail when surface hierarchy is not precise.

### Option E: Tactical Operations Interface
**Description:** Military-grade information display: monospace data, strong grid lines, status indicators as colored blocks, no decorative elements, pure function.
**Pros:** Maximum information density.
**Cons:** Alienating for non-technical stakeholders (e.g., CEO Mrs. Bose Sogunle reviewing PAU progress). Wrong register for a tool that needs to communicate upward to boards and investors.

### Option F: Spatial UI / Foldable-Native
**Description:** Zoomable canvas, spatial arrangement of project cards, drag-to-organize.
**Pros:** Novel and engaging for portfolio views.
**Cons:** Construction PM data does not benefit from spatial metaphors. Critical path and RFI chains are not better understood in 2D space. Overdesigned for the actual workflow.

---

## Recommended Direction: **Premium Dark-Mode Precision Command Center**

This is the intersection of Option A's discipline and Option D's aesthetic gravity. The psychological reasoning:

**Trust engineering.** Construction project managers and executives at the level of "Head of Projects & Properties, Everyday Group" need an interface that communicates institutional credibility. This means: no playful gradients, no decorative animation, no personality-forward copy. The interface must feel like it was built by people who understand the weight of managing ₦8+ billion in active development.

**Cognitive efficiency over aesthetic novelty.** The primary user (Segun Ogunbiyi) opens this tool multiple times per day during high-stakes moments — site visits, board meetings, contractor disputes, bank disbursement reviews. The interface must reduce cognitive load, not add to it. Every design decision must answer: "Does this help the user act faster on the right information?"

**Dark mode for focus.** Extended work sessions in construction project management involve reading dense tables of data. Dark mode with calibrated contrast ratios reduces eye strain and keeps the user's attention on the data rather than the chrome.

**Brand duality as a design feature.** The EVD (orange) and VGS (teal) brand split is already present in the code but underused. This should become a fundamental dimension of the visual language — the portfolio should feel like a unified operating system that intelligently communicates which company's context you are in.

---

## Visual Identity Transformation

**From:** "A well-made dark web dashboard" — competent but generic, could be a cryptocurrency tracker or a DevOps tool.

**To:** "A purpose-built construction intelligence platform" — every visual element communicates domain authority, every data presentation reflects the gravity of managing real-world assets.

**Key visual pillars:**
1. **Surfaces with depth** — three distinct elevation levels using surface color progression (`#0f172a → #1a2236 → #1e2d3d → #243447`) rather than heavy drop shadows
2. **Construction amber as the strategic signal color** — beyond EVD orange, a dedicated amber (`#f59e0b`) that signals schedule and cost risk — the language of construction
3. **Monospace data** — all financial figures, percentages, and dates rendered in a monospace variant (JetBrains Mono or similar) to create visual rhythm in data columns
4. **Structural grid lines** — subtle `1px` dividers with `4%` white opacity that create the feeling of a technical document
5. **Status color discipline** — green/amber/red used ONLY for status signals, never for decoration

---

---

# SECTION 3 — COMPLETE UI/UX REDESIGN STRATEGY

## 3.1 Sidebar

### What is wrong
The current sidebar has sixteen navigation items arranged in seven labeled sections within a 220px column. The section labels ("Overview," "Construction," "Field," "Documents," "Intelligence," "Contracts & Claims," "Closeout") use ALL CAPS 10px text in `--muted` color, which makes them feel like visual separators rather than genuine organizational categories. The sidebar footer shows the user avatar and name but provides no quick actions — no logout, no settings, no profile switch, no keyboard shortcut reminder. When collapsed to 56px, only icons remain with no tooltip labels (the `data-tip` system exists but is not applied to nav items in collapsed mode). The `nav-dot` pulse animation on Risk Register and other nav items signals alerts but the meaning is ambiguous without reading the full label.

### Why it matters
Navigation is the skeleton of any application. Users spend more cumulative cognitive energy processing navigation than any other single UI element. A sidebar that requires scanning sixteen items every time creates an amortized tax on every interaction.

### Modern replacement strategy
**Adopt a three-tier navigation model:**

**Tier 1 — Icon Rail (60px):** A permanent left rail containing only 5-6 macro-destinations: Portfolio (home), Projects, Financials, Documents, Intelligence (AI), Settings. Always visible. No labels. Icons selected for universal recognition.

**Tier 2 — Section Panel (240px):** Slides in from the icon rail hover/click. Shows the sub-navigation for the selected macro-destination. Example: clicking "Projects" opens a panel showing: All Projects, Schedule, Budget, Risks, Issues, Visits, Meetings. This panel is dismissible and has a search/filter field at the top.

**Tier 3 — Context Panel (Right side):** When a specific project is selected, a contextual panel appears on the right showing: project health score, upcoming milestones, critical alerts, quick-add actions. This is where AI-powered suggestions live.

**Simpler alternative if full rebuild is not feasible:** Reduce the sidebar to two visual tiers — primary items (Dashboard, Projects, AI Co-Pilot) shown with full color treatment, and secondary items (all others) shown in a collapsed, indented sub-group under their primary parent. Add `data-tip` tooltips to all items in collapsed mode. Remove the pulse animation from nav items — use numeric badges only.

### UX psychology
The "magical number 7 ± 2" (Miller's Law) tells us that humans can hold approximately 7 items in working memory. Sixteen navigation items far exceeds this threshold. Grouping items into 5-6 primary destinations with secondary expansion matches human cognitive architecture.

### Animation recommendations
- Section panel slide-in: `300ms cubic-bezier(0.4, 0, 0.2, 1)` (Material standard easing)
- Icon rail hover: `150ms ease` background fill
- Active indicator: `200ms` slide from previous position to current (like Linear's sidebar active state)
- Collapse/expand: `250ms cubic-bezier(0.4, 0, 0.6, 1)` with width interpolation

### Accessibility considerations
- All nav items need `role="link"` or proper `<a>` elements with `href="#"` for keyboard navigation
- Section headings need `role="group"` + `aria-label`
- Collapsed icons need `aria-label` for screen readers
- Active item needs `aria-current="page"`

---

## 3.2 Navigation System

### What is wrong
Navigation is implemented as `onclick="nav('pageName')"` JavaScript function calls on `<div>` elements. This is semantically wrong — navigation should use `<a>` or `<button>` elements. The `nav()` function manually manages active states using `querySelectorAll` and `classList` manipulation. There is no URL routing — navigating to "Risk Register" does not change the URL, meaning the user cannot bookmark a specific view, share a link to a specific page, use browser back/forward buttons, or refresh without losing their location. The project filter state is also URL-independent, so every refresh loses context.

### Modern replacement strategy
Even without a full React migration, URL hash-based routing (`#risks`, `#documents`, `#rfi`) would preserve navigation state. The URL pattern `#rfi?project=p4&status=open` would restore the user's exact filtered view on refresh.

For the full redesign: implement proper SPA routing with `history.pushState()` at minimum, or a routing library if migrating to React/Vue.

---

## 3.3 Dashboard Layout

### What is wrong
The dashboard opens with a full dump of everything: 5 KPIs, 2 company comparison blocks, 2 charts, 1 project grid. There is no visual hierarchy — all elements have similar visual weight. The `grid-template-columns: repeat(5,1fr)` KPI row forces all five cards to the same width regardless of screen size, meaning the "₦8.49bn Portfolio Value" card has the same real estate as the "4 Completed" card. The two chart cards (`Project Status Distribution` and `Budget Utilisation (₦bn)`) are sized by height constraint only (`height:180`) — on ultrawide screens they become wide, shallow rectangles that waste space; on mobile they become unreadable.

### Modern replacement strategy

**Hero KPI strip:** Top row shows 3 (not 5) primary metrics with significantly larger type — Portfolio Value, Schedule Performance Index (portfolio average), and Critical Items Requiring Action (a roll-up of critical risks + overdue RFIs + critical punchlist items). These are the three numbers an executive needs to understand portfolio health in under 3 seconds.

**Secondary KPI row:** The remaining metrics (projects by status, budget utilization) in a smaller, 4-column row below.

**Intelligence banner:** A single-line alert strip showing the most critical active alert: `⚠ River Park: ECS commissioning blocked — 27 days to final completion target` or `🔴 PAU Hostel: Cube test results overdue (Due: 11 May)`. This strip should always show the single highest-priority item across all projects, with a "View all alerts" link. This follows the "inbox zero" model — reduce the most important signal to a single line and let the user decide to expand.

**Portfolio grid:** Project cards below, with a toggle between card view (default) and list view for density preference.

**Contextual charts:** Charts should only appear in the section where they are relevant. Status distribution belongs in the Projects page. Budget utilization belongs in Budget & Costs. The Dashboard should show sparklines inside project cards, not standalone charts.

### UX psychology
The F-pattern and Z-pattern eye tracking research consistently shows that users scan horizontally across the top of a screen first, then down the left side. The dashboard should place the most critical information in the top-left zone (critical alerts, primary KPI), with supporting information in the secondary zone (charts, trends), and contextual detail in the exploratory zone (project grid).

---

## 3.4 KPI Cards

### What is wrong
The current KPI cards show: value (32px font-weight-800), label (11px uppercase), and subtitle (11px muted). There is no trend indicator — no sparkline showing whether ₦8.49bn is up or down from last month. There is no target/actual comparison. The cards are identical in visual treatment regardless of the semantic meaning of the value they represent. A "critical risks" count of 13 looks the same as a "completed projects" count of 1.

A subtle bug: the CSS contains `.kpi{cursor:default}` at line 97 and `.kpi{cursor:pointer}` at line 99 — two conflicting declarations in the same selector. The latter wins due to cascade order, making all KPI cards show pointer cursor, but clicking them does nothing meaningful in most cases.

### Modern replacement strategy

**Differentiated semantic treatment:**
- Critical/at-risk KPIs (open risks count, overdue RFIs, critical punchlist): `border-left: 3px solid var(--red)` with a subtle red glow on hover
- Financial KPIs (portfolio value, budget utilization): `border-left: 3px solid var(--accent)` 
- Positive KPIs (completed projects, on-track milestones): `border-left: 3px solid var(--green)`

**Trend indicators:** A small inline sparkline (7-point) using a lightweight canvas or pure CSS implementation showing the directional trend of each metric. For a budget utilization KPI: is spend rate accelerating or stabilizing?

**Target bands:** Where a target exists (schedule performance target: SPI ≥ 1.0), show a horizontal reference line on the sparkline and a delta value (`-0.13 SPI vs target`).

**Click-through:** Clicking a KPI card should navigate to the relevant section with the filter pre-applied. Clicking "13 Critical Risks" → Risk Register filtered to critical + open. This transforms KPI cards from read-only displays into navigation shortcuts.

### Animation
KPI values should animate in using a count-up animation on first load (`0 → 8.49bn` over 800ms with `ease-out`). This creates a "dashboard coming to life" moment. Do NOT loop this animation — it is a load-once effect only.

---

## 3.5 Tables

### What is wrong
All tables share identical visual treatment — no sorting UI, no column resizing, no row-level actions beyond a pencil/trash icon at the far right (which the user cannot easily reach without horizontal scrolling on mobile). The table headers use 10px uppercase text in `--muted` — while this is a common pattern, at 10px it tests the accessibility floor for many users. Row hover state is a barely-visible `rgba(255,255,255,0.02)` — at that opacity level on dark backgrounds, it is functionally invisible. Column widths are not optimized — the Notes/Description columns often contain long strings that compress other columns.

### Modern replacement strategy

**Sortable column headers:** An up/down arrow appearing on hover, with the active sort column highlighted. Sort state should persist per-table in the session.

**Row-level action reveal:** Instead of static edit/delete icons occupying permanent column space, use a right-click context menu or a three-dot menu that appears on row hover, positioned within the row.

**Sticky first column:** In tables with many columns (Risk Register has 10 columns, Document Register has 13), pin the first meaningful column (project name or item title) to the left so horizontal scrolling does not cause the user to lose row context.

**Row expansion:** Clicking a row should expand it inline to show the full description/notes content without a modal — a pattern pioneered by Linear and Notion. This reduces modal fatigue significantly.

**Density selector:** A small toggle in the table action bar switching between Compact (padding: 8px 12px), Default (12px 16px), and Comfortable (16px 20px) row heights. Different users have different density preferences.

**Virtualized rendering:** For the Document Register (32 documents) and Risk Register (potentially hundreds of rows), implement virtual scrolling. Only render the rows that are visible in the viewport. This is critical for performance at scale.

---

## 3.6 Charts

### What is wrong
The chart implementation uses `<canvas>` elements with Chart.js, but based on the HTML structure, only two charts exist on the main dashboard: `statusChart` (doughnut, project status distribution) and `budgetChart` (bar, budget utilization). The rest of the system — risk register, payment certs, procurement, schedule — has no visualization. Given the richness of the data, this is a significant missed opportunity.

The Chart.js default colors and styling are not overridden to match the design system, meaning the charts likely appear with bright primary colors that contrast poorly with the dark background.

### Modern replacement strategy

**Chart.js should be replaced with Recharts (React) or Apache ECharts** for the production version, both of which support theming, responsiveness, animated transitions, and more chart types.

**For the current vanilla JS implementation:** Switch to **Chart.js with a custom global theme object** that maps all colors to the design system tokens. Specifically:
```javascript
Chart.defaults.color = 'rgba(148, 163, 184, 1)'; // --text-3
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.06)'; // --border
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 11;
```

**New charts needed across the system:**

| Page | Chart Type | Data |
|---|---|---|
| Dashboard | Area sparklines in KPI cards | Weekly trend of critical items |
| Dashboard | Horizontal progress bars | Portfolio SPI by project |
| Budget | Waterfall chart | Approved contract → variations → forecasted final cost |
| Budget | Stacked area | Cumulative spend vs. baseline S-curve |
| Schedule | Gantt chart | Milestone timeline (critical) |
| Risks | Heat map matrix | Probability × Impact grid |
| Payments | Progress timeline | IPC history and projected final payments |
| Procurement | Treemap | Contract value by vendor/category |
| Handover | Donut | Punchlist completion by priority |
| AI Copilot | Radar chart | Project health across 6 dimensions |

---

## 3.7 Modals

### What is wrong
All forms across the application use a single generic modal system (`modal-overlay` + `modal-content`). The modal HTML is injected as a string via JavaScript: `document.getElementById('modal-content').innerHTML = ...`. This pattern works but has critical issues: injected HTML does not preserve form focus, accessibility tools cannot discover form elements that don't exist in the initial DOM, and form validation is manual string comparison with no native browser support.

The modal width is fixed at `560px` — appropriate for small forms but cramped for the complex Meeting form (which contains agenda, minutes, actions, attendees, next meeting date) or the Document registration form (13 fields).

### Modern replacement strategy

**Modal sizing tiers:**
- Small (400px): Confirmation dialogs, single-field quick edits
- Default (560px): Standard forms with ≤6 fields
- Large (720px): Complex forms (meetings, documents, procurement)
- Full-height drawer (right side, 480px wide): For wizard-style flows and multi-step processes

**Retained DOM modals:** Rather than injecting HTML on demand, pre-render all modals in the DOM with `display:none` and activate them with class toggles. This enables proper focus management and accessibility.

**Smart defaults:** When opening "New Risk" from the Risk Register while filtered to PAU project, the Project dropdown should pre-select PAU. Context should flow downstream into forms.

**Inline validation:** Field-level validation with inline error messages (`border-color: var(--red)` + error text below the field) replacing or supplementing the current `alert()` dialogs.

### Animation
Current: `modalIn` with `scale(0.95) → scale(1)` and `translateY(8px) → 0`. This is good. Refinement: add an `opacity` fade on the overlay from 0 to 1 over `200ms` separately from the modal container, creating a two-layer animation where the backdrop settles before the modal completes.

### Accessibility
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to the modal title
- Focus trap: Tab key should cycle through form fields without leaving the modal
- Escape key closes: already implemented, good
- `aria-live="polite"` on error messages

---

## 3.8 AI Panel

### What is wrong
The AI panel is a 360px right-side drawer with a chat interface, four hardcoded chip buttons, and a text input. When a user clicks a chip or types a query, the `sendAIMessage()` function runs `generateAIResponse(message)` which performs basic keyword matching against the DATA object and returns a pre-written template string. This is honest in its simplicity but critically misrepresents AI capability. More importantly, it is structurally limited: the panel can only respond to explicit queries. It cannot proactively surface insights. It cannot learn. It cannot generate documents. It cannot detect that a project's SPI is deteriorating.

The panel appears over the main content on the right side. On a laptop (1366×768 — the most common enterprise laptop resolution), opening the AI panel covers approximately 26% of the main content area. On mobile, it is effectively full-screen.

### Modern replacement strategy
See Section 6 for the full AI transformation blueprint. At the UI level:

**Transform from panel to contextual layer.** The AI should not be a sidebar — it should be a dimension of every surface. Every KPI card, every table row, every risk item should have an AI context button (small `✦` icon) that triggers an inline popover with AI-generated insight specific to that entity.

**The chat interface should become an AI Command Center** — a full page accessible via the nav, where the user can have extended AI conversations, request report generation, query across all project data, and receive proactive briefings.

**The FAB (`ai-fab`) should become an ambient intelligence indicator** — always visible, pulsing gently when new AI insights are available (like an unread notification badge), expanding on click to show the top 3 proactive insights before offering a full chat.

---

## 3.9 Command Palette

### What is wrong
The command palette is well-implemented but limited in scope. Its command set (`CMD_ITEMS`) covers navigation and theme toggle but does not include: create new entities (New Risk, New RFI), filter actions (Show critical risks, Filter to PAU project), AI queries (Ask AI about budget), or recently viewed items.

### Modern replacement strategy
Expand to three modes accessible via the same ⌘K trigger:

**Navigation mode (default):** All pages, all projects by name
**Action mode (> prefix):** "› New Risk", "› Generate Report", "› Export to PDF", "› Filter to River Park"
**AI query mode (? prefix):** "? What is the current SPI for PAU?", "? Which projects are at risk of delay?", "? Summarize this week's open RFIs"

The keyboard shortcut hint in the topbar should show the current mode (`⌘K navigate`, `⌘K › action`, `⌘K ? ask AI`) and cycle between them.

---

## 3.10 Forms

### What is wrong
Form labels use 10px uppercase monochrome text (`color: var(--muted)`). At 10px, these labels test the WCAG minimum contrast requirement for small text (4.5:1) and may fail on some monitors. The form inputs have a minimal focus state (border-color change + subtle box-shadow) but no clear visual indicator when an input is active vs. inactive beyond the border color. Textarea fields have `min-height: 80px` — fine for short notes but inadequate for meeting minutes that may span hundreds of words.

### Modern replacement strategy

**Floating label pattern:** Labels start as placeholder text inside the input and float upward to a 10px label position when the field is focused or has a value. This reduces vertical space while maintaining label visibility.

**Field grouping with visual hierarchy:** Related fields (e.g., Probability + Impact on the Risk form) should be visually grouped with a subtle background tint and a connector element.

**Smart inputs:** Date fields should use a custom date picker that understands Nigerian construction context — highlighting weekends and suggesting "next working day" for due dates. Financial inputs should auto-format to naira notation (`₦1,234,567`) as the user types.

---

## 3.11 Wizards

### What is wrong
The Document Wizard is the most sophisticated UX flow in the system — a multi-step process for generating construction documents. The current wizard renders step indicators as a horizontal row of numbered circles connected by `2px` lines. The step labels are visible on desktop but lost on mobile. The wizard generates documents via template string concatenation and renders them in a `.doc-preview` white box. The print functionality requires `window.print()` — there is no PDF export, no download, no email distribution.

### Modern replacement strategy

**Vertical stepper for complex wizards:** For wizards with 4+ steps, a left-side vertical stepper provides more label space and better mobile behavior than a horizontal step bar.

**Live preview split-view:** As the user fills in wizard fields, a real-time document preview updates in a right-side panel. Changes are reflected immediately using a `debounce(500ms)` input handler.

**Document templates as first-class objects:** Templates should be stored as structured objects (not raw HTML strings) with field definitions, so they can be easily edited, versioned, and extended without HTML manipulation.

**Export options panel:** After generation, offer: Print, Download PDF, Copy to Document Register, Share Link, Email to Stakeholders.

---

## 3.12 Project Cards

### What is wrong
Project cards have a good structure: status color strip at top, project name, badges (company, status), metadata line (location, contractor, PM), progress bar, and progress label. However, the cards are static — they show no trend data, no upcoming deadline, no critical alert count, no AI-generated risk signal. A project at 22% progress (PAU Hostel) with SPI 0.87 looks nearly identical to a project at 94% (River Park) except for the progress bar length. There is no visual urgency communication.

### Modern replacement strategy

**Project card as a project health dashboard in miniature:**
- Status strip: 4px top border (current) → upgrade to a full left-side border (8px) that is far more visually impactful
- Primary metric: Show the most critical number for each project. For at-risk projects: days to deadline. For on-track projects: completion percentage. For not-started: days until planned start.
- AI health signal: A single color-coded dot with a tooltip showing the AI-calculated health score (based on SPI, open risks, pending RFIs, budget status)
- Quick stats: Three small inline counts — open risks, open RFIs, outstanding punch items — with color coding
- Sparkline: A 7-point mini chart showing weekly progress rate

**Hover state:** On hover, the card should expand vertically by ~60px (smooth transition) to reveal the last site visit date, last meeting date, and next milestone. This progressive disclosure keeps the default view clean while providing depth on demand.

---

## 3.13 Mobile Responsiveness

### What is wrong
The mobile breakpoints at 900px and 540px exist and collapse grids correctly. However, the core mobile experience has critical issues: the topbar retains the project filter `<select>` at 540px (hidden at max-width:540px only). Tables have `overflow-x:auto` but on mobile this creates awkward horizontal scroll areas with no visual indicator that content extends beyond the viewport. The AI panel at 360px width is effectively full-screen on a 390px iPhone — it needs a full-screen modal treatment on mobile. The `ai-fab` button is 40px diameter — below Apple's recommended 44px minimum touch target.

### Modern replacement strategy
See Section 8 for the complete responsive strategy.

---

## 3.14 Notification Systems

### What is wrong
Toast notifications exist and are well-implemented. Navigation dots (`nav-dot` pulse animation) signal activity on Risk Register and Issues. Navigation count badges (`nav-count`) show numeric counts. But there is no notification center — no persistent log of what happened, what changed, what requires action. The pulse animation on nav dots is continuous, meaning it becomes background noise after the first 30 seconds of use.

### Modern replacement strategy

**Notification center** accessible via a bell icon in the topbar. Shows: time-stamped list of alerts, sorted by priority and recency. Categories: Critical Actions Required, System Updates, Upcoming Deadlines, Resolved Items. A red badge on the bell icon shows the unread count.

**Smart alert suppression:** The pulse animation should only activate when a new item enters the critical/overdue state (within the last 24 hours), not perpetually. Once the user has visited the relevant section, the pulse stops.

**Proactive push-style alerts:** "IPC-RP-005 has been pending board sign-off for 18 days — action required" appearing as a banner at the top of the relevant project view.

---

## 3.15 Empty States

### What is wrong
The current empty state is: `<div class="empty">No records found.</div>` — plain text centered in the table area. There is a more sophisticated `.empty-state` class defined in the CSS with an icon, heading, description, and CTA button, but it is not used in the actual render functions. Instead, all render functions fall through to the basic `.empty` class.

The `.empty-state-icon` uses `font-size:40px; opacity:0.5` emoji — at 40px, emojis render inconsistently across operating systems (different appearance on Windows vs macOS vs Android).

### Modern replacement strategy

**Contextual empty states** with specific copy for each entity type:
- Risk Register empty: "No risks logged yet — add your first risk to start tracking project exposure"
- RFI empty filtered state: "No open RFIs for River Park — all requests have been resolved"
- Punchlist empty: "No outstanding punch items — this project is clear for handover"

**SVG illustrations (not emojis):** Small, simple, on-brand SVG illustrations that reinforce the construction domain. A blueprint grid pattern, a construction helmet icon, a document stack. Keep them to 64×64px and use design system colors.

**Dual CTA:** Empty states should offer both a primary action ("+ Add Risk") and a secondary educational action ("Learn about risk registers →").

---

## 3.16 Search Experience

### What is wrong
Search exists within individual modules (Document Register has a search input, Handover has a search input) but there is no global search. The command palette is the closest thing to global search, but it only searches page names, not entity content. A user cannot search for "Bezal Engineering" and see all associated documents, RFIs, meetings, and procurement records.

### Modern replacement strategy

**Global entity search** via the command palette or a dedicated search modal (`⌘F` or a search icon in the topbar):
- Searches across: projects, risks, issues, documents, RFIs, payments, meetings, vendors
- Shows results grouped by entity type
- Each result shows: entity name, project, status, date
- Keyboard navigable with preview pane on the right showing the selected item

**Semantic search** (AI-powered): "Show me everything related to the generator overheating" finds not just documents with "generator" in the title but also related RFIs (RFI-RP-002), punchlist items (P-RP-002), site visits with generator observations, and meeting minutes mentioning the OEM.

---

---

# SECTION 4 — ELITE DESIGN SYSTEM SPECIFICATION

## 4.1 Typography System

### Font Pairing

**Primary:** `Inter` (existing) — retained for UI chrome, form elements, navigation, body text. Inter is specifically designed for screen readability at small sizes and has excellent OpenType features.

**Accent/Data:** `JetBrains Mono` or `IBM Plex Mono` — for all numerical values, financial figures, certificate numbers, RFI numbers, document revision codes. Using a monospace font for data creates visual alignment in tables and signals that these values are precise data points, not prose.

**Display (optional for executive reports):** `Instrument Serif` or `DM Serif Display` — for generated document headers and monthly report headings only. Provides a sense of institutional authority. Not used in application chrome.

### Type Scale

Use a **1.25 modular scale** (Major Third):

```
xs:   10px  / 0.625rem   — Table headers, badge labels, metadata
sm:   11px  / 0.6875rem  — Nav section labels, form labels, captions
base: 13px  / 0.8125rem  — Body text, table cells, descriptions (base)
md:   14px  / 0.875rem   — Nav items, button text, card body
lg:   16px  / 1rem       — Modal titles, section headings
xl:   20px  / 1.25rem    — Page titles (topbar)
2xl:  24px  / 1.5rem     — Dashboard section headings
3xl:  32px  / 2rem       — Primary KPI values (large screen)
4xl:  40px  / 2.5rem     — Hero KPI values (portfolio total)
```

**Crucially:** All financial values and percentages in KPI cards and table cells should use JetBrains Mono. The visual distinction between `₦8.49bn` in Inter and `₦8.49bn` in JetBrains Mono is subtle but powerful — it makes numbers feel precise and trustworthy.

### Font Weight System

```
Regular:    400  — Body text, descriptions, table cell content
Medium:     500  — Nav items, form placeholders, secondary labels
Semibold:   600  — Button text, column headers, nav labels
Bold:       700  — Modal titles, section headings, card titles
Extrabold:  800  — KPI values, critical metrics, hero numbers
```

### Spacing Rhythm

**Line heights:**
- Dense data (table cells): 1.4
- Body text / descriptions: 1.6
- Display headings: 1.1

**Letter spacing:**
- Body text: 0 (never negative for body)
- Uppercase labels: `0.05em` (0.6-0.8px for 12px text)
- Display headings: `-0.02em` (subtle tightening for large sizes)
- KPI values: `-0.03em` (tighter for large financial numbers)

---

## 4.2 Color System

### Primary Palette (Dark Mode Foundation)

```css
--gray-950: #020617;    /* Deepest background, only for true blacks */
--gray-900: #0f172a;    /* Primary background (current --bg) */
--gray-850: #131e2e;    /* Sidebar background */
--gray-800: #1a2236;    /* Card background (elevated from bg) */
--gray-750: #1e2d3d;    /* Hover state on cards */
--gray-700: #243447;    /* Secondary card, active selection bg */
--gray-600: #2d4057;    /* Dividers, subtle borders */
--gray-500: #3d5169;    /* Visible borders */
--gray-400: #526172;    /* Disabled text backgrounds */
--gray-300: #64748b;    /* Muted text (current --muted) */
--gray-200: #94a3b8;    /* Secondary text (current --text-3) */
--gray-100: #cbd5e1;    /* Secondary text bright (current --text-2) */
--gray-50:  #f1f5f9;    /* Primary text (current --text) */
```

### Semantic Palette

```css
/* STATUS COLORS — Never used decoratively */
--success-dim:    rgba(34,197,94,0.08);
--success-border: rgba(34,197,94,0.25);
--success-text:   #4ade80;
--success-solid:  #22c55e;

--warning-dim:    rgba(245,158,11,0.08);
--warning-border: rgba(245,158,11,0.25);
--warning-text:   #fcd34d;
--warning-solid:  #f59e0b;

--danger-dim:     rgba(239,68,68,0.08);
--danger-border:  rgba(239,68,68,0.25);
--danger-text:    #fca5a5;
--danger-solid:   #ef4444;

--info-dim:       rgba(59,130,246,0.08);
--info-border:    rgba(59,130,246,0.25);
--info-text:      #93c5fd;
--info-solid:     #3b82f6;

--purple-dim:     rgba(168,85,247,0.08);
--purple-border:  rgba(168,85,247,0.25);
--purple-text:    #d8b4fe;
--purple-solid:   #a855f7;
```

### AI Palette

```css
/* The AI palette should feel distinct from both semantic colors and brand colors.
   It signals intelligence, not status. Use violet-to-indigo spectrum. */
--ai-core:        #7c3aed;    /* Deep violet — AI identity */
--ai-bright:      #8b5cf6;    /* Mid violet — AI accents */
--ai-light:       #a78bfa;    /* Light violet — AI text */
--ai-glow:        rgba(139,92,246,0.2);
--ai-surface:     rgba(124,58,237,0.08);
--ai-border:      rgba(139,92,246,0.2);

/* AI gradient — for AI panel headers, AI badge, AI response bubbles */
--ai-gradient: linear-gradient(135deg, #7c3aed, #6366f1, #4f46e5);
```

### Construction-Tech Palette

```css
/* Domain-specific colors that communicate construction context */
--construction-amber:  #f59e0b;   /* Schedule/timeline warning */
--construction-steel:  #475569;   /* Structural/inactive elements */
--construction-concrete: #334155; /* Heavy surface alternative */
--construction-site:   #92400e;   /* High-alert / dangerous condition */

/* Brand identity colors */
--evd-orange:          #f97316;   /* EVD PropCo / Everyday Group */
--evd-orange-dim:      rgba(249,115,22,0.1);
--evd-orange-border:   rgba(249,115,22,0.25);
--vgs-teal:            #14b8a6;   /* VGS Homeland */
--vgs-teal-dim:        rgba(20,184,166,0.1);
--vgs-teal-border:     rgba(20,184,166,0.25);
```

### Surface Layering System (Elevation)

The dark mode system uses surface color progressions to communicate depth without heavy shadows:

```
Level 0 — Base:       #0f172a  (page background)
Level 1 — Raised:     #131e2e  (cards, panels)
Level 2 — Floating:   #1a2236  (dropdowns, tooltips over cards)
Level 3 — Overlay:    #1e2d3d  (modals, popovers)
Level 4 — Max:        #243447  (focused/active elements above overlays)
```

**Elevation rule:** An element at Level N should ONLY appear on a surface at Level N-1 or lower. A tooltip (Level 2) should never appear floating over a modal (Level 3) — this breaks depth perception.

**Shadow use:** Shadows are used only for Level 3+ elements (modals, command palette). Cards (Level 1) use border + slightly elevated background color instead of shadows. This is more performant and more precise.

---

## 4.3 Spacing System

### Base Unit: 4px

All spacing values are multiples of 4px:

```
--space-1:   4px    /* Minimal — between inline elements */
--space-2:   8px    /* Tight — within components */
--space-3:   12px   /* Compact — between related items */
--space-4:   16px   /* Default — standard component spacing */
--space-5:   20px   /* Relaxed — card padding */
--space-6:   24px   /* Content gap */
--space-8:   32px   /* Section gap */
--space-10:  40px   /* Large section gap */
--space-12:  48px   /* Page section padding */
--space-16:  64px   /* Hero spacing */
--space-20:  80px   /* Full section padding */
```

### Grid System

**12-column grid** with `24px` gutters on desktop, `16px` on tablet, `12px` on mobile:

```css
--grid-columns: 12;
--grid-gutter:  24px;
--grid-margin:  24px;  /* Content area left/right padding */
```

**Layout zones:**
- Full-width: 12 columns — page headers, alert banners
- Primary content: 8 columns — main tables, charts, project grids
- Secondary/sidebar: 4 columns — AI insights, project summary, quick actions
- KPI row: 3 columns each (4 KPIs) or 2.4 columns (5 KPIs)

### Responsive Breakpoints

```css
--bp-sm:   480px   /* Mobile portrait */
--bp-md:   768px   /* Mobile landscape / tablet portrait */
--bp-lg:   1024px  /* Tablet landscape / small laptop */
--bp-xl:   1280px  /* Standard laptop */
--bp-2xl:  1536px  /* Large desktop */
--bp-3xl:  1920px  /* Ultrawide */
```

---

## 4.4 Component System

### Buttons

**Primary (CTA):**
```css
background: var(--accent);           /* #6366f1 */
color: #ffffff;
padding: 8px 20px;
border-radius: 8px;
font-size: 13px; font-weight: 600;
box-shadow: 0 1px 2px rgba(0,0,0,0.3), 0 0 0 1px rgba(99,102,241,0.3);

/* Hover */
background: #4f46e5;
box-shadow: 0 4px 12px rgba(99,102,241,0.35);
transform: translateY(-1px);

/* Active */
transform: translateY(0);
box-shadow: 0 1px 4px rgba(99,102,241,0.2);

/* Disabled */
opacity: 0.4; cursor: not-allowed; pointer-events: none;
```

**Secondary (Ghost):**
```css
background: rgba(255,255,255,0.04);
border: 1px solid rgba(255,255,255,0.1);
color: var(--gray-100);

/* Hover — subtle lift */
background: rgba(255,255,255,0.07);
border-color: rgba(255,255,255,0.16);
```

**Danger:**
```css
background: rgba(239,68,68,0.1);
border: 1px solid rgba(239,68,68,0.3);
color: #fca5a5;

/* Hover — fill red */
background: #ef4444;
color: #ffffff;
border-color: transparent;
```

**Icon-only button:** 32×32px minimum, 36×36px recommended, 44×44px for touch targets.

**Button sizes:**
- `sm`: padding 6px 14px, font-size 12px
- `md` (default): padding 8px 20px, font-size 13px
- `lg`: padding 10px 24px, font-size 14px

### Inputs

```css
.input {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: var(--gray-50);
  padding: 9px 14px;
  font-size: 13px;
  font-family: inherit;
  transition: border-color 150ms, box-shadow 150ms, background 150ms;
}

.input:hover {
  border-color: rgba(255,255,255,0.18);
}

.input:focus {
  outline: none;
  border-color: var(--accent);
  background: rgba(255,255,255,0.06);
  box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
}

.input.error {
  border-color: var(--danger-solid);
  box-shadow: 0 0 0 3px rgba(239,68,68,0.12);
}

.input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Input label:**
```css
.input-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--gray-300);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
  display: block;
}
```

### KPI Card Component

```css
.kpi-card {
  background: linear-gradient(145deg, var(--gray-800) 0%, var(--gray-850) 100%);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px;
  padding: 22px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 200ms, box-shadow 200ms, transform 200ms;
}

/* Status accent — left border, not top border */
.kpi-card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  border-radius: 14px 0 0 14px;
}

.kpi-card.danger::before  { background: var(--danger-solid); }
.kpi-card.warning::before { background: var(--warning-solid); }
.kpi-card.success::before { background: var(--success-solid); }
.kpi-card.neutral::before { background: var(--accent); }

.kpi-card:hover {
  border-color: rgba(255,255,255,0.14);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

.kpi-value {
  font-size: 36px;
  font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: -0.04em;
  line-height: 1;
  margin-bottom: 4px;
}

.kpi-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--gray-300);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
}

.kpi-trend.up   { color: var(--success-text); }
.kpi-trend.down { color: var(--danger-text); }
.kpi-trend.flat { color: var(--gray-300); }
```

### Table Component

```css
.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
}

.data-table th {
  padding: 10px 16px;
  font-size: 10.5px;
  font-weight: 700;
  color: var(--gray-300);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: rgba(255,255,255,0.025);
  border-bottom: 1px solid rgba(255,255,255,0.07);
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
}

.data-table th:hover {
  color: var(--gray-100);
  background: rgba(255,255,255,0.04);
}

.data-table th.sort-active {
  color: var(--accent-light);
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  color: var(--gray-100);
  vertical-align: middle;
}

/* Numeric cells use monospace */
.data-table td.numeric {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  text-align: right;
}

.data-table tr:hover td {
  background: rgba(255,255,255,0.025);
}

.data-table tr.critical-row td:first-child {
  border-left: 2px solid var(--danger-solid);
}
```

### Toast Notifications

```css
.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 12px;
  max-width: 340px;
  font-size: 13px;
  line-height: 1.5;
  background: var(--gray-800);
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3);
  animation: toastSlideIn 300ms cubic-bezier(0.34,1.56,0.64,1);
}

.toast-icon {
  width: 20px; height: 20px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  font-size: 11px;
}

.toast.success .toast-icon { background: var(--success-dim); color: var(--success-text); border: 1px solid var(--success-border); }
.toast.error   .toast-icon { background: var(--danger-dim);  color: var(--danger-text);  border: 1px solid var(--danger-border); }
.toast.info    .toast-icon { background: var(--info-dim);    color: var(--info-text);    border: 1px solid var(--info-border); }
.toast.warning .toast-icon { background: var(--warning-dim); color: var(--warning-text); border: 1px solid var(--warning-border); }
```

---

---

# SECTION 5 — MOTION & INTERACTION SYSTEM

## Motion Philosophy

Motion in a construction PM dashboard should feel **precise, purposeful, and mechanical** — like the movement of a well-engineered instrument. It should never feel playful, bouncy, or attention-seeking. Every animation must earn its place by communicating state change, guiding attention, or confirming an action.

**Reference benchmark:** Linear's sidebar transitions are so well-tuned that users describe the app as "snappy" without being able to articulate why. The secret: every transition uses precisely calibrated easing that matches the physics of the interaction. Moving from one page to another feels like flipping through a well-organized physical folder.

---

## Duration Tokens

```css
--duration-instant: 50ms;    /* Checkbox toggles, radio selects — sub-perceptual */
--duration-fast:    100ms;   /* Button press state, tab switch */
--duration-normal:  200ms;   /* Hover states, badge changes, toast appear */
--duration-medium:  300ms;   /* Panel slides, modal appear, dropdown open */
--duration-slow:    500ms;   /* Page transitions, chart animations */
--duration-crawl:   800ms;   /* KPI count-up, loading sequences */
```

## Easing Tokens

```css
--ease-out:         cubic-bezier(0, 0, 0.2, 1);      /* Element entering viewport */
--ease-in:          cubic-bezier(0.4, 0, 1, 1);       /* Element leaving viewport */
--ease-in-out:      cubic-bezier(0.4, 0, 0.2, 1);     /* Element transitioning in place */
--ease-spring:      cubic-bezier(0.34, 1.56, 0.64, 1); /* Elastic/spring — use sparingly */
--ease-linear:      linear;                            /* Progress bars, loading spinners */
```

**Spring easing rule:** `--ease-spring` is currently used for modal entrance and toast. It should ONLY be used for these two patterns. Using spring easing on navigation, sidebar, or data elements feels juvenile and undermines the precision aesthetic.

---

## Specific Animation Specifications

### Page Transitions
**Current:** `fadeIn 0.2s ease` — adequate but plain.
**Improved:** `opacity: 0 → 1` over `200ms --ease-out` COMBINED with `transform: translateY(8px) → translateY(0)`. The current implementation does this; the improvement is to also add a very subtle `clip-path: inset(0 0 2% 0) → inset(0 0 0% 0)` over the same duration, creating a "revealing" entrance from the bottom edge — a pattern used by Vercel and Linear.

### Sidebar Collapse
**Current:** `transition: width 0.25s ease`. Width-only animation is abrupt because the content inside the sidebar snaps to visibility/hidden.
**Improved:** Use a clip-path or max-width animation for the labels, with a slight delay after the width animation starts:
```css
.sidebar { transition: width 250ms var(--ease-in-out); }
.nav-label { 
  transition: opacity 100ms var(--ease-in) 0ms, max-width 250ms var(--ease-in-out); 
  /* Fade out immediately, let width follow */
}
.sidebar.collapsed .nav-label { opacity: 0; max-width: 0; }
/* Expand: fade in after width animation */
.sidebar:not(.collapsed) .nav-label { 
  transition: opacity 150ms var(--ease-out) 200ms, max-width 250ms var(--ease-in-out); 
  opacity: 1; max-width: 200px; 
}
```

### AI Panel Slide-in
**Current:** `transition: right 0.3s cubic-bezier(0.4,0,0.2,1)` — right-position animation. This is correct easing but animating `right` causes layout reflow.
**Improved:** Use `transform: translateX(100%) → translateX(0)` on the panel itself, with a fixed position already at `right: 0`. Transform-only animations are composited on the GPU and do not cause layout recalculation:
```css
.ai-panel {
  right: 0;
  transform: translateX(100%);
  transition: transform 300ms var(--ease-in-out), opacity 200ms var(--ease-out);
  opacity: 0;
}
.ai-panel.open {
  transform: translateX(0);
  opacity: 1;
}
```

### KPI Count-Up Animation
```javascript
function animateCount(element, target, duration = 800, prefix = '', suffix = '') {
  const start = performance.now();
  const isDecimal = target % 1 !== 0;
  
  function frame(time) {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic: 1 - (1-t)^3
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = target * eased;
    element.textContent = prefix + (isDecimal ? current.toFixed(2) : Math.floor(current)) + suffix;
    if (progress < 1) requestAnimationFrame(frame);
  }
  
  requestAnimationFrame(frame);
}
```

### Skeleton Loading System
The `.skel` class exists but is poorly implemented — a static opacity animation. A proper skeleton should use a **shimmer sweep** that conveys directionality:
```css
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.04) 0%,
    rgba(255,255,255,0.08) 40%,
    rgba(255,255,255,0.04) 80%
  );
  background-size: 300% 100%;
  animation: skeleton-sweep 1.5s ease-in-out infinite;
  border-radius: 6px;
}

@keyframes skeleton-sweep {
  0%   { background-position: 200% center; }
  100% { background-position: -200% center; }
}
```

### AI Response Animation
When the AI generates a response (whether truly AI-powered or simulated), the text should not appear all at once. Implement a **typewriter reveal** at ~40 characters per second for the first sentence, then instant reveal for the remainder. This creates a perception of real-time intelligence even in simulated scenarios.

```javascript
function typewriterReveal(element, text, speed = 25) {
  element.textContent = '';
  let i = 0;
  const firstBreak = Math.min(text.indexOf('.') + 1, 80);
  
  function type() {
    if (i < firstBreak) {
      element.textContent += text[i++];
      setTimeout(type, 1000 / speed);
    } else {
      element.textContent = text; // instant reveal for rest
    }
  }
  type();
}
```

### Chart Entrance Animations
All Chart.js charts should be configured with entrance animations:
```javascript
// For bar/line charts
animation: {
  duration: 600,
  easing: 'easeOutQuart',
  delay: (context) => context.dataIndex * 50  // Staggered bars
}
// For doughnut
animation: {
  duration: 800,
  easing: 'easeOutCubic',
  animateRotate: true,
  animateScale: true
}
```

### Hover Micro-interactions
- **Table row hover:** `background` transition 100ms — already implemented. Add a subtle `border-left: 2px solid transparent → 2px solid rgba(99,102,241,0.3)` transition to give directional focus feedback.
- **Project card hover:** `transform: translateY(-4px)` — already implemented. Add `box-shadow` transition from a deeper resting shadow to a lighter, more diffuse floating shadow: `0 4px 16px rgba(0,0,0,0.3) → 0 12px 40px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)`.
- **Button hover:** `transform: translateY(-1px)` over 150ms — creates a gentle "lift" that is perceptible but not distracting.

---

---

# SECTION 6 — AI-NATIVE EXPERIENCE UPGRADE

## The Core Problem with the Current AI

The current AI implementation is a **facade** — a chat UI rendering template strings. The `generateAIResponse()` function performs basic keyword matching (`message.toLowerCase().includes('budget')`) and returns pre-written text with live data interpolated in. There is no machine learning, no language model, no semantic understanding, no contextual reasoning.

This is not automatically a problem — many "AI" features in enterprise software are rule-based systems. The problem is the UX contract: by presenting a chat interface with an AI avatar and the label "AI Advisor — Construction Intelligence," the product implies real AI capabilities. When a user asks "What is causing the SPI to decline?" and receives a canned response about budget totals, the trust damage is significant and lasting.

The redesign must either: (1) deliver real AI integration, or (2) be honest about rule-based intelligence while still delivering genuine value.

**Recommendation: Deliver real AI via Anthropic Claude API.**

Given that this dashboard is already used by Segun Ogunbiyi — a Head of Projects managing ₦8+ billion in construction — the ROI of a real Claude integration is immediate and measurable. A genuine AI that can read the project data and answer "Bay Contracting's SPI is 0.87 and the first-floor slab casting target is 21 May — what is the probability of on-time completion?" provides decision support that no spreadsheet or template can match.

---

## AI Integration Architecture

### Layer 1: Contextual Data Injection
Every AI interaction should include the current project state as context in the system prompt:
```
SYSTEM: You are a Construction Project Intelligence AI for EVD PropCo 
and VGS Homeland Nigeria Limited. You have access to live project data 
including 5 active projects, 47 milestones, 13 open risks, 7 open RFIs, 
and ₦8.49bn in total project value.

Current critical items:
- RFI-RP-001: ECS/HVAC PCB fault (OVERDUE, 27 days overdue)
- P-PAU-003: PAU FF slab casting (Due: 21 May 2026)
- Bay Contracting SPI: 0.87 (recovery plan required)
[...full project state...]
```

This enables Claude to answer questions like "What's blocking River Park completion?" with genuine intelligence rather than template matching.

### Layer 2: Proactive Intelligence Engine
Rather than waiting for user queries, the system should run a background analysis every time data changes and surface top 3 insights proactively. This is implemented as a scheduled function that calls the Claude API with the full data state and asks for:
- Top 3 schedule risks in the next 30 days
- Top 3 budget variance alerts
- Recommended next actions for the current user

These insights surface as ambient notifications — visible in the AI FAB badge count and in a "Today's Intelligence" card at the top of the Dashboard.

### Layer 3: Natural Language Queries
Replace the keyword-matching `generateAIResponse()` with a genuine API call:
```javascript
async function askClaude(userMessage, projectContext) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'content-type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system: buildSystemPrompt(projectContext),
      messages: [{ role: 'user', content: userMessage }]
    })
  });
  return response.json();
}
```

### Layer 4: AI Document Generation
The Document Wizard already templates documents. With AI integration, this becomes genuinely powerful:
- User selects: "Generate Monthly Progress Report for PAU Hostel — May 2026"
- System sends all PAU project data to Claude: milestones, visits, meetings, risks, RFIs, payments
- Claude generates a fully-written, professionally structured monthly report with executive summary, progress analysis, risk commentary, financial status, and recommended actions
- User reviews, edits inline, then downloads or registers in the Document Register

This is not incremental improvement — this is transformational for a Head of Projects who currently writes these reports manually.

### Layer 5: Risk Prediction
Train a lightweight risk model on historical project data to predict schedule overrun probability. Even without ML infrastructure, Claude can analyze patterns: "Given that Bay Contracting has missed the last 2 milestone targets by an average of 18 days, and the FF slab casting is targeted for 21 May with only 50% of de-shuttering complete, what is your assessment of on-time delivery?"

---

## AI UX Patterns

### Making AI Feel Integrated, Not Bolted-On

**Wrong:** An AI sidebar that you open separately from your workflow.
**Right:** AI woven into the fabric of every surface.

Implementation strategy:
1. **Inline AI insights on risk items:** Every risk row in the Risk Register has a `✦` icon that, on click, opens an inline popover with AI commentary: "This risk (ECS PCB fault) has been open for 27 days with no response from the supplier. Based on similar construction delays, the probability of this blocking final completion has increased to ~85%."

2. **AI-generated explanations on KPI anomalies:** When a KPI shows an unusual value (SPI below 0.9), clicking the KPI card shows an AI-generated explanation of what factors are driving the value.

3. **Smart form assistance:** When creating a new Risk, the AI suggests: "Similar projects at this stage (foundation to structural) commonly face: weather delays, material supply chain issues, and subcontractor coordination failures. Would you like to pre-populate these as risks?"

4. **Document draft generation:** When registering a new document, AI can suggest: document number (based on naming convention analysis), discipline category, and reviewer (based on document type and project consultant list).

### AI Trust-Building Techniques

1. **Show your reasoning:** When the AI makes a claim ("The probability of on-time completion has decreased"), show the data points it used. "Based on: SPI 0.87, 2 consecutive missed milestone targets, 18-day average delay, and 6 weeks to final completion target."

2. **Confidence levels:** AI responses should include a confidence indicator: "High confidence — based on 3 consistent data points" vs "Low confidence — limited historical data."

3. **Human-in-the-loop:** Never allow AI to take action without explicit user confirmation. AI recommends — humans decide. Every AI suggestion has a clear "Accept" and "Dismiss" action.

4. **Audit trail:** Log all AI interactions with timestamps. Executives need to know that AI-generated insights can be traced and audited.

5. **Error acknowledgment:** When the AI is uncertain or lacks data, it should say so clearly: "I don't have enough data to assess this with confidence. I'd recommend consulting the QS directly."

---

---

# SECTION 7 — INFORMATION ARCHITECTURE & COGNITIVE OPTIMIZATION

## Attention Flow Analysis

Eye-tracking research on data-dense dashboards consistently shows a modified F-pattern: users read horizontally across the top (catching KPIs and alerts), then scan down the left side (catching navigation labels and row beginnings), with brief horizontal saccades at rows of interest.

**Current attention flow problems:**

1. **Attention competing signals at the same hierarchy level.** The top of the Dashboard page has: 5 KPI cards of equal weight, then 2 company comparison blocks of equal weight, then 2 chart cards of equal weight, then a section title "Active Projects," then a project grid. Every element competes for the user's first glance. There is no single dominant visual anchor.

2. **No "above the fold" critical signal.** On a standard 1366×768 laptop, the area visible without scrolling contains only the topbar and the KPI row. The most critical information — "3 projects at risk, 5 RFIs overdue, 2 critical punch items" — is not visible above the fold. The user must scroll to find urgency signals.

3. **Navigation cognitive load front-loads every session.** Every time the user opens the application, they encounter the full sidebar with 16 items. Even with muscle memory, this creates a brief mental parsing cost at the start of every interaction.

## Information Hierarchy Redesign

### Priority Tier 1 — Critical Action Required (Immediate Attention)
Positioned: Top of every page, full width, red/amber background
Content: Items requiring action within 24-48 hours across all projects
Format: Single-line per item, max 3 items visible, "View all" link
Psychology: The "pre-attentive" visual system processes color and position before conscious attention. Red/amber at the top of every screen ensures critical items are seen before the user's cognitive attention fully engages.

### Priority Tier 2 — Portfolio Status (Strategic Overview)
Positioned: Below the alert strip, 3-4 primary KPIs
Content: Portfolio health score, total value at risk, schedule performance index
Format: Large numbers with trend arrows and AI-generated one-line insight
Psychology: Numbers at this tier should be large enough to read without focusing — the user should be able to glance at the KPI row and know "things are generally at risk" without reading anything.

### Priority Tier 3 — Project Detail (Operational Management)
Positioned: Main content area
Content: Project cards with health signals, or filtered table based on current context
Format: Cards in default view, table in list view
Psychology: This tier requires active attention and cognitive engagement. The design should support focus — reduce visual noise, use consistent column widths, ensure high contrast on the most important data points.

### Priority Tier 4 — Reference Data (Research/Archive)
Positioned: Full content area on dedicated pages (Document Register, Meetings, Site Visits)
Content: Detailed records, historical data, document files
Format: Dense table with filtering and search
Psychology: At this tier, the user is in a "retrieval" cognitive mode — they know what they're looking for and need efficient search/filter tools more than they need visual hierarchy.

## Progressive Disclosure Strategy

**Level 1 — Summary (always visible):** Project name, status badge, completion %, next milestone, critical alert count.

**Level 2 — Overview (one click):** Expanding project card or project detail drawer showing: all KPIs, recent activity, upcoming deadlines, AI health assessment.

**Level 3 — Detail (navigation):** Full page view with all entities filtered to the selected project — milestones, risks, RFIs, documents, payments.

**Level 4 — Entity detail (modal/drawer):** Full detail view of a specific item — individual risk, individual RFI, individual payment certificate.

**Progressive disclosure psychology:** By hiding Level 2-4 content behind intentional user actions, the interface respects the user's cognitive state. They are not forced to process detail they didn't ask for. This is the core principle behind Linear's interface design — everything is one keystroke or click deeper, but the surface stays clean.

## Dashboard Fatigue Prevention

Dashboard fatigue occurs when users stop processing information because the dashboard always looks the same regardless of actual project state. Prevention strategies:

1. **State-dependent layouts:** When all projects are on track, the dashboard should look visually calm — green accents, no alert strips. When projects are at risk, the visual tone shifts — amber/red accents become dominant, alert strips appear. The visual state of the dashboard should communicate emotional urgency.

2. **Rotating insights:** The "Today's Intelligence" card at the top of the dashboard should show different AI-generated insights daily, rotating through: schedule trends, budget analysis, risk evolution, upcoming deadlines. This creates a reason to return — the dashboard has something new to say.

3. **Time-anchored context:** Show "Last updated: 2 minutes ago" on all data panels. Knowing the data is fresh increases engagement. Knowing it might be stale reduces it.

---

---

# SECTION 8 — RESPONSIVE & CROSS-PLATFORM STRATEGY

## Desktop Ultrawide (1920px+)

At ultrawide resolutions, the current implementation scales poorly — content simply spreads wider because the main content area has no `max-width` constraint. The KPI row at `grid-template-columns: repeat(5,1fr)` creates enormous, awkward cards on ultrawide screens.

**Recommendation:**
- Content area max-width: `1440px` centered, with a slightly larger background canvas
- Sidebar expands to `280px` on ultrawide to show additional context (project quick-switcher, AI insights strip)
- Dashboard gains a right sidebar column (300px) for: Today's Intelligence, Recent Activity, Upcoming Deadlines
- KPI cards: limit to 4 cards per row on ultrawide, with larger text and sparklines visible

## Laptop (1280-1536px)

Standard target viewport. The current design works reasonably here. Key improvements:

- Remove the topbar company/project dropdowns — replace with a contextual breadcrumb that shows current portfolio/project context with a click-to-change action
- AI panel (360px) pushes main content left rather than overlaying it on screens wider than 1280px

## Tablet (768-1024px)

**Current issues:** The 900px breakpoint collapse is abrupt — projects jump from 3-column to 1-column. Tables remain scrollable but with no guidance that they extend beyond the viewport.

**Improved tablet layout:**
- Sidebar becomes an off-canvas sheet on < 1024px (not just < 900px)
- KPI row: 2×2 grid on tablet portrait, 4×1 on tablet landscape
- Project cards: 2-column grid on tablet portrait
- Tables: show 5-6 most important columns only, with a "More" expander for additional columns
- Chart heights: increase to 220px on tablet to use the available space better

## Mobile (< 768px)

**Current issues:** AI panel at 360px is effectively full-screen on mobile — should be a bottom sheet that slides up from the bottom, matching iOS/Android native patterns. The `ai-fab` button at 40px diameter is below Apple's 44px minimum touch target recommendation. Tables with `overflow-x: auto` have no scroll indicator — users do not know content extends beyond the viewport.

**Mobile-first improvements:**
- Bottom navigation bar: 5 icons at the bottom of screen replacing the sidebar entirely on mobile. Same pattern as iOS apps. Items: Home, Projects, Alerts, AI, More.
- AI panel becomes a bottom sheet (slides up from bottom, 70% screen height)
- Tables become card lists on mobile — each row becomes a compact card showing the most important fields
- FAB minimum size: 48×48px, positioned 24px from the bottom and right edges (above the bottom nav)
- Horizontal scroll tables: Add a gradient fade at the right edge of scroll containers to signal continuity
- Pull-to-refresh gesture support for data tables
- Haptic feedback on critical actions (delete, confirm, AI send) — using `navigator.vibrate()`

## Foldables

An emerging form factor relevant to field use (site managers reviewing punch lists on a folded Galaxy Z Fold). The dashboard should:
- Detect `screen.foldable` or viewport ratio changes
- In folded state (narrow portrait): show bottom nav + single-column card list
- In unfolded state (tablet-wide): switch to the tablet layout automatically

**Key implementation:** Use the CSS `@media (display-mode: standalone)` and `@media screen and (max-aspect-ratio: 1/1)` to detect and adapt. The JavaScript `window.matchMedia('(max-width: 768px)').addEventListener('change', ...)` listener should trigger a full layout re-evaluation.

---

---

# SECTION 9 — TECHNICAL FRONTEND MODERNIZATION PLAN

## Current Architecture Assessment

The current implementation is a **single-file vanilla JavaScript application** approximately 3,500 lines long. Data is stored in `localStorage`. There is no build pipeline, no module system, no component abstraction, no routing, no server, no authentication.

This architecture was perfectly appropriate for a **personal productivity tool** used by one person on one device. It becomes architecturally dangerous the moment:
- A second user needs to access the same data
- Data needs to survive a browser cache clear
- The application grows beyond ~5,000 lines
- New features require shared state between multiple views
- Audit trails and change history become required

**Current architecture maximum viable scale: ~6 months of development before the file becomes unmaintainable.**

---

## Recommended Target Architecture

### Frontend: React + TypeScript + Vite

**Why React:**
- Component abstraction is precisely what this application needs — every table, every KPI card, every modal form should be a reusable component with typed props
- React's ecosystem (React Query for data fetching, Zustand for state) maps perfectly to the needs of this application
- TypeScript prevents the class of bugs that arise from untyped JavaScript at this data complexity level (the project data has deeply nested objects that benefit enormously from type safety)
- Vast talent pool for hiring future developers

**Why Vite:**
- Sub-second hot reload during development
- Optimized production builds with code splitting
- Zero-configuration TypeScript support
- Native ES module support

### Styling: Tailwind CSS with a Design Token Layer

**Migration strategy:**
1. Extract all CSS custom properties into a `tailwind.config.js` theme extension:
```javascript
theme: {
  extend: {
    colors: {
      'gray-900': '#0f172a',
      'surface-1': '#131e2e',
      'surface-2': '#1a2236',
      'accent': '#6366f1',
      'evd': '#f97316',
      'vgs': '#14b8a6',
    },
    fontFamily: {
      'sans': ['Inter', 'system-ui'],
      'mono': ['JetBrains Mono', 'monospace'],
    },
    fontSize: { /* type scale as defined in Section 4 */ },
    spacing: { /* 4px base unit spacing as defined in Section 4 */ },
    transitionTimingFunction: {
      'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
    }
  }
}
```

2. Build all new components using Tailwind utility classes
3. Maintain the CSS variable system for theme switching (Tailwind's `dark:` variant + `class` strategy)

### State Management: Zustand

**Why Zustand (not Redux):**
- Redux is architecturally overkill for this application's state complexity
- Zustand provides the same predictability with 80% less boilerplate
- The current global `DATA` variable maps cleanly to a Zustand store:
```typescript
interface PMStore {
  projects: Project[];
  milestones: Milestone[];
  risks: Risk[];
  issues: Issue[];
  // ...etc
  currentProjectId: string | null;
  currentCompany: string | null;
  
  // Actions
  addRisk: (risk: Omit<Risk, 'id'>) => void;
  updateRisk: (id: string, updates: Partial<Risk>) => void;
  deleteRisk: (id: string) => void;
  setFilter: (company: string | null, projectId: string | null) => void;
}
```

### Backend: Supabase (Postgres + Realtime + Auth)

**Why Supabase:**
- Replaces `localStorage` with a real Postgres database instantly
- Built-in authentication (the user avatar "SO — Segun Ogunbiyi" should be a real authenticated session)
- Real-time subscriptions — two users editing the same project see changes live
- Row-level security — EVD users see EVD projects; VGS users see VGS projects
- File storage — documents registered in the Document Register can store actual files
- Edge functions — for AI integration (keeping the Anthropic API key server-side)

The current `SAMPLE` data object maps directly to Supabase tables. The migration is:
1. Create tables: `projects`, `milestones`, `risks`, `issues`, `visits`, `meetings`, `documents`, `procurement`, `rfis`, `payments`, `handover`
2. Import SAMPLE data as seed data
3. Replace `localStorage` reads/writes with Supabase client calls
4. Add authentication (email + password or Google OAuth)

### Routing: React Router v7

Hash-based or history-based routing with URL state for filters:
```
/dashboard
/projects
/projects/:projectId
/risks?status=critical&project=p4
/documents?category=QAQC
/rfi?status=open
```

### Charting: Recharts (primary) + Observable Plot (advanced)

**Recharts** for standard charts (bar, line, area, doughnut, radar) — excellent React integration, responsive by default, good theming support.

**Observable Plot** for the Gantt chart and advanced visualizations (risk heatmap matrix, portfolio dependency diagram) — it is the most capable data visualization library available in 2026 for bespoke chart types.

### Animation: Framer Motion

For complex animations (panel slides, shared element transitions between list and detail views, AI response streaming visualization), Framer Motion provides the production-grade API that CSS transitions cannot achieve. For simple micro-interactions, continue using CSS transitions (Tailwind's `transition-` utilities).

### Accessibility: Radix UI Primitives

Radix UI provides unstyled, fully accessible component primitives that handle: focus trapping in modals, keyboard navigation in dropdowns and menus, ARIA attributes, and screen reader announcements. Style these with Tailwind to match the design system. This replaces the need to hand-roll accessible interactions across 16 feature areas.

### Performance Optimization Strategy

1. **Code splitting:** Split the application by route. The Document Register page and its rich table should not be loaded on initial Dashboard render.
2. **Virtual scrolling:** For tables with >50 rows, use `@tanstack/react-virtual` for windowed rendering.
3. **Image optimization:** Project documents stored in Supabase should be served via Supabase's CDN with responsive sizing.
4. **Bundle analysis:** Run `vite build --analyze` and audit bundle size quarterly. Target: < 200KB initial JS bundle (excluding Chart.js).
5. **Service Worker:** Cache static assets and the last-known data state for offline access — critical for field use on construction sites with poor connectivity.

---

---

# SECTION 10 — MODERN ENTERPRISE FEATURES MISSING

## 10.1 Gantt Chart / Timeline View

**Why it matters:** Construction project management without a Gantt view is like flying without instruments. The schedule is the single most important artefact in construction PM — it shows dependencies, critical path, float, and earned value. The current milestone table shows milestones as rows with planned/actual dates, but provides no visual representation of time, duration, or sequence. When reviewing Bay Contracting's recovery plan for the PAU Hostel (SPI 0.87), a PM needs to see the critical path visually — which activities must compress to recover the schedule.

**UX implementation:** A horizontal timeline view (switchable from the milestone table view) using Observable Plot or a dedicated Gantt library (`frappe-gantt` for vanilla JS, `dhtmlx-gantt` for enterprise). Show: bar per milestone, color-coded by status, baseline vs. actual comparison, critical path highlighted in red, float shown as grey extension bars.

**Enterprise value:** Directly supports the statutory requirement for construction programmes (JCT contracts mandate a master programme). Enables instant visual communication with clients, contractors, and banks (Providus Bank requires progress reports for disbursement).

## 10.2 Resource Allocation Matrix

**Why it matters:** The PAU Hostel project has 6 active sub-contractors: Bay Contracting (civil), Mabstar (electrical), Bori-Tech (mechanical), Goldfield (fire suppression), Ordez (ELV), Bori-Tech (HVAC). There is no view showing which resources are active on which activities at which time. Without this, the PM cannot detect resource conflicts (two subcontractors needing the same space simultaneously) or gaps (Goldfield has equipment off-site with no installation schedule).

**UX implementation:** A matrix view with contractors on the Y-axis and weeks on the X-axis. Each cell shows scheduled activity. Color-coded by risk (red = resource conflict, amber = resource gap, green = scheduled).

## 10.3 Risk Radar / Heat Map

**Why it matters:** The current risk table has 9 risks across 4 projects. A PM reviewing risk exposure needs to understand the distribution instantly — are risks clustered in one project? In one category (procurement, technical)? At what severity level? A 5×5 probability/impact matrix with positioned risk bubbles communicates this in 3 seconds; a table requires 2 minutes of reading.

**UX implementation:** A 5×5 heat map grid with probability on the Y-axis, impact on the X-axis. Each risk is plotted as a labeled dot, sized by potential cost impact. Color gradient from green (low-left) to red (high-right). Clicking a dot opens the risk detail inline. This is a standard PMBOK tool that is conspicuously absent from almost all construction PM software.

## 10.4 Predictive Analytics / SPI Forecasting

**Why it matters:** SPI 0.87 for PAU Hostel tells you where you are. It does not tell you where you will end up. If the SPI trend is 0.95 → 0.91 → 0.87 over the last 3 reporting periods, the trajectory suggests further decline unless intervention occurs. A simple linear regression on SPI trend would project a forecast completion date — telling the PM that at the current rate, the May 2027 handover becomes a September 2027 handover. This is actionable. A raw SPI number is informational.

**UX implementation:** An earned value management (EVM) panel within the project detail view showing: SPI trend sparkline with projection, CPI (Cost Performance Index) trend, projected final cost (Budget at Completion ÷ CPI), forecast completion date (Time at Completion based on SPI trend). Implementable with the current data by adding weekly SPI recording to the data model.

## 10.5 Real-Time Collaboration & Presence Indicators

**Why it matters:** Segun Ogunbiyi is Head of Projects for both EVD PropCo and VGS Homeland. Other stakeholders — Mrs. Bose Sogunle (CEO, VGS), the EVD board, Bezal Engineering — may need read access to the same dashboard. Currently, sharing information means exporting a report. With real-time collaboration, all stakeholders see the same data simultaneously, and a PM can see "Mrs. Bose Sogunle is currently viewing the PAU project page" during a board meeting — enabling intelligent navigation.

**UX implementation:** Supabase real-time presence API + small avatar bubbles appearing in the topbar or on specific pages/entities showing who is currently viewing. A "Share this view" link that grants read-only access to a filtered view (e.g., PAU project dashboard only).

## 10.6 AI-Generated Monthly Reports

**Why it matters:** Monthly Progress Reports are a contractual requirement in construction. The current Document Wizard generates report templates. But the actual writing of the report — synthesizing milestones, progress photos, risk updates, financial status, meeting actions — is a multi-hour task done manually. A Claude-powered report generator that ingests all project data for the period and produces a draft report (indistinguishable from a professionally written document) would save 4-8 hours per project per month.

**UX implementation:** A "Generate Report" workflow: select project, select period, select sections to include. AI generates the full report, user reviews and edits inline, then registers it in the Document Register and optionally emails it to stakeholders.

## 10.7 Smart Alerts Engine

**Why it matters:** The current system is passive — it shows what the data says but does not proactively detect deteriorating conditions. A smart alerts engine monitors the data continuously and fires alerts when: an RFI is approaching its due date with no response, a payment certificate has been pending for more than a defined threshold, a risk's probability increases above a threshold, a milestone's planned date passes without actual date.

**UX implementation:** A background service (Supabase Edge Function on a cron trigger) that runs daily, evaluates all data against alert rules, and generates notifications. Rules are configurable — the PM can set: "Alert me when any RFI is > 7 days overdue" or "Alert me when remaining contingency falls below 5% of contract value."

## 10.8 Financial Forecasting Dashboard

**Why it matters:** The current Budget & Costs page shows approved contracts, variations, and paid amounts. What it does not show: projected final cost (including probable variations), cash flow forecast (when will the remaining ₦80.06m to Floorenzo be due?), bank facility utilization (₦1.04bn of ₦1.3bn Providus facility used — only ₦260m remaining for a project with ₦740m funding shortfall). These are the numbers that determine project viability. They require synthesis from multiple data points and are currently invisible in the dashboard.

**UX implementation:** A Financial Intelligence view within Budget & Costs showing: waterfall chart (contract → approved variations → expected additional variations → projected final cost vs. budget), cash flow S-curve (actual vs. planned expenditure with forecast), facility utilization gauge, and contingency burn rate trend.

## 10.9 Document Version Control & Comparison

**Why it matters:** The Document Register tracks revision codes (Rev A, Rev B, Rev C) but provides no way to see what changed between revisions or to compare two versions. For IFC drawings, revision history is contractually significant — understanding what changed in Rev C vs Rev B of the PAU Structural Drawings directly impacts QA responsibility.

**UX implementation:** Version history panel on each document showing all revisions with dates, preparers, and change notes. For text-based documents (specifications, meeting minutes, risk registers), an inline diff view showing additions in green and deletions in red.

## 10.10 Workflow Automation

**Why it matters:** Several workflows in construction PM are highly predictable and repetitive — when an IPC is issued, it should automatically: create a payment tracking record, notify the relevant project stakeholders, set a due date reminder at +30 days. Currently, each of these is a manual action. Automation eliminates the risk of missed steps.

**UX implementation:** A lightweight "Automations" configuration panel (similar to Zapier or Monday.com automations) where the PM can define: "When [RFI status changes to 'overdue'], then [send email to RFI author] and [create alert]." These rules run server-side in Supabase Edge Functions.

---

---

# SECTION 11 — COMPETITIVE BENCHMARKING

## Against Leading PM Tools

| Tool | Category | Their Strength | Current Dashboard vs. |
|---|---|---|---|
| **Linear** | Software PM | Keyboard-first, minimal, blazing fast, beautiful dark mode, perfect motion | This dashboard has Linear's color philosophy but lacks Linear's speed, keyboard navigation, and visual precision |
| **ClickUp AI** | General PM | AI features deeply embedded, views flexibility (list/board/gantt), automations | This dashboard has more domain specificity but lacks views flexibility, AI depth, and collaboration |
| **Monday.com** | General PM | Visual boards, automations, powerful filtering, team collaboration | This dashboard is more construction-specific; Monday.com wins on UX polish and collaboration |
| **Notion** | Knowledge + PM | Document-first, flexible databases, beautiful editor, AI writing | Document Wizard is a weaker version of Notion's page editor; Notion wins on content creation |
| **Asana** | Task PM | Timeline view, dependency mapping, workload management | This dashboard has better financial tracking; Asana wins on scheduling and team coordination |
| **Jira** | Software PM | Powerful querying, customizable, integrations | Not directly comparable; Jira is too developer-centric; this dashboard is more appropriate for construction |
| **Procore** | Construction | Built for construction, submittals, RFIs, drawings, mobile | Procore wins on construction domain depth, BIM integration, mobile site capture; this dashboard wins on cost and flexibility |
| **Autodesk Construction Cloud** | Construction | BIM integration, model coordination, clash detection | ACC is enterprise-only, extremely expensive; this dashboard is more appropriate at this project scale |
| **Oracle Primavera** | Construction Schedule | Critical path, resource management, earned value | Primavera wins entirely on scheduling; this dashboard does not have a Gantt view at all |
| **Vercel Dashboard** | DevOps | Perfect data density, deployment visualizations, instant loading | This dashboard aspires to Vercel's precision; Vercel wins on load performance and information hierarchy |
| **Stripe Dashboard** | Fintech | Financial data visualization, trust signals, enterprise reliability | This dashboard handles payment certificates but Stripe wins on financial data visualization sophistication |

## Where This Dashboard Genuinely Wins

1. **Domain specificity for Nigerian construction context:** No off-the-shelf tool understands the EVD/VGS portfolio structure, the ₦-denomination financials, the specific Nigerian contractor ecosystem, or the IPC payment certificate workflow.

2. **Multi-entity portfolio management:** Managing EVD PropCo and VGS Homeland as two separate company brands within a single interface is a customization that commercial tools struggle with cleanly.

3. **Document-to-Register integration:** The Document Wizard with direct registration into the Document Register is a workflow that Procore has but most general PM tools do not.

4. **Cost:** A single HTML file has zero infrastructure cost vs. Procore ($400+/month/user) or Primavera ($5,000+/year/user).

## Where It Falls Behind

1. **No Gantt chart.** This is the most critical missing feature for construction PM. Primavera owns this category; even basic construction apps have Gantt.

2. **No real collaboration.** All competitors have multi-user, real-time collaboration. This dashboard is a single-user tool.

3. **No mobile field app.** Procore's killer feature is its mobile app for site capture — photo documentation, punch items, daily reports, all from the site. This dashboard's mobile experience, while functional, is not optimized for field use.

4. **No integration ecosystem.** No API, no webhooks, no Zapier/Make integration, no email integration, no WhatsApp integration (critical for Nigerian construction communication patterns).

5. **No data persistence.** localStorage is not a database. Data loss on browser cache clear would be catastrophic.

---

---

# SECTION 12 — FINAL VISION

## The Transformed Experience: EVD·VGS Construction Intelligence Platform

Imagine Segun Ogunbiyi arriving at the office at 7:45 AM on a Monday morning. Before he opens his laptop, his phone shows a notification: **"3 critical items require your attention before the weekly update call."** He taps. The mobile interface opens — bottom navigation, full-bleed dark surface, three alert cards:

🔴 **River Park** — ECS commissioning: 34 days overdue. Recommended action: Escalate to ECS MD.
🟡 **PAU Hostel** — FF slab casting due tomorrow. Bay Contracting site status: No update in 16 hours.
🟡 **Kurudu Mall** — Providus Bank 3rd disbursement: BoQ harmonisation still outstanding.

He taps the River Park alert. The interface transitions — the project card expands with a fluid spring animation into a full project intelligence view. He doesn't need to navigate anywhere. He's looking at: the ECS timeline, the last site visit observation, the RFI status, the associated punchlist item, and an AI-generated recommendation: **"Based on ECS supplier's non-response over 34 days, recommend issuing a formal Notice to Proceed or engaging an alternative HVAC commissioning specialist. Two alternatives identified within Lagos: [Vendor A] and [Vendor B]."**

He taps "Accept Recommendation" → the system generates a draft notice to ECS, pre-populated with the correct contract references, the specific PCB fault details, and a 7-day response deadline. He reviews it in 30 seconds, makes one edit, and sends it directly from the app to ECS's registered email. The action is logged in the Document Register (as EVD-RP-NOTICE-003), a new RFI follow-up is created, and the AI updates its risk assessment: probability of ECS blocking final completion drops from 85% to 62% based on the formal notice.

---

On his laptop, he opens the Portfolio Dashboard. The interface loads in under 1 second — the skeleton screens shimmer once, then the data blooms into view. The hero strip reads:

**Portfolio Health: At Risk** — 3 of 4 active projects require attention. Total critical items: 7.

Below, four project cards — each alive with information. River Park glows with an amber left-border. Its card shows: 94% complete, SPI: 1.02, but the AI health dot is amber: "3 critical commissioning blockers." He hovers the card — it expands to show the next milestone (Final Completion: July 31), a sparkline of weekly progress rate, and the word "BLOCKED" in subtle red next to "ECS/HVAC."

PAU Hostel sits below with a different energy: 22% complete, deep navy background, SPI: 0.87 in monospace amber. The AI dot pulses once: "Recovery plan not yet received from Bay Contracting." This is a fact, not an alert — no red, no urgency. Just quiet institutional weight.

---

He opens the command palette: `⌘K`. Types `?` to enter AI query mode. Types: `"What is the realistic completion date for PAU at the current SPI trend?"` The interface transitions — the command palette expands into an AI conversation surface. Claude responds in 2 seconds, character by character:

*"Based on SPI trend across 3 reporting periods (0.95 → 0.91 → 0.87) and 12 remaining months to planned completion (May 2027), the projected completion date using time-variance analysis is approximately October–November 2027 — a 5-6 month overrun. Recovery requires: SPI returning to 1.0+ by Q3 2026. Bay Contracting's recovery plan should target an additional 15% physical progress by end of August to remain viable."*

He types: `"Generate a one-page summary for Mrs. Bose Sogunle."` In 8 seconds, a formatted executive summary appears — professionally worded, with the EVD·VGS letterhead applied, dated, ready for distribution. He reviews, approves, and the document registers in the system automatically.

---

During the Monday morning call with the EVD board, Segun shares his screen. The Portfolio Dashboard fills the call — executives see the same interface he uses daily. There is no export to PowerPoint, no screenshot pasted into Word. The live dashboard is the report. The executives ask about Kurudu's funding gap. He navigates — one click — to Budget & Costs, filtered to Kurudu. The waterfall chart tells the story instantly: ₦1.39bn deployed, 45% physical progress, ₦740m funding shortfall projected to project completion. The AI insight card reads: "At current spend rate, the Providus facility will exhaust by mid-August 2026. A board decision on the additional funding tranche is required by July 15, 2026 to avoid a construction halt." The board chair says: **"This is exactly what we needed. When was this built?"**

---

That is the final vision. Not a dashboard. Not a software tool. An institutional intelligence system that makes a Head of Projects feel like they have a team of analysts, a risk manager, and an executive secretary working simultaneously behind every screen. An interface that communicates the weight and consequence of managing real assets — real buildings, real money, real people — without ever becoming heavy, confusing, or slow.

**The interface should feel like the best possible version of the person using it.**

Precise. Authoritative. Always one step ahead. Built for a professional who does not have time to think about the tool — only about the projects.

---

---

# APPENDIX A — Implementation Roadmap

## Phase 1 — Immediate Wins (1-2 weeks, no architecture change)

1. Fix the `cursor:default` / `cursor:pointer` conflict on KPI cards (line 97/99)
2. Remove the perpetual shimmer animation from the wordmark
3. Implement `data-tip` tooltips on all collapsed sidebar nav items
4. Replace `No records found.` with contextual empty state components for each section
5. Add `data-tip` tooltips to all badge types in tables
6. Implement the Chart.js global theme override to match the design system
7. Apply `transition: all 0.1s` to table row hovers with a more visible `rgba(255,255,255,0.04)` background
8. Replace the generic "+ Add" topbar button with context-aware "+ Add [Item]" based on current page
9. Fix the white `doc-preview` box by adding a light-mode-compatible container with proper dark mode styling
10. Add `role="button"` or convert nav items to proper `<button>` elements with `tabindex="0"` and keyboard handlers

## Phase 2 — Design System Refinement (2-4 weeks)

1. Implement the full typography scale with JetBrains Mono for all numerical data
2. Implement the elevation-based surface system (replacing shadow-heavy patterns)
3. Redesign KPI cards with left-border semantic signaling, trend indicators, click-through navigation
4. Implement skeleton loading screens for all data-dependent sections
5. Redesign project cards with AI health dot, quick-stat badges, and hover expansion
6. Implement the notification center in the topbar
7. Implement URL hash routing for navigation state persistence
8. Add Gantt chart view for the Schedule & Milestones section (using frappe-gantt)
9. Add risk heat map to the Risk Register
10. Implement advanced sorting and column pinning in tables

## Phase 3 — Architecture Modernization (4-8 weeks)

1. Migrate to React + TypeScript + Vite
2. Implement Supabase backend: database, auth, storage
3. Implement Zustand state management
4. Implement React Router v7 routing
5. Migrate all components to Tailwind CSS with design token extensions
6. Implement Framer Motion for complex animations
7. Implement Recharts for all charts
8. Implement Radix UI primitives for accessible modals, dropdowns, and menus
9. Implement real-time collaboration via Supabase Realtime
10. Implement service worker for offline support

## Phase 4 — AI Integration (4-6 weeks, parallel with Phase 3)

1. Integrate Anthropic Claude API via Supabase Edge Functions
2. Implement contextual data injection into AI prompts
3. Replace template-based AI responses with real AI
4. Implement AI-generated Monthly Report generation
5. Implement proactive intelligence engine (daily background analysis)
6. Implement smart alerts engine (threshold-based triggers)
7. Implement inline AI insights on risk items, RFIs, and payment certificates
8. Implement natural language search across all entities

## Phase 5 — Advanced Features (8-12 weeks)

1. Resource allocation matrix
2. Predictive analytics / SPI forecasting with EVM
3. Financial forecasting dashboard (cash flow S-curve, projected final cost)
4. Document version control with diff comparison
5. Workflow automation engine
6. Mobile field app optimization (Progressive Web App)
7. BIM viewer integration (IFC file viewer for drawing review)
8. External stakeholder portal (read-only access for clients, banks, consultants)

---

*End of Document — EVD PropCo & VGS Homeland PM Dashboard: Full-Spectrum Design & UX Audit + Modernization Blueprint*

*Document prepared by: Senior Product Design + UX Strategy Review | May 2026*
*Classification: Internal — Head of Projects & Properties, Everyday Group / VGS Homeland Nigeria Limited*
