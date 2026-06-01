---
name: Teal Precision
colors:
  surface: '#f8f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f8f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3c4a46'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6c7a76'
  outline-variant: '#bbcac4'
  surface-tint: '#006b5c'
  primary: '#006b5c'
  on-primary: '#ffffff'
  primary-container: '#00bfa5'
  on-primary-container: '#00473c'
  inverse-primary: '#44ddc1'
  secondary: '#0056c5'
  on-secondary: '#ffffff'
  secondary-container: '#0f6df3'
  on-secondary-container: '#fefcff'
  tertiary: '#b81d27'
  on-tertiary: '#ffffff'
  tertiary-container: '#ff8680'
  on-tertiary-container: '#830012'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#68fadd'
  primary-fixed-dim: '#44ddc1'
  on-primary-fixed: '#00201a'
  on-primary-fixed-variant: '#005145'
  secondary-fixed: '#d9e2ff'
  secondary-fixed-dim: '#b0c6ff'
  on-secondary-fixed: '#001945'
  on-secondary-fixed-variant: '#00429b'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ae'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930015'
  background: '#f8f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
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
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  card-padding: 24px
---

## Brand & Style
The design system is defined by a philosophy of **Modern Minimalism** with a focus on data clarity and professional efficiency. It is designed for SaaS platforms, dashboards, and analytical tools where information density must be balanced with visual breathing room. 

The aesthetic is characterized by:
- **Spaciousness:** Generous white space to reduce cognitive load.
- **Precision:** Crisp geometry and purposeful use of color to highlight actionable data.
- **Trustworthiness:** A "Corporate Modern" feel that uses a vibrant primary teal to convey energy without sacrificing professional reliability.
- **Focus:** High contrast between interactive elements and neutral backgrounds ensures that the user's attention is always directed toward insights.

## Colors
The palette is anchored by a vibrant **Teal (#00bfa5)**, used primarily for navigation sidebars, active states, and primary actions. 

- **Primary:** Teal is the signature brand color. It represents growth and precision.
- **Secondary:** An Electric Blue is utilized for secondary data series in charts and links to provide clear differentiation from the primary teal.
- **Tertiary:** A Soft Red is reserved for "Alert" or "Critical" data points and destructive actions.
- **Neutral:** The background system uses a hierarchy of greys starting from white (#ffffff) for cards, moving to a very light grey (#f5f7f9) for the global canvas background.
- **Accents for Charts:** In addition to the primary and secondary colors, use an amber (#ffc107) and deep purple (#673ab7) for complex multi-series data visualization to maintain high legibility against white surfaces.

## Typography
This design system utilizes **Inter** across all levels to ensure maximum legibility and a contemporary, technical feel. 

- **Headlines:** Use Bold (700) and Semi-Bold (600) weights with slight negative letter-spacing for a compact, authoritative look.
- **Body Text:** Standardized at 14px and 16px for optimal reading comfort. 
- **Labels:** Small caps or uppercase transformations are applied to category labels and table headers to create a clear visual hierarchy between metadata and content.
- **Contrast:** High-emphasis text uses a dark slate (#1a1a1a), while secondary text uses a muted grey (#6b7280).

## Layout & Spacing
The layout follows a **Fluid Grid** model with fixed maximum widths for content containers on ultra-wide screens.

- **Grid:** A 12-column grid is used for desktop layouts. Components typically span 3, 4, 6, or 12 columns.
- **Sidebar:** A fixed-width vertical navigation (260px) is recommended, utilizing the primary teal background as seen in the reference.
- **Rhythm:** An 8px linear scale (incremented by 4px for tight areas) governs all padding and margins. 
- **Mobile Adaption:** At the 768px breakpoint, the sidebar transitions to a hidden drawer or bottom navigation, and margins reduce to 16px to maximize screen real estate for data cards.

## Elevation & Depth
Depth is created through **Tonal Layers** and **Ambient Shadows** rather than heavy borders.

- **Base Layer:** The global background is a flat, very light grey (#f5f7f9).
- **Surface Layer:** Cards and containers are pure white (#ffffff). 
- **Shadows:** Use a "Soft Bloom" shadow for cards: `0px 4px 20px rgba(0, 0, 0, 0.05)`. This creates a subtle lift without making the UI feel cluttered.
- **Interactions:** On hover, cards may increase their shadow depth slightly or add a 1px border in the primary teal color to indicate focus.

## Shapes
The shape language is consistently **Rounded**, promoting a modern and accessible feel.

- **Components:** Standard buttons, input fields, and small cards use a **12px (0.75rem)** corner radius.
- **Large Containers:** Dashboard cards and main content areas may use a slightly larger **16px (1rem)** radius to anchor the layout.
- **Icons:** Use a consistent 2px stroke width with slightly rounded terminals to match the UI's geometry.

## Components

### Buttons
- **Primary:** Solid Teal (#00bfa5) with white text. 12px border radius. No border.
- **Secondary:** Ghost style with a 1px Teal border and Teal text.
- **Tertiary:** Pure text buttons for low-priority actions.

### Cards
- White background, 12px rounded corners, and a subtle ambient shadow. 
- Padding should be a minimum of 24px to ensure data within doesn't feel cramped.

### Input Fields
- Soft grey background (#f1f3f5) or a 1px light grey border (#e0e0e0).
- On focus: 1px Teal border with a 2px Teal glow (low opacity).

### Dashboard Elements (Charts)
- **Lines/Bars:** Use the Primary Teal for the main data series. Use Secondary Blue and Accent colors for additional series.
- **Grid Lines:** Extremely faint (#f0f0f0) to keep the focus on the data.
- **Tooltips:** Dark background (#1a1a1a) with white text for maximum contrast when hovering over light chart areas.

### Navigation Sidebar
- Full-height Primary Teal background.
- Active items: A slightly darker shade of teal or a high-contrast white "pill" indicator to the left of the menu label.
- Icons: White with 70% opacity for inactive states, 100% opacity for active.