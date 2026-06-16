# Design System Documentation: Archival Modernism

## 1. Overview & Creative North Star
### The Creative North Star: "The Sovereign Archive"
This design system moves beyond the generic "dashboard" aesthetic to create an environment of **Archival Modernism**. In the context of GovTech and social housing, the UI must act as a source of absolute truth—authoritative, transparent, and immutable. 

While the data is dense, the experience must feel editorial. We achieve this by rejecting the "boxed-in" layout of traditional enterprise software. Instead, we use **Intentional Asymmetry** and **Tonal Layering**. By overlapping surfaces and using high-contrast typography, we create a rhythmic flow that guides an administrator through complex lottery datasets without the claustrophobia of a standard grid.

---

## 2. Colors & Surface Philosophy
The palette is rooted in deep, authoritative blues and architectural grays, ensuring a "serious" tone that commands respect.

### The "No-Line" Rule
To achieve a premium, custom feel, **1px solid borders are prohibited for sectioning.** Boundaries are defined strictly through background color shifts. 
- Use `surface` (#f8f9ff) for the base canvas.
- Use `surface_container_low` (#eff4ff) for secondary sidebar regions.
- Use `surface_container_highest` (#d5e3fc) to highlight active work zones.
- This creates a "soft" structural integrity that feels more modern and less cluttered than a cage of lines.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, fine paper sheets. 
1. **Level 0 (Canvas):** `background`
2. **Level 1 (Sections):** `surface_container`
3. **Level 2 (Cards/Widgets):** `surface_container_lowest` (Pure white #ffffff) to create a "lifted" effect.

### The "Glass & Gradient" Rule
To prevent the UI from feeling "flat" or "budget," main action buttons and active navigation states must utilize a subtle linear gradient: `primary` (#002045) to `primary_container` (#1A365D) at a 135-degree angle. Floating modals must use **Glassmorphism**: `surface_container_highest` with a 20px backdrop-blur and 80% opacity.

---

## 3. Typography: The Editorial Voice
We use **Inter** exclusively to bridge the gap between technical precision and human readability.

- **The Authority Header:** Use `display-sm` for page titles. Apply a letter-spacing of -0.02em to create a dense, "news-headline" impact.
- **The Data Label:** For table headers and metadata, use `label-md` in `on_surface_variant`. This ensures high density without sacrificing the "serious" tone.
- **The Body:** `body-md` is our workhorse. Ensure a line-height of 1.5 for readability in long-form housing applications.

---

## 4. Elevation & Depth
In this system, depth is a tool for information architecture, not just decoration.

- **The Layering Principle:** Instead of shadows, use "Tonal Stacking." Place a `surface_container_lowest` card atop a `surface_container_low` background. The contrast in luminosity provides all the separation the eye needs.
- **Ambient Shadows:** Only use shadows for "True Overlays" (e.g., dropdowns, modals). Use the `on_surface` color for the shadow at 6% opacity with a 32px blur—mimicking soft, natural light.
- **The Ghost Border Fallback:** If high-density data requires a physical separator (e.g., in a complex table), use a "Ghost Border." Apply `outline_variant` at **15% opacity**. A solid 100% opaque border is considered a failure of the design system.

---

## 5. Components

### High-Density Tables (The System Core)
- **Structure:** No vertical lines. Horizontal separators are "Ghost Borders" (15% opacity `outline_variant`).
- **Striping:** Use `surface_container_low` for alternating rows.
- **States:** Hovering over a row should transition the background to `surface_container_high`.

### Actionable Elements (Buttons & Chips)
- **Primary Button:** Gradient (`primary` to `primary_container`), `md` (0.375rem) corner radius. Use `on_primary` for text.
- **Secondary/Tertiary:** No background. Use `primary` text with a subtle `primary_container` hover state at 10% opacity.
- **Status Chips:** High-contrast backgrounds. 
    - *Approved:* `surface_container` with `on_tertiary_container` (Green tone) text.
    - *Pending:* Orange tone.
    - *Rejected:* `error_container` with `on_error_container`.

### Input Fields & Search
- **Styling:** Use `surface_container_lowest` with a subtle `outline` (#74777f) bottom-border only (2px). This mimics a signature line on a government document.
- **Focus:** Transition the bottom border to `primary` and add a very faint `primary_fixed` glow.

### Breadcrumbs & Navigation
- **Navigation Sidebar:** Use `surface_container_low`. Active states are indicated by a `primary` vertical bar (4px width) on the far left and a shift to `surface_container_high`.

---

## 6. Do’s and Don’ts

### Do:
- **Do** prioritize vertical whitespace over horizontal lines to separate content.
- **Do** use `title-sm` for card headers to maintain a professional, bold hierarchy.
- **Do** lean into "Density with Intent"—keep margins tight (Spacing 3 or 4) but ensure text is never touching.
- **Do** use the `tertiary` color tokens for "cautionary" or "historical" data callouts.

### Don’t:
- **Don’t** use standard "drop shadows" on cards; use tonal shifts between `surface` tiers instead.
- **Don’t** use pure black (#000000) for text. Always use `on_surface` (#0d1c2e) for a softer, premium feel.
- **Don’t** use fully rounded (pill-shaped) buttons. Stick to the `md` or `lg` scale to maintain a "structured" look.
- **Don’t** introduce new colors. The palette is intentionally restrictive to ensure transparency and focus.