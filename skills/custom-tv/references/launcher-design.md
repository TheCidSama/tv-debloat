# The glass TV-layout launcher: design, performance rules, pitfalls

This describes `patches/aerotizen-glass-tv-layout.patch` (against AeroTizen commit
`64574228cee973095af590cd9ff387467e84d3b7`). Use it to port the patch to a newer
AeroTizen, to adapt the design, or to apply the same ideas to another launcher.

## What the user sees

- **Header:** a centred pill with Home | All apps; on the right Settings, Samsung Home and
  the network icon. In the glass themes the arrow order follows the screen: Home → All
  apps → Settings → Samsung Home. Classic keeps the original order (buttons on the left).
- **Tabs switch on focus.** Moving onto Home or All apps changes the page immediately,
  like a TV tab bar; OK is not needed.
- **Big clock** top-left (date and weather above a ~200 px time), hidden on All apps and
  faded out while the rows scroll up.
- **One row of app banners** along the bottom of the screen (6 across by default). The
  focused tile scales up with a white + accent ring and its name appears under it.
- **Halo:** a soft radial glow in the focused app's colour behind the screen, centred on
  the focused column. Brand colour comes from the brand background; near-white brands
  (YouTube) use their logo colour instead.
- **Inputs** (HDMI, Live TV) sit just below the bottom edge; Down from the apps scrolls
  them into view, Up scrolls back.
- **Settings** is split into tabs: Appearance (theme, accent, app name toggle,
  wallpaper, card layout), Apps & Home, Clock & Weather, Inputs.
- **Themes:** Glass (dark translucent panels), Frost (milky), Crystal (tinted with the
  accent), Classic (the original look and layout). Seven accent colours.

## Files

| File | Role |
|---|---|
| `launcher/js/theme.js` | Theme/accent list; sets `theme-*`, `glass-ui`, `no-hero` body classes and `--focus`/`--accent-rgb` |
| `launcher/css/glass.css` | All glass/TV-layout styles |
| `launcher/js/config.js`, `js/settings.js` | New settings `theme`, `accent`, `heroTitle`, `layoutVersion`; one-time migration |
| `src/home/Home.tsx` | Halo colour/position, `tv-layout` classes |
| `src/home/components/Halo.tsx` | Two-layer cross-fading halo |
| `src/home/components/AppCard.tsx` | Wide cards use the logo banner, never square artwork |
| `src/home/state/createHomeController.ts` | Header order, focus-switching tabs, scroll limits, `home-scrolled` |
| `src/settings/Settings.tsx` + `sections/ThemeSettings.tsx`, `CardSettings.tsx` | Settings tabs and Appearance |
| `css/card-modes.css`, `src/home/index.tsx` | 6-column option |

Settings are stored in `localStorage` under `aerotizen.settings.v1`. The migration runs
once (`layoutVersion < 2`): rectangle cards, 6 columns, and a still wallpaper if the
current one is animated. After that the user's choices win.

## Performance rules (TV GPUs are weak; the first draft lagged badly)

1. **No `backdrop-filter`.** Over an animated wallpaper it re-blurs every frame. Glass is
   faked with translucent fills, a 1 px light edge and an inset top highlight.
2. **No full-screen masks** (`mask-image` fades over the scrolling area). Each focus move
   repainted them.
3. **Spread-only focus rings** (`0 0 0 4px #fff, 0 0 0 9px accent`), no large blur shadows,
   no shadows on every tile.
4. **Animate only `transform` and `opacity`.** The halo cross-fades two layers' opacity;
   each layer is a half-size (960×540) gradient scaled ×2, so a change paints a quarter of
   the pixels.
5. **Don't promote every tile to its own layer** (`will-change` on many elements costs RAM).
6. **Prefer a still wallpaper.** Animated canvases run continuously behind everything; the
   halo supplies the colour instead.
7. Measure on the TV, not the desktop: the desktop browser hides all of this.

## Layout numbers (1920×1080)

- Side margins 64 px (keep them: column options 3/4/5/6 assume a 1792 px content width).
- Header 120 px; tab pill 76 px tall, radius 38 px; inner highlight 60 px, radius 30 px
  (concentric: inner radius = outer radius − inset of 8 px).
- Content viewport starts at 130 px; Home pads the first row down (`padding-top: 458px`)
  so it sits at the bottom; inputs section `margin-top: 380px` keeps it fully off-screen.
- 6-across banners 264×138, gap 28; row gap 76 to leave room for the focused name.
- Halo ellipse ~1120×760 at full scale, centred at y≈660 under the focused column:
  `x = 64 + (column + 0.5) × 1792 / columns`.

## Pitfalls already hit

- `card-modes.css` sets rectangle-card shadows and transforms with `!important`; glass
  rules that must win need `!important` too, at equal or higher specificity.
- Samsung store artwork is square (304×304). In a wide card it leaves dark bars; wide
  cards must use the banner (brand logo, or icon + name for unknown apps).
- A border on Continue Watching cards narrowed their progress bars; use an inset shadow.
- Hidden Settings sections must stay mounted (use `hidden`), otherwise drafts and focus
  nodes are lost when switching tabs; navigation skips hidden ones.
- Tizen package IDs are exactly 10 characters; test data with other lengths is dropped.
- Tizen's app info gives the icon as `iconPath`, not `icon`.
- Browser tests that walk the header or assume 3 square columns need `theme: 'classic'`
  seeded, or updating, when defaults change. Say which tests you changed and why.

## Checks before installing

```sh
npm run lint && npm test && npx playwright test --workers=1
```

Then serve `dist/launcher` locally, open it at 1920×1080, and walk it with the arrow keys:
Home row, focus each app (halo colour/position, name), Down to inputs and back, Up to the
tabs (page switches on focus), Right to Settings, every Settings tab, every theme.
