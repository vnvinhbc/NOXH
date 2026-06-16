# Design System Documentation: The Architectural Integrity

## 1. Overview & Creative North Star
**The Creative North Star: "The Digital Pillar"**

In the realm of GovTech, we must move away from the "cluttered bureaucracy" of legacy systems. This design system is built on the philosophy of **Architectural Integrity**. It treats digital space as a physical, civic monument: stable, transparent, and authoritative. 

Instead of a standard "app" feel, we employ an **Editorial-Civic** aesthetic. This means using aggressive white space to reduce cognitive load, oversized typography for absolute clarity, and a "layered paper" metaphor that suggests a sequence of organized, transparent processes. We break the template look by using intentional asymmetry—placing content off-center or using varying card widths—to guide the eye through complex government workflows without overwhelming the citizen.

---

## 2. Colors: Tonal Authority
Our palette is rooted in deep, stable blues, but its sophistication comes from how we layer these tones.

### The Palette
- **Primary Tone (`primary` #001f49):** The "Navy Foundation." Reserved for high-level navigation and headers to anchor the experience in trust.
- **Action Tone (`surface_tint` #115cb9):** The "Cobalt Pulse." Used for primary interactions and critical path buttons.
- **Functional Accents:**
    - `tertiary` (#321c00) for "Pending" states (Vàng/Chờ duyệt).
    - `error` (#ba1a1a) for "Rejection" (Đỏ/Từ chối).
    - `secondary` (#465f88) for "Success/Validation" (Xanh lá - mapped to a professional teal-leaning blue-green for harmony).

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to separate sections. Structure is achieved through:
- **Background Shifts:** Placing a `surface_container_lowest` (#ffffff) card on a `surface` (#f8f9fa) background.
- **Tonal Contrast:** Using `surface_container` (#edeeef) for sidebars to distinguish from the main workspace.

### Signature Textures
For hero sections or major status updates, use a **Linear Gradient** transitioning from `primary` (#001f49) to `primary_container` (#003471) at a 135-degree angle. This adds "soul" and depth, moving away from flat, "cheap" digital colors.

---

## 3. Typography: The Editorial Voice
We use **Inter** for its modern, neutral, and highly legible characteristics. To accommodate older citizens, we prioritize high-contrast ratios and generous line heights.

- **Display Scale (`display-lg` 3.5rem):** Used for large, welcoming headers on landing pages. It communicates "Modernity."
- **Headline Scale (`headline-md` 1.75rem):** Used for primary section titles in forms and portals.
- **Title Scale (`title-lg` 1.375rem):** The standard for card headers. Bold and definitive.
- **Body Scale (`body-lg` 1rem):** The default for all citizen-facing text. Never go below `body-md` (0.875rem) for critical information to ensure accessibility.

**Editorial Tip:** Use `on_surface_variant` (#44474e) for helper text and `on_surface` (#191c1d) for primary content. This subtle difference creates a natural reading hierarchy.

---

## 4. Elevation & Depth: Tonal Layering
Traditional GovTech uses heavy shadows. We use **Tonal Stacking**.

### The Layering Principle
Think of the UI as sheets of fine paper stacked on a light-grey desk.
1. **Base Layer:** `surface` (#f8f9fa)
2. **Structural Layer:** `surface_container_low` (#f3f4f5) for grouping content.
3. **Interactive Layer:** `surface_container_lowest` (#ffffff) for primary cards and input zones.

### Ambient Shadows
When a card must float (e.g., a modal or a primary action dashboard), use an **Ambient Shadow**:
- `X: 0, Y: 8px, Blur: 24px, Spread: -4px`
- Color: `on_surface` (#191c1d) at **6% opacity**. 
This mimics natural light and feels premium, not "heavy."

### Glassmorphism & Depth
For sticky navigation bars or floating status widgets, use a `surface` color at 80% opacity with a **20px Backdrop Blur**. This maintains the "Transparency" goal of the design system, allowing the citizen to see the "machinery" of the app behind the current task.

---

## 5. Components: Precision & Clarity

### Buttons
- **Primary:** `primary` background with `on_primary` text. Corners: `md` (0.75rem).
- **Secondary:** `surface_container_highest` background. No border.
- **The Action Hover:** On hover, primary buttons should shift to `primary_container`.

### Stepper Quy Trình (Process Stepper)
- **Visual Identity:** Use a thick 4px line for the track. 
- **Active State:** A `surface_tint` circle with a `white` dot inside.
- **Completed State:** A `primary` circle with a `secondary_fixed` checkmark.
- **Typography:** Labels must use `label-md` for secondary info and `title-sm` for the current step.

### Status Badges
- High-contrast only.
- **Approved:** `surface_container` background with `on_primary_fixed_variant` text.
- **Pending:** `tertiary_fixed` background with `on_tertiary_fixed` text.
- **Warning:** `error_container` background with `on_error_container` text.

### Cards & Lists
- **Prohibition:** No divider lines between list items. Use `spacing-4` (1.4rem) of vertical white space or a slight `surface_variant` background shift on hover to separate entries.
- **Corner Radius:** Standardize on `md` (0.75rem / 12px) for a balanced, professional look.

### File Upload Zones
- Use a "Ghost Border" (`outline_variant` at 20% opacity) with a dashed pattern.
- Background: `surface_container_low`.
- Icon: 24px Outline icon in `primary` blue.

---

## 6. Do's and Don'ts

### Do
- **Do** use `spacing-6` (2rem) and `spacing-8` (2.75rem) to let layouts "breathe."
- **Do** use `display-sm` for total transparency in numbers (e.g., "Bạn có **03** hồ sơ cần xử lý").
- **Do** align all text to the left for better readability in long forms.

### Don't
- **Don't** use 100% black text. Use `on_surface` (#191c1d) to reduce eye strain.
- **Don't** use 1px solid borders to box in content; let the background colors define the space.
- **Don't** use "vibrant" or "neon" colors. Stick to the muted, professional tones defined in the Material tokens.
- **Don't** clutter the screen. If a process has 10 steps, use the Stepper component to show only one at a time.