# Comic Book Portfolio Redesign

**Date:** 2026-03-26
**Status:** Approved

## Overview

Redesign the 2D Phaser.js portfolio as a Comic Book Action experience using the Classic Spiderman palette. All 4 scenes become comic pages: thick black borders, halftone sky, red/blue/yellow caption bars, speech bubbles for Spiderman dialogue, and bold outlined UI elements throughout.

---

## Visual System

### Color Palette

| Role | Color | Hex |
|---|---|---|
| Headers, caption bars | Spiderman Red | `#E23636` |
| Panels, skill chips | Spiderman Blue | `#003B8E` |
| Action words, road dashes | Yellow | `#FFD700` |
| All outlines | Black | `#000000` |
| Page background | Paper | `#f0ece4` |
| Sky / game world | Night Blue | `#0d1b4b` |

### Typography
- **Impact** (all-caps, letter-spacing) — caption bars, chips, labels, action words
- **Comic Sans MS / Chalkboard SE** — speech bubbles, bio text, info strips

### UI Components

**Caption Bar** — colored full-width bar at top of each game panel
- Red: Boot (name/title) and Contact ("Send a web")
- Blue: About ("The origin story")
- Yellow: Projects ("Web-slinging some code")
- `border-bottom: 4px solid #000`, `box-shadow: 5px 5px 0 #000`

**Comic Panel Frame** — wraps each game world
- `border: 4px solid #000`, `box-shadow: 5px 5px 0 #000`
- Page background `#f0ece4` with dog-ear corner decoration

**Speech Bubbles** — replaces existing tooltip system
- White rounded rectangle, `border: 3px solid #000`, `border-radius: 14px`
- Tail pointing down toward Spiderman
- Font: Comic Sans MS, black text

**Skill Chips** — blue bordered tags
- `background: #003B8E`, `border: 2.5px solid #000`, `box-shadow: 2px 2px 0 #000`

**Action Words** — ZAP / POW / WEB scattered as decorations
- Impact font, yellow/red fill, thick black outline via text-shadow

**Info Strip** — white panel below each game panel
- `border: 3px solid #000`, `border-top: none` (joins game panel)
- Shows keyboard hints per scene

**Halftone Sky** — applied to all game panels
- `background: radial-gradient(circle, rgba(0,0,0,0.18) 1px, transparent 1px)`, `background-size: 5px 5px`
- Over `#0d1b4b` base

**Buildings** — existing procedural buildings, comic-styled
- `border: 3px solid #000` on each building rect
- Window lights use `#FFD700` with `border: 1.5px solid #000`

**Road** — existing road, comic-styled
- `border-top: 4px solid #000`
- Center dash: `#FFD700` repeating gradient

---

## Scene Designs

### Scene 1 — Boot (Hero)

**Caption bar:** Red · `BUNTHOEUN TOK` / `FULL-STACK DEVELOPER`

**Content:**
- Spiderman enters from left, plays warmup animation
- Speech bubble: *"YOUR FRIENDLY NEIGHBORHOOD DEV!"*
- Walk-right arrow hint (→) near right edge

**Navigation:** Walk right → About Me

---

### Scene 2 — About Me

**Caption bar:** Blue · `ABOUT ME` / `THE ORIGIN STORY`

**Content:**
- White card floating over city with:
  - "BIO" label (red, Impact) + bio text (Comic Sans)
  - "SKILLS" label (blue) + 6 skill chips: TypeScript, React, Node.js, Phaser, PostgreSQL, Docker
- Spiderman stands on right
- Speech bubble: *"PRESS I TO INTERACT!"*

**Navigation:** Walk left → Boot · Walk right → Projects

---

### Scene 3 — Projects

**Caption bar:** Yellow · `PROJECTS` / `WEB-SLINGING SOME CODE`

**Content:**
- Project card pinned over city background:
  - **REPORT BUILD** — "Customize report layouts and generate documents with real data."
  - Two buttons: `GITHUB` (blue) linking `https://github.com/bunthoeuntok` · `LIVE` (red)
- "POW!" action word decoration (top-right)
- Spiderman stands near project card
- Speech bubble: *"PRESS I TO VIEW!"*
- Press **I** near card → opens GitHub link

**Navigation:** Walk left → About · Walk right → Contact

---

### Scene 4 — Contact

**Caption bar:** Red · `CONTACT` / `SEND A WEB`

**Content:**
- Three contact cards stacked vertically:
  1. ✉ `bunthoeuntok@gmail.com`
  2. ⬡ `github.com/bunthoeuntok` → opens `https://github.com/bunthoeuntok`
  3. in `LinkedIn — Bunthoeun Tok` → opens `https://www.linkedin.com/in/bunthoeun-tok-8487ba206`
- Spiderman stands on right
- Speech bubble: *"LET'S WORK TOGETHER!"*
- Press **I** near a card → opens the link

**Navigation:** Walk left → Projects

---

## Navigation & Transitions

- **Walk right** to advance to the next scene
- **Walk left** to return to the previous scene
- **Camera fade** (black, 500ms) on scene transitions — same as current
- Scene order: Boot → About → Projects → Contact

---

## Implementation Scope

### New files
- `src/games/scenes/ProjectsScene.ts`
- `src/games/scenes/ContactScene.ts`

### Modified files
- `src/games/scenes/BootScene.ts` — comic caption bar, speech bubble replaces tooltip, info strip
- `src/games/scenes/AboutMeScene.ts` — comic caption bar, bio card restyled, skill chips restyled, info strip
- `src/games/scenes/Background.ts` — halftone sky, comic building outlines, comic road styling
- `src/games/objects/Buildings.ts` — add black border to each building rect, yellow bordered windows
- `src/games/objects/Road.ts` — add top border, yellow dash color
- `src/games/objects/Spiderman.ts` — speech bubble replaces existing tooltip
- `src/games/index.ts` — register ProjectsScene and ContactScene

### Out of scope
- No changes to Spiderman controls or animation logic
- No changes to Car objects (cars remain as-is)
- No mobile/touch support
