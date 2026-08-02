---
name: Koworkia Core
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#434655'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#006242'
  on-tertiary: '#ffffff'
  tertiary-container: '#007d55'
  on-tertiary-container: '#bdffdb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Sora
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

The design system is engineered for a high-performance SaaS environment, specifically tailored to the dynamic world of coworking space management. The brand personality is professional yet energetic, bridging the gap between corporate reliability and the creative spark of community workspaces.

The visual direction follows a **Corporate Modern** style with subtle **Material Design** influences. It prioritizes clarity, efficiency, and a frictionless user experience. The interface utilizes generous whitespace and a structured information hierarchy to reduce cognitive load for community managers and members alike. The emotional goal is to evoke a sense of organized productivity and welcoming professional hospitality.

## Colors

The palette is anchored by **Koworkia Blue** (#2563EB), representing stability and the technological foundation of the platform. **Action Orange** (#F59E0B) is used strategically for primary calls-to-action, high-priority alerts, and "Book Now" triggers to provide warmth and immediate visual salience.

- **Backgrounds:** Use `#FAFAFA` for the main application canvas and `#FFFFFF` for elevated cards and containers to create a distinct depth hierarchy.
- **Surface Neutrals:** `#F3F4F6` is reserved for inactive states, subtle borders, and secondary UI backgrounds.
- **Functional Colors:** Green (#10B981) for availability/success and Red (#EF4444) for error states or room occupancy conflicts.

## Typography

This design system utilizes a dual-font strategy. **Sora** provides a modern, geometric character for headlines, giving the brand a distinct and friendly voice. **Inter** is the workhorse for all functional UI elements, chosen for its exceptional legibility in data-heavy SaaS dashboards.

- **Headlines:** Use Sora with tighter letter-spacing for a premium, custom-type feel.
- **Body Text:** Inter should be used for all long-form reading and interface labels.
- **Scale:** Maintain a clear vertical rhythm. Use `label-sm` specifically for metadata and secondary categorization.

## Layout & Spacing

The layout is built on a **12-column fluid grid** for desktop and a **4-column grid** for mobile. The system uses an 8pt linear scale to ensure consistent alignment and mathematical harmony across all components.

- **SaaS Dashboard Layout:** A persistent left-hand sidebar (256px) with a fluid content area. 
- **Grids:** Use 24px gutters for standard dashboard widgets. For dense data tables, reduce internal cell padding to 12px.
- **Safe Zones:** Content should maintain a minimum 48px margin from the screen edges on desktop to prevent visual crowding.

## Elevation & Depth

Depth is communicated through **Tonal Layers** and **Ambient Shadows** rather than harsh borders. This creates a soft, approachable feel typical of modern SaaS platforms.

- **Level 0 (Floor):** `#FAFAFA` - Main background.
- **Level 1 (Card):** `#FFFFFF` with a `shadow-sm` (0 1px 2px rgba(0,0,0,0.05)). Used for primary content sections.
- **Level 2 (Hover/Modal):** `#FFFFFF` with a `shadow-md` (0 4px 6px -1px rgba(0,0,0,0.1)). Used for interactive cards on hover and floating action buttons.
- **Level 3 (Overlay):** Standard system dialogs with a 20% opacity black backdrop blur.

## Shapes

The design system employs a **Rounded** shape language to soften the professional aesthetic. A consistent 8px (0.5rem) corner radius is applied to all primary containers, inputs, and buttons.

- **Standard (8px):** Buttons, Text Inputs, and standard Cards.
- **Large (16px):** Main layout containers and modal windows.
- **Pill (Full):** Status tags (e.g., "Available", "Occupied") and search bars.

## Components

### Buttons
- **Primary:** Background `#F59E0B`, Text White. Hover state deepens the saturation.
- **Secondary:** Background `#2563EB`, Text White. Used for administrative actions.
- **Ghost:** Transparent background, primary color border and text.
- **States:** All buttons must include a 200ms transition for hover. The loading state replaces text with a center-aligned 16px spinner.

### Input Fields
- **Style:** Outlined with a 1px `#D1D5DB` border. On focus, the border transitions to 2px `#2563EB` with a soft blue outer glow.
- **Labels:** Clear, persistent labels placed above the field in `label-md`. Support for optional "helper text" below the input for validation.

### Cards
- **Auth Cards:** Centered on screen, white background, 32px internal padding, `shadow-md`.
- **Dashboard Widgets:** Minimalist white cards with an 8px border-radius and a subtle 1px border `#F3F4F6`.

### Additional Components
- **Status Chips:** Small, pill-shaped indicators using low-saturation background tints (e.g., light green background with dark green text for "Active").
- **Booking Calendar:** High-contrast grid using the Primary Blue for selected slots and Action Orange for "Pending Approval" status.