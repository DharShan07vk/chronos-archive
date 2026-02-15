# Project Chronos – Digital Time Capsule Platform

## Design System: "The Blueprint"

- **Palette**: Alabaster canvas (`#F2F2F0`), Carbon ink (`#1A1A1A`), International Orange accent (`#FF4500`), White surfaces
- **Typography**: Oswald/Impact for headings (bold, condensed), JetBrains Mono for metadata/dates/counters
- **Visual Rules**: Hard borders everywhere creating visible grids, hard shadows (`4px 4px 0px`), no rounded corners, high-contrast brutalist aesthetic
- **Components Library**: `GridContainer`, `BrutalistButton`, `MarqueeBand`, `CapsuleCard`

## Page 1: Landing Page ("The Manifesto")

- **Hero**: Full-screen grid — left column with massive "SEND IT / TO THE FUTURE" typography, right column with a live millisecond clock counter in monospace
- **Scroll Animation**: GSAP ScrollTrigger draws horizontal black lines across the viewport as user scrolls (width 0% → 100%)
- **Marquee Band**: Infinite scrolling ticker — "SECURE • ENCRYPTED • TIME-LOCKED • FOREVER •"
- **Features Section**: Bento-box grid of square cards, each with a bold icon, description, and hard-edge CTA button

## Page 2: Dashboard ("The Archive")

- **Layout**: Sidebar + main feed separated by a thick 2px black vertical line
- **Sidebar**: Navigation with brutalist styling, filter controls
- **Capsule Cards**: Index-card style with title, ID number (`#CP-2026-X`), diagonal "LOCKED"/"OPEN" stamp effect
- **Interactions**: Cards slide up -4px on hover with deepening shadow (4px → 8px)

## Page 3: Create Capsule ("The Form")

- **Design**: Legal document aesthetic — inputs are thick bottom-borders only (no backgrounds, no rounded corners)
- **Fields**: Title, message/content textarea, date picker, share to other use via email
- **Date Picker**: Brutalist calendar — selected date is solid black with white text
- **Submit**: Full-width massive button — "ARCHIVE THIS MOMENT"

## Page 4: View Capsule ("The File")

- **Reveal Animation**: GSAP barn-door split (screen splits in half horizontally)
- **Left Panel**: Metadata — date created, date opened, mock weather data, all in monospace
- **Right Panel**: Content displayed on a pristine white "paper" surface with subtle border

## Page 5: Login Page

- **Brutalist auth form** with the same design language — bottom-border inputs, hard shadow card, bold typography

## Animations (GSAP)

- ScrollTrigger line-drawing effect on landing page
- TextPlugin typewriter effects on metadata/counters
- Barn-door reveal on capsule view
- Card hover micro-interactions
- Page transition effects

## Technical Notes

- Adding GSAP (with ScrollTrigger & TextPlugin) as a dependency
- Google Fonts: Oswald + JetBrains Mono
- All data is mock/local state (no backend) — capsules stored in React state
- React Router v6 for navigation between all pages