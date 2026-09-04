# Handoff: 7WONDERS Event Platform

## Overview
A two-surface event site for **7WONDERS** (Braga, 12th September), a day-into-night festival at a golf club: a daytime "recinto" with six activity zones, a ticketed Main Stage from 18H–02H, private VIP tables, and a secret invite-only after party. The platform lets attendees browse the schedule, enroll in free wellness/spirit classes, view the private-table map, buy tickets (external link to 3cket), and apply for the after party.

## About the Design Files
The two `.dc.html` files in this bundle are **design references built in HTML** — high-fidelity prototypes of look, content, and interaction, not production code to copy verbatim. The task is to **recreate these designs in the target codebase's real environment** (React Native / React / Vue / native mobile, whatever the project already uses) using its established component patterns — or, if no environment exists yet, pick the most appropriate stack and implement the designs there.

- `7WONDERS App.dc.html` — **mobile** experience: single column, max-width 480px, sticky top nav bar with 6 icon tabs.
- `7WONDERS Site Desktop.dc.html` — **desktop** experience: same content and logic, wider max-width 1240px layouts, multi-column grids.

Both files are functionally identical (same screens, same data, same state logic) — only the layout adapts per breakpoint. In production this should likely be ONE responsive app, not two separate builds.

## Fidelity
**High-fidelity.** Colors, typography, spacing, copy, and interaction flows are final. Recreate pixel-close using the codebase's existing component library where one exists.

## Brand / Design Tokens

**Colors** (used as CSS hex/oklch-equivalent, no gradients):
- `#FBF7EB` — linen cream (light background)
- `#315C27` — forest green (primary/brand)
- `#AA9D8D` — warm taupe/greige (secondary text, accents on dark)
- `#111111` — near-black (dark section background, ink text)
- White `#FFFFFF` used for form inputs.

**Background texture**: both light and dark sections use a subtle noise SVG (`feTurbulence`) plus a 4px hairline cross-hatch (`repeating-linear-gradient`) as a paper/linen texture — see the `background-image` on `body` and on each dark `<div>` section. Not critical to replicate exactly; a subtle grain/noise texture is the intent.

**Typography**: single family, **Archivo** (Google Fonts, weights 400/500/600/700/800), no serif/secondary face. Headings use `font-weight:800`, `letter-spacing:-0.01em` on large sizes; labels/eyebrows use `font-weight:700`, `letter-spacing:.1em–.2em`, uppercase, small (10–12px). Numerals use `font-variant-numeric: tabular-nums` throughout (times, prices, counts).

**Radius**: pills/buttons `border-radius:999px`; cards/images `10–18px`; small tags `2–3px` (deliberately sharp, not pill, for the private-table price legend).

**Shadows**: soft, dark, offset down — e.g. `0 16px 44px rgba(0,0,0,.4)` on images over black, `0 8px 22px rgba(0,0,0,.3-.35)` on buttons over black, `0 3px 10px rgba(49,92,39,.2-.25)` on green pills over cream.

## Screens / Views
Both files share one root state machine with a `page` field switching between six views (no router — plain conditional `display:block/none`). Recreate as real routes/screens in production.

### 1. Geral (General / Home)
- Full-bleed hero photo (desktop 520px tall, mobile 340px) of the main stage at night, `object-fit:cover`, with a bottom gradient fading into the cream background.
- Headline: "Doze horas. / Um campo de golfe." (two lines, second line in taupe).
- One paragraph of body copy.
- Two pill rows: `14H — 22H` (green pill) "RECINTO · SEIS ZONAS", and `18H — 02H` (black pill) "MAIN STAGE" — desktop wraps these in a translucent card.
- **"O DIA" timeline**: 4-stop horizontal timeline (14H recinto+market open, 15H30 run club+aulas open, 18H main stage opens, 22H market+activities close) — a row of dots on a connecting line, each with a big tabular-nums hour and 1–2 caption lines alternating green/taupe.
- **"Seis zonas" list**: one row per zone (Wellness Zone, Vinyl Sessions, Art & Culture, Spirit & Soul, Food Truck Village, 7W Market) — each row: zone name (large), 2–4 alternating-color caption lines, an optional hour pill, and a photo (real photos for Wellness/Vinyl/Art/Spirit/Food/Market — all six now have real photography, `object-fit:cover`, ~230px tall desktop / 160px mobile, rounded corners + shadow).
- Two CTA buttons at the bottom: "VER O HORÁRIO" (→ Atividades) and "BILHETES" (→ Bilhetes).

