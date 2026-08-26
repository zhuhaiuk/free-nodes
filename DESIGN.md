# Zhuhai Free Nodes Design System

## 1. Atmosphere & Identity

Zhuhai Free Nodes feels like a compact, trustworthy subscription index: direct, readable, and easy to scan. The signature is a white document surface with restrained blue actions, thin separators, and practical proof blocks. Commercial service pages may introduce a soft Telegram blue/green accent, but the homepage stays focused on free node subscriptions.

## 2. Color

### Palette

| Role | Token | Light | Dark | Usage |
|------|-------|-------|------|-------|
| Surface/primary | --surface-primary | #FFFFFF | #111827 | Page background |
| Surface/secondary | --surface-secondary | #F4F7FB | #172033 | Cards and notes |
| Surface/elevated | --surface-elevated | #FFFFFF | #1F2937 | Repeated cards |
| Text/primary | --text-primary | #172033 | #F9FAFB | Headings and primary copy |
| Text/secondary | --text-secondary | #586174 | #CBD5E1 | Body and explanatory copy |
| Border/default | --border-default | #D9E0EA | #334155 | Cards, dividers, inputs |
| Accent/primary | --accent-primary | #1268D6 | #60A5FA | Links, main buttons, focus |
| Accent/hover | --accent-hover | #0B57B7 | #93C5FD | Hover state |
| Accent/telegram | --accent-telegram | #2AABEE | #38BDF8 | Telegram Premium service cues |
| Accent/ton | --accent-ton | #10B981 | #34D399 | Fragment / TON payment cues |
| Status/success | --status-success | #137A4B | #22C55E | Completed, trusted proof |
| Status/warning | --status-warning | #A85D00 | #F59E0B | Pricing notes and caution |

### Rules

- Homepage and node topic pages use --accent-primary only for interaction.
- Telegram Premium page may pair --accent-telegram and --accent-ton, but never dominate the entire site.
- Text must maintain WCAG AA contrast on white and soft surfaces.

## 3. Typography

### Scale

| Level | Size | Weight | Line Height | Tracking | Usage |
|-------|------|--------|-------------|----------|-------|
| Display | clamp(2rem, 4.5vw, 3.6rem) | 700 | 1.12 | 0 | Homepage H1 |
| H1 | clamp(2rem, 4vw, 3.2rem) | 700 | 1.15 | 0 | Topic and service page title |
| H2 | 1.35rem | 700 | 1.35 | 0 | Section heading |
| H3 | 1rem | 700 | 1.4 | 0 | Card title |
| Body | 1rem | 400 | 1.65 | 0 | Default copy |
| Body/sm | .95rem | 400 | 1.55 | 0 | Metadata and secondary copy |
| Caption | .9rem | 500 | 1.45 | 0 | Tags and small labels |
| Mono | .95rem | 400 | 1.55 | 0 | Subscription URLs |

### Font Stack

- Primary: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
- Mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace

### Rules

- Letter spacing remains 0.
- Body text never goes below .9rem.
- Long URLs and keywords use overflow-wrap or scrollable mono blocks.

## 4. Spacing & Layout

### Base Unit

All spacing derives from 4px.

| Token | Value | Usage |
|-------|-------|-------|
| --space-2 | 8px | Tags, compact gaps |
| --space-3 | 12px | Button and grid gaps |
| --space-4 | 16px | Default card padding |
| --space-5 | 20px | Page side padding |
| --space-6 | 24px | Header inner rhythm |
| --space-8 | 32px | Section clusters |
| --space-10 | 40px | Main top padding |
| --space-16 | 64px | Page bottom padding |

### Grid

- Max content width: 980px.
- Repeated content uses 2, 3, or 4 column CSS grids with minmax(0, 1fr).
- At 720px and below, all grids collapse to a single column.

### Rules

- The homepage is an information index, not a sales landing page.
- Commercial service content belongs on an independent topic page with one small homepage entry.
- Cards keep an 8px radius or less.

## 5. Components

### Button

- Structure: anchor with `.button`, optional `.secondary`.
- Variants: primary, secondary.
- Spacing: --space-4 horizontal, min-height 44px.
- States: hover underlines through the existing anchor rule; focus must remain visible through browser outline.
- Accessibility: use clear action text, not vague labels.

### Topic Card

- Structure: section with H3 link, descriptive paragraph, optional intent paragraph.
- Variants: standard topic, service topic.
- Spacing: --space-4 padding, --space-3 internal gap.
- States: link hover only; card itself is not a fake button.
- Accessibility: semantic section headings.

### Trust Item

- Structure: section with H3 and paragraph.
- Variants: homepage trust, service proof.
- Spacing: --space-4 padding.
- Accessibility: no hidden meaning in color alone.

### Pricing Card

- Structure: section with duration, price, note, and CTA.
- Variants: normal, highlighted.
- Spacing: --space-4 to --space-5 padding.
- States: CTA hover/focus; no auto-animated price changes.
- Accessibility: price text includes currency and duration.

### FAQ Item

- Structure: card with strong question and paragraph answer.
- Variants: standard.
- Spacing: --space-4 padding.
- Accessibility: question text must be readable without expanding interaction.

### Airport Review Card

- Structure: section with H3 link, short review summary, and one intent/highlight line.
- Variants: homepage preview, reviews index item.
- Spacing: same as Topic Card.
- States: link hover only; card remains a readable content block rather than a fake full-card button.
- Accessibility: review names and claims must be visible text, not image-only content.

### Review Detail Table

- Structure: two-column table with metric label and value.
- Variants: airport facts, subscription facts.
- Spacing: table cell padding follows --space-2 to --space-3.
- Accessibility: use real table markup for label/value comparison.

### Evidence Figure

- Structure: `figure` with one responsive screenshot and `figcaption`.
- Variants: plan screenshot, speed test screenshot, streaming unlock screenshot.
- Spacing: --space-4 external gap, --space-3 caption padding.
- Accessibility: screenshots need specific alt text naming the airport, image type, and key facts visible in the image.
- Performance: every image includes intrinsic width and height to prevent layout shift.

## 6. Motion & Interaction

### Timing

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Micro | 120ms | ease-out | Button hover color |
| Standard | 200ms | ease-in-out | Surface hover emphasis |

### Rules

- Static pages do not need decorative animation.
- Hover changes use color, underline, border-color, transform, or opacity only.
- Respect reduced motion by keeping movement minimal.

## 7. Depth & Surface

### Strategy

Mixed, but restrained: borders carry normal separation; a light shadow may be used only on the Telegram service page hero/pricing area.

| Level | Value | Usage |
|-------|-------|-------|
| Border/default | 1px solid var(--border-default) | Cards and tables |
| Shadow/service | 0 14px 40px rgba(23, 32, 51, 0.08) | Premium service proof panels |

## 8. Accessibility Constraints & Accepted Debt

### Constraints

- Target WCAG 2.2 AA.
- Links and buttons need meaningful text.
- Every page uses one H1, semantic sections, `lang="zh-CN"`, viewport meta, canonical, and a specific title/description.
- Visible proof screenshots may not expose customer private identifiers.

### Accepted Debt

| Item | Location | Why accepted | Owner / Exit |
|------|----------|--------------|--------------|
| Shared inline CSS | Static HTML generator | The repo is intentionally dependency-free and GitHub Pages friendly. | Extract only if style duplication blocks future edits. |
