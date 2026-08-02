---
name: Koworkia Core
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf9'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e1e2ed'
  on-surface: '#191b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#4059aa'
  on-secondary: '#ffffff'
  secondary-container: '#8fa7fe'
  on-secondary-container: '#1d3989'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#EF4444'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dce1ff'
  secondary-fixed-dim: '#b6c4ff'
  on-secondary-fixed: '#00164e'
  on-secondary-fixed-variant: '#264191'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ed'
  success: '#10B981'
  text-primary: '#111827'
  text-secondary: '#6B7280'
  bg-surface: '#F1F5F9'
typography:
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Sora
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2rem
  gutter: 1rem
  margin-mobile: 1rem
  margin-desktop: 2rem
---

## Brand & Style

The design system projects a personality that is **professional, efficient, and reliable**, specifically tailored for the management of coworking environments. It balances the warmth required for community spaces with the rigor of a functional SaaS productivity tool.

The visual style is **Corporate Modern**, heavily influenced by high-utility dashboards. It prioritizes clarity and speed of interaction. The aesthetic is defined by:
- **Clarity:** Generous white space and high-contrast typography to ensure management metrics are scannable.
- **Precision:** Clean, geometric shapes and a structured grid that reflects the organized nature of a managed workspace.
- **Subtle Modernity:** Using soft shadows and subtle borders to create a layered, multi-dimensional UI without excessive decoration.

## Colors

The color palette is rooted in a professional blue spectrum, designed to evoke trust and technological stability. 

- **Primary Blue (#2563EB):** Used for primary actions, active navigation states, and key interactive elements.
- **Deep Navy (#1E3A8A):** Provides architectural depth, used for headers, sidebars, or high-level information hierarchy.
- **Functional Semantic Palette:** Includes a clear Emerald green for successful bookings and a vibrant Red for errors or cancellations, ensuring immediate status recognition.
- **Neutral Foundation:** Utilizes a cool Slate Gray scale for backgrounds and secondary text to maintain a clean, "uncluttered" interface that emphasizes user content.

## Typography

This system uses a dual-font approach to distinguish between branding and utility. 

- **Sora** is reserved for headlines, titles, and high-level dashboard summaries. Its geometric nature adds a distinct, modern character to the brand.
- **Inter** is the primary UI typeface, chosen for its exceptional legibility at small sizes and its neutral, "invisible" quality within complex data tables and forms.

For mobile devices, headlines scale down to prevent text wrapping issues: `headline-lg` should adjust to `24px` on screens narrower than 640px.

## Layout & Spacing

The design system employs a **Fluid Grid** model with standard 12-column layouts for desktop dashboard views. 

- **Spacing Rhythm:** Based on a 4px baseline, ensuring all components align to a consistent vertical and horizontal rhythm. 
- **Sidebar Layout:** The dashboard utilizes a fixed-width left navigation sidebar (260px) that collapses into a bottom navigation bar or a hamburger menu on mobile devices.
- **Breakpoints:**
  - **Mobile (< 640px):** Single column, 16px side margins.
  - **Tablet (640px - 1024px):** 2-column card layouts, 24px margins.
  - **Desktop (> 1024px):** Full dashboard view with fixed sidebar and fluid main content area.

## Elevation & Depth

Visual hierarchy is established through a combination of **Tonal Layering** and **Ambient Shadows**.

1. **The Canvas:** The primary application background uses a light gray surface (`#F1F5F9`) to define the workspace.
2. **Surface Containers:** Cards and interactive modules are placed on pure white (`#FFFFFF`) surfaces.
3. **Shadow Character:** Use soft, diffused shadows with low opacity (e.g., `box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1)`). 
4. **Active States:** Subtle inner shadows or slight tonal shifts (darkening the background by 5%) are used to indicate pressed or active states for buttons and list items.

## Shapes

The shape language is **Rounded**, striking a balance between approachable friendly design and professional structure.

- **Standard Radius:** 0.5rem (8px) for buttons, input fields, and standard cards.
- **Large Containers:** 1rem (16px) for major dashboard sections and modal windows.
- **Pills:** Used exclusively for status badges (e.g., "Active", "Confirmed") and tags to differentiate them from interactive buttons.

## Components

### Buttons
- **Primary:** Solid `#2563EB` background with white text. 8px rounded corners.
- **Secondary:** Outlined with primary color or light gray.
- **Success/Error:** Reserved for destructive actions (Delete) or final confirmations (Book).

### Input Fields
- White background with a 1px border (`#D1D5DB`). On focus, the border transitions to Primary Blue with a 2px outer glow.
- Labels are always positioned above the field in `label-md` style.

### Cards
- Used for dashboard metrics and space listings.
- Pure white background, 8px radius, and a subtle 1px border or ambient shadow.

### Chips & Badges
- Used for "Tipo de Espacio" (e.g., Sala de reuniones, Puesto fijo).
- Small text size, pill-shaped, using low-saturation versions of the brand colors for background (e.g., light blue tint for Flex Desk).

### Lists & Tables
- Modern, "borderless" table style. Rows are separated by 1px horizontal lines (`#F1F5F9`).
- Hover states on list items should use a subtle background tint to indicate interactivity.