### 2. Atividades (Activities schedule)
- Title "WELLNESS ZONE & SPIRIT & SOUL", one paragraph, DATA/HORÁRIO/LOCAL facts row.
- **Time grid**: CSS grid, hour column (15H→19H, 30-min rows) on the left, then WELLNESS (2 sub-columns) and SPIRIT & SOUL (2 sub-columns) as column groups. Each activity is a colored block positioned by `grid-row: start / span N` matching its time slot. Three tone styles: solid green (bookable, wellness-led), outline green (bookable, more casual), solid black (spirit/soul).
- Activities and their real capacity split (see State Management below): Warm Up, Barre Class (@soloStudio), Fitness Class (@robfitness), CrossFit Class (@bracaracf), Run Club (@pacenlovehealthclub @bamobora), Yoga (@mantayoga), Cacau's Ritual (@mae__natureza, 16H30–18H). Each shows a small "by @handle" caption under its name.
- Two **info-only** (non-bookable) blocks: Ice Bath & Sauna (@alaskarecover, free, no signup) and a combined "Reiki · Tarot · Massagens" block spanning the full day (15H–19H, paid on-site, first-come-first-served, prices 10€/10€/15€ shown together in its modal).
- Footer row: "PROGRAMA SUJEITO A ALTERAÇÕES" + live enrolled-count.

### 3. Main Stage
- Dark section. Eyebrow "MAIN STAGE · 18H — 02H".
- Desktop: full event flyer image on the left; on the right a compact headliner block (small square photo + "REELOW" + "SOLID GROOVES | REECORDS"), a divider, then a clean list of the 3 support acts (Tony Shades B2B Goan, Isis Sage, Øxentä) as plain rows — NOT giant repeated type (this was explicitly redesigned away from an earlier version that displayed every name at the same huge scale).
- Blurb + "BILHETES" CTA (cream pill button).

### 4. Privados (VIP tables)
- Dark section. A real photo of the 12-table floor plan (2 levels × 6 tables) replaces an earlier hand-drawn grid.
- Price legend: 3 rows with a small swatch + label — `03 · 04 — 1000€` (filled cream swatch), `01·02·05·06 — 800€` (outlined swatch), `07–12 — 700€` (dashed taupe swatch).
- "RESERVA POR TELEFONE" block: phone number as a large tappable `tel:` link (`+351 938 096 150`), plus a "RESERVAR POR WHATSAPP" button (`wa.me` link). No online purchase — reservation is a phone/WhatsApp call, human-confirmed.

### 5. Bilhetes (Tickets)
- Dark section. "BLIND TICKET" shown SOLD OUT with a 100% progress bar.
- Two smaller ticket types still on sale, each a card linking out to the real 3cket event page: "General Admission — Early Entry" (10€, valid until 19H) and "General Admission — 1st Release" (15€).
- Big "COMPRAR EM 3CKET" CTA card (external link, opens new tab) — **all real ticket sales happen off-platform on 3cket**, this app never processes payment.
- Facts: date/venue, opening hours, +18.
- One line pointing to Privados for VIP tables (which are NOT sold on 3cket).

### 6. After Party (secret / invite-only)
- Dark section. Eyebrow "☾ AFTER PARTY · SECRETO".
- Three pills: `02H — 06H`, `SECRET LOCATION` (dashed border, deliberately looks incomplete/mysterious), `INVITE ONLY`.
- **No address or lineup is ever shown** — this is intentional: the after party's whole premise is that only accepted applicants find out where it is (presumably via a follow-up phone call/text, outside this app).
- A single application form: First name, Last name, Phone, Email, and one open textarea labeled "DIZ-NOS 3 RAZÕES PARA TE CONVIDARMOS PARA O AFTER PARTY" (give us 3 reasons to invite you). Submit button: "VAMOS ANALISAR" ("we'll review it").
- On submit (client-side only in the prototype — needs a real backend), the form is replaced by a confirmation card: "Candidatura enviada." + note that only accepted applicants are contacted by phone.

## Modal (shared across all screens)
A single bottom-sheet-style modal (mobile: slides from bottom, `border-radius:16px 16px 0 0`; desktop: centered card) handles three cases by `modal.type`:

1. **Activity, bookable, not yet validated** (`showValidate`): collects First name / Last name / Phone / Email. If the activity has a capacity cap, shows a pill above the form: "APENAS N VAGAS LIVRES" (only N spots left) computed live from remaining capacity. Button: "ENVIAR CÓDIGO POR SMS" (disabled/grey until all fields filled).
2. **SMS code step** (`showCode`): after step 1, shows "Enviamos um código por SMS para {phone}" and a single big centered code input. Button "VALIDAR CÓDIGO" (mock: accepts any 4+ digit string — **there is no real SMS integration**, see Outstanding Backend Work below). A "← corrigir dados" link goes back a step.
3. **Confirm / info step** (`showConfirm`): shows DIA/HORA/LOCAL facts and either "INSCREVER-ME" (enroll) / "ANULAR INSCRIÇÃO" (cancel, if already enrolled) / "SEM VAGAS" (disabled, if capacity is exhausted) for bookable activities; OR for `infoOnly` activities (Ice Bath, Reiki/Tarot/Massagens) just shows the info + price + an "ENTENDIDO" (got it) button that simply closes the modal — no enrollment state.
4. Separately, tapping a VIP table box opens the same modal shape with camarote number, capacity, price, position, and a "RESERVAR PELO +351 938 096 150" button (tel: link).

## State Management
Root component state (per-session only, `useState`-equivalent, **not persisted, not shared across devices** — see Outstanding Backend Work):

