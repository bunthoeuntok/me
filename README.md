# Bunthoeun Tok — Portfolio

A comic-book portfolio you can play: walk a hero through a night-time city to discover
Bunthoeun's experience, projects and contact details. Recruiters who'd rather not play get a
plain, printable **Résumé view**, one tap away from anywhere and loading without the game.

**Live:** https://bunthoeuntok.github.io/me/ · **Résumé:** https://bunthoeuntok.github.io/me/resume/

## Stack

React + TypeScript + Vite shell, [Phaser 3](https://phaser.io) game, Playwright tests,
deployed to GitHub Pages. Package manager: pnpm.

## Run it

```sh
pnpm install
pnpm dev            # http://localhost:3000
```

| Command | What it does |
|---|---|
| `pnpm build` | Typecheck and build to `dist/` |
| `pnpm build-github` | Build for GitHub Pages (served under `/me/`) |
| `pnpm lint` | ESLint |
| `pnpm test:e2e` | Playwright tests against the GitHub Pages build, at desktop and phone sizes |
| `pnpm export:pdf` | Print the Résumé view to `public/resume.pdf` |
| `pnpm export:social-preview` | Render the link-preview card to `public/social-preview.png` |

First time running the tests: `pnpm exec playwright install chromium`.

## Updating the content

All profile content (jobs, projects, skills, education, contacts…) lives in **one file:
`src/content.ts`**. The game, the Résumé view and the pages' link-preview text all read from it.

After changing it:

1. `pnpm export:pdf` to regenerate the downloadable PDF.
2. `pnpm export:social-preview` if the name or title changed.
3. Commit the content change together with the regenerated files.

## Controls

- **Keyboard:** ← / → walk · ↓ jump · ↑ wall-crawl · I interact · R opens the Résumé view
- **Touch:** on-screen buttons appear automatically on phones and tablets.

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`: install, Playwright tests, build,
publish to GitHub Pages. A failing test blocks the deploy.

## Project docs

- `GLOSSARY.md`: the project's vocabulary (Visitor, Hero, City, District, Landmark…)
- `docs/adr/`: decisions worth knowing before changing direction
- The roadmap lives in [GitHub issues](https://github.com/bunthoeuntok/me/issues), starting from the spec in #1.

## Credits

Fonts: [Bangers](https://fonts.google.com/specimen/Bangers) and
[Comic Neue](https://fonts.google.com/specimen/Comic+Neue), both under the SIL Open Font License,
bundled via Fontsource.
