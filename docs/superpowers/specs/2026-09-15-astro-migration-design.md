# Astro migration design

Replace Jekyll with Astro for studio-lokal.github.io. Keep the current one-page studio site, make local development Node-based, and add the minimum accessibility work that does not rewrite the visual design.

## Goals

- Developer access: `npm install` / `npm run dev` / `npm run build`. No Ruby, Bundler, or Gemfile.
- Web access: semantic document structure, keyboard use, and link announcements. Layout, color, and typography stay as they are except where accessibility needs a small visible change (focus ring, skip link on focus, heading tags restyled to match today’s `h4`).
- Hosting: stay on GitHub Pages at `https://studio-lokal.kr`. Build with GitHub Actions instead of the Jekyll builder.

## Non-goals

- New pages, CMS, blog, or i18n.
- Redesign, new motion, or a client-side app.
- Changing copy, member data, analytics ID, or the custom domain.
- Rendering `projects.yml` / `places.yml` (they stay as unused data files).
- Migrating Google Analytics off `UA-123798377-1`.

## Architecture

Astro (latest stable) outputs a static site. No client JS islands. The only third-party script is the existing gtag snippet.

```text
src/
  data/
    members.yml          # collaborator list (same fields as today)
    projects.yml         # unused, kept
    places.yml           # unused, kept
    site.yml             # title, description, keywords, contacts (from _config.yml)
  layouts/
    Base.astro           # html skeleton: skip link, Head, main, Footer, Analytics
  components/
    Head.astro           # charset, viewport, title, description, OG, CSS
    Footer.astro
    Analytics.astro      # existing gtag, unchanged ID
  pages/
    index.astro          # homepage copy + members + contacts
    404.astro            # same 404 content, shared Base layout
  styles/
    main.scss            # imports the four files below
    base.scss
    index.scss
    footer.scss
    a11y.scss            # skip link + :focus-visible only
public/
  CNAME                  # studio-lokal.kr
  assets/images/logo.jpg
astro.config.mjs         # site: https://studio-lokal.kr, base: /
package.json
package-lock.json        # npm only, so Actions can npm ci
.github/workflows/deploy.yml
```

Jekyll files to delete after the Astro tree works: `Gemfile`, `Gemfile.lock`, `_config.yml`, `_layouts/`, `_includes/`, `_sass/`, `_data/`, `index.html`, `404.html`, `assets/css/main.scss`, `.bundle/`.

`main.scss` imports `base`, `index`, `footer`, then `a11y`. Vite compiles Sass. Homepage rules that today target `h4` must also apply to the new `h1`/`h2` so type size and spacing do not change.

## Data flow

- `site.yml` holds `title`, `description`, `keywords`, and `contacts[]` (`name`, `link`, `label`).
- `members.yml` keeps `name`, `emoji`, `description`, optional `link`.
- `index.astro` reads both files at build time and loops them. No runtime fetch.
- Page copy that is not data (section prose, project links, space address) stays in `index.astro`, same text as today’s `index.html`.

## Accessibility

| Change | Visible? |
|---|---|
| `html lang="ko"` | No |
| Skip link to `#main`, visible on focus only | Only when focused |
| `main#main` and `footer` landmarks | No |
| Site title `h1`, section titles `h2`, CSS matched to current `h4` | No, if CSS is mapped correctly |
| `:focus-visible` ring: light outline on dark background | Keyboard focus only |
| Logo `alt` stays “Studio Lokal Logo” | No |
| `target="_blank"` gets `rel="noopener noreferrer"` and an accessible “새 탭에서 열림” name | No (visually hidden text or equivalent) |
| 404 uses `Base.astro` | No |

Do not change body colors, container width, logo size, or footer type for contrast. Black background and white text already meet contrast.

## Deployment

- Workflow on `master`: checkout → Node LTS → `npm ci` → `npm run build` → upload `dist/` → `actions/deploy-pages`.
- `astro.config.mjs` sets `site` to `https://studio-lokal.kr` and `base` to `/` (user/org GitHub Pages site, not a project site).
- `public/CNAME` keeps `studio-lokal.kr`.
- Repo Pages source must be switched from “Deploy from a branch” to “GitHub Actions” once, by a human, before the first Actions deploy goes live.

Local commands:

```bash
npm install
npm run dev      # preview
npm run build    # write dist/
```

## Error handling

- Missing `members.yml` or `site.yml` fails the build (import/read at build time).
- A member without `link` renders name + emoji as text, not an empty anchor (same as today).
- 404 is a real `404.html` in `dist/` so GitHub Pages serves it.

## Verification

- `npm run build` succeeds with no Ruby on PATH.
- Built homepage includes all current sections, member names, and both contacts.
- Computed styles for logo, container width (780px / mobile), black background, and footer match the current site except skip link and focus ring.
- Keyboard: Tab shows skip link, then moves through in-page and footer links with a visible focus ring.
- axe or equivalent on `/` and `/404` reports no serious/critical issues introduced by the migration.
- HTML `lang` is `ko`.

## Success

The live site looks like today’s lokal page, runs on Astro + npm, deploys from GitHub Actions to `studio-lokal.kr`, and is usable with a keyboard and a screen reader at a basic document level.