- `page`: which of the 6 screens is active.
- `enrolled: { [activityId]: boolean }` — which activities the current visitor has joined.
- `enrolledKind: { [activityId]: 'convite' | 'bilhete' }` — remembers which capacity pool an enrollment consumed, so cancelling frees the right pool.
- `usage: { [activityId]: { convite: n, bilhete: n } }` — running count consumed per pool per activity. **Pre-seeded** at load with the already-allocated guest-list numbers (see Capacity table) so those reserved spots read as already taken from the first render, without ever showing the guest/ticket distinction to the visitor.
- `modal`: `{ type: 'act'|'box', id }` or `null`.
- `step`: `'validar' | 'codigo' | 'confirmar'` — the current modal step.
- `ticket`: the in-progress enrollment form `{ firstName, lastName, phone, email, code }`.
- `validated`: whether the current session already passed SMS validation once (validation is required once per activity, not literally once per session, in the current logic — confirm intended behavior with the client).
- `after`: the after-party application form `{ firstName, lastName, phone, email, reasons }`.
- `afterSubmitted`: boolean, shows the confirmation card once true.

### Capacity table (as given by the client, "convite" = pre-reserved guest-list seats invisible to the public, "bilhete" = seats open to any ticket holder)
| Activity | Convite (pre-filled) | Bilhete (open) | Total |
|---|---|---|---|
| Barre Class | 0 | 10 | 10 |
| Fitness Class (Rob) | 15 (already consumed) | 15 | 30 |
| CrossFit Class | 24 (already consumed) | 11 | 35 |
| Run Club | 0 | 49 | 49 |
| Yoga | 0 | 15 | 15 |
| Cacau's Ritual | 0 | 15 | 15 |
| Ice Bath & Sauna | — (info-only, unlimited, free) | — | — |
| Reiki / Tarot / Massagens | — (info-only, paid on-site, 10€/10€/15€) | — | — |

**Important product decision to confirm with the client**: the "convite" vs "bilhete" split is currently invisible to the end user by design (a request from the client mid-project — they explicitly did NOT want visitors to know a guest-list split exists). The client also asked for this to eventually check a real guest list / 3cket ticket database automatically. **Neither exists yet** — right now every new signup is silently assigned to whichever pool still has room, defaulting to "convite" first. This needs real guest-list data or a 3cket API integration to be accurate in production.

## Outstanding Backend Work (must be built for production — none of this exists today)
This is a static, client-only prototype. Nothing here is wired to a real backend. A developer must build:
1. **SMS code send + verify** for activity enrollment (the UI mocks this — any 4+ digit code is accepted).
2. **Ticket validation** against the real 3cket purchase database, so only actual ticket holders can enroll in free activities.
3. **Guest-list check** (or 3cket API integration) to correctly and automatically assign the convite/bilhete capacity split described above, instead of the current "first pool with room" placeholder logic.
4. **Persistent, shared capacity counters** — today capacity/usage state lives only in the visitor's browser tab and resets on reload; it must be a real shared counter (e.g. a database) so two people signing up don't both get the last spot.
5. **After Party application storage + review workflow** — the form currently just flips a local boolean; submissions need to land somewhere the organizers can read (a database, spreadsheet, or inbox) and be actioned (accept/reject → contact by phone).
6. **VIP table reservation** is intentionally phone/WhatsApp-only (human-in-the-loop) per the client's request — no online payment needed there, just make sure the `tel:`/`wa.me` numbers are correct in production.

## Assets
- `uploads/7wonders-logo.png` — wordmark, used small in the top bar and larger in the footer.
- `uploads/IMG_8232.PNG` — official event flyer (Main Stage), includes date + full lineup baked into the image.
- `uploads/IMG_8264.PNG` — headliner (Reelow) portrait photo.
- `uploads/hero-tablet-8dff8ef4.jpg` / `uploads/hero-mobile.jpg` — hero photos for the Geral screen (desktop/mobile crops).
- `uploads/zone-vinyl.jpg`, `uploads/hf_20260820_181505_...png` (Art & Culture), `uploads/hf_20260818_163523_...png` (7W Market) — zone photography.
- `assets/zone-wellness.jpg`, `assets/zone-spirit.jpg`, `assets/zone-food.jpg` — zone photography, re-compressed from client-supplied originals (originals were 10MB+ HEIC/PNG exports that failed to load reliably; re-exported as ~1MB JPEGs at the same crop).
- `assets/privados-mapa.png` — VIP table floor-plan photo, cropped to remove a redundant header baked into the original image.
- `assets/ready-for-a-swing.png` — a hand-lettering "READY FOR A SWING" wordmark that was designed into an earlier version of the hero and was later removed at the client's request; kept here only for reference, not currently used on either screen.

## Files
- `7WONDERS App.dc.html` — mobile design reference (open directly in a browser).
- `7WONDERS Site Desktop.dc.html` — desktop design reference (open directly in a browser).
- Both are self-contained single-file HTML/CSS/JS (inline styles, one `<script>` block per file) — read them top to bottom for exact markup, copy, and the `renderVals()` function for exact state logic to port.
