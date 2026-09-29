# BURNEPEP

This is a static site. Open `index.html` directly in a browser; no local server or build step is required.

## Project structure

- `src/app.js` — page bootstrapping and hero interaction logic.
- `src/data/site-assets.js` — the single manifest for page asset paths.
- `src/ui/page-sections.js` — semantic markup for each site section.
- `src/styles/` — base, layout, and reusable component styles.
- `assets/design-kit/burnepep-web-slices-v2/` — supplied visual design kit.
- `assets/hero/burn-motion/frames/` — current 49-frame, scroll-controlled Hero sequence.
- `assets/images/cta/bottom-cta-banner.png` — bottom call-to-action artwork.
- `tools/extract-burn-motion-frames.ps1` — repeatable FFmpeg extraction and WebP compression workflow.

When adding a new asset, place it in the relevant `assets/` category and register its path in `src/data/site-assets.js` instead of hard-coding it in section markup.
