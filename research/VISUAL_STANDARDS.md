# Visual Standards — Palette, Texture, Hierarchy

Companion to HOUSE_STANDARDS.md (voice/dosing) and PROJECT_RULES.md (component rules). This is the visual vocabulary — what each color means, and the three techniques used to create hierarchy. Read by any model doing visual work on this repo.

## Palette

- Parchment `#f3ebda` — base background, everywhere. No dark mode. Chosen specifically because it's easier to read in the settings this app actually gets used in.
- Card surface `#fbf6ea` — slightly lighter than parchment, for card/tile surfaces sitting on the background.
- Ink `#241d2c` — body text. Warm near-black, not pure black.
- Field green `#234b33` — means grounded / foundational / sustainable. Maintenance tier, category badges, kicker labels.
- Ember `#d35400` — means active / energy / "this is where something is happening." Active tier, primary CTA buttons, the Watch For margin-flag.
- Midnight `#120d1f` — means anchor / gravity / "this is the one thing to remember." Reserved narrowly: card top hairline, Bottom Line block, hero background elements. Never a button — a button is an action, which is ember's job, not midnight's.

Each color has one job. Don't introduce a fourth meaning for an existing color, and don't reach for a color where outline-only or plain would do.

## Three techniques, not one "add color" move

- Outline — thin (1-1.5px) colored border, no fill, parchment shows through. Default treatment for anything with multiple parallel items (dose tiers, the Signal/System/Purpose trio, principle tiles). Quiet by nature — using it repeatedly across several tiles costs nothing, because it never competes for attention.
- Lift — a very light, wide, low-opacity shadow (roughly 8-12% opacity, wide blur, minimal offset) suggesting the element sits slightly off the page. Reserved for entry points only: a card's Analogy line, the home page hero. One per screen. This is an invitation — "start here."
- Fill — solid color background. Reserved for anchor moments only: a card's Bottom Line, the home hero's background treatment, primary CTA buttons (ember). This is a conclusion or an action — "remember this" or "do this now." Never more than one or two fill moments per screen.

Test before using any of the three: what job is this doing — invitation, anchor, or neither? If neither, it stays plain ink on parchment. Most of a card should be plain.

## Specific rulings already made

- No literal "Analogy" label — the functional title stands alone as a header; the "Think of it like..." sentence beneath it already signals the comparison. Applies to all three premium cards.
- Dose-tier labels are outline-only, mapped to their meaning (Maintenance = field green, Active = ember, High = midnight) — but the lift treatment does not go on any dose tier, regardless of which tier. Visual weight should never point at "take more" — that contradicts the dosing philosophy stated on the same card. The lift lives on Analogy instead.
- Primary action buttons ("Go deeper," "Add to synergy," "Browse peptides") are ember-filled, consistently — action buttons are ember's job everywhere, not midnight's, not card-specific.
- Neutral reference content (e.g., "What to monitor") gets no color treatment at all — plain header, no border, no accent. Reserving color for things that are actually a caution or an action keeps ember meaningful; coloring everything dilutes it.
- Background texture: a subtle grain/noise texture, CSS-only (no image asset — matters for offline load), applied uniformly across parchment surfaces. Barely perceptible; the goal is "paper," not "visible pattern."

## Typography — parked

Current fallback: Georgia / Iowan Old Style / Palatino Linotype, system serif stack for headings, system sans for UI labels. This is functional, not distinctive, and is understood to be a placeholder pending a deliberate typeface choice — which requires bundling a font file for offline caching, not just a CSS swap. Do not treat the current fallback as final; do not casually "fix" it either without this being revisited deliberately.

## Home page mapping

- Hero (kicker + headline + lead) gets the lift — same logic as card Analogy: it's the entry point at the app level, same technique, different scale.
- Existing molecule-diagram SVG on the hero: rendered thin/quiet (faint field-green stroke, low opacity) rather than bold — atmosphere behind the headline, not a competing graphic.
- Signal/System/Purpose trio and the two dosing-principle tiles: outline-only, uniform single accent color. Deliberately not color-differentiated per tile — there is no meaningful distinction between them the way there is between dose tiers, so forcing different colors would be decoration without information.
