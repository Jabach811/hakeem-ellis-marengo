# Hakeem, Ellis & Marengo Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, responsive static replacement for the Hakeem, Ellis & Marengo website with an approved design system, 11 practice pages, four attorney biographies, working legacy routes, and release-grade validation.

**Architecture:** A dependency-light Node.js build reads structured JSON plus focused HTML content fragments, renders shared ES-module templates, and writes complete progressive-enhancement pages to `dist/`. CSS is split into tokens, foundations, components, and page compositions; JavaScript is limited to the mobile navigation and accessible disclosures.

**Tech Stack:** Node.js 24 built-in modules, Node test runner, semantic HTML, modern CSS, vanilla JavaScript, self-hosted Fontsource WOFF2 files for Newsreader and Source Sans 3.

**Spec:** `docs/superpowers/specs/2026-09-21-hakeem-ellis-marengo-redesign.md`

## Global Constraints

- The result must deploy as ordinary static files with no runtime server, database, or client-side framework.
- Preserve all 11 practice areas and the four named attorney biographies.
- Generate the canonical routes and the four legacy compatibility routes listed in the spec.
- Use the approved “Established Stockton Institution” direction and three-layer token architecture.
- Use only verified firm contact data: `(209) 474-2800`, `info@hemlaw.com`, `(209) 474-3654`, and `3414 Brookside Rd. Ste 100, Stockton, CA 95219`.
- Do not add a contact form, appointment system, synthetic attorney portraits, testimonials, awards, or outcome promises.
- Do not publish the replacement; development output and previews remain local/private.
- Require one `h1`, a skip link, keyboard navigation, visible focus, reduced-motion support, and no horizontal overflow at 320px and wider.
- Keep long-form copy at a maximum readable measure of 68 characters.
- Use real office/building imagery only when its source and firm association are clear; exclude generic legal stock imagery.
- Treat current numeric proof claims as needing firm confirmation before public release.

## Review Focus

- **A malformed legacy URL:** `/conservatorship-and-guardianship` must reach Criminal Defense without a dead end; Task 7 adds an exact route test.
- **A 320px viewport with long firm and practice names:** content must remain inside the viewport and the call action must not cover focused content; Task 8 adds explicit browser checks.
- **JavaScript unavailable:** all primary links and page content must remain usable; Task 3 renders complete navigation and Task 8 tests the no-script document structure.
- **An accidental placeholder contact value:** fake `555`, `mymail`, and mismatched telephone links must fail validation; Task 1 and Task 8 add exact scans.
- **A missing or mistyped content fragment:** the build must stop with the responsible route and file named; Task 3 adds a failure-path test.

---

## File Map

```text
package.json                         Build/test scripts and font dependencies
package-lock.json                    Locked Fontsource versions
.gitignore                           Ignores node_modules and generated QA artifacts
THIRD_PARTY_NOTICES.md               Font names, licenses, and source packages
src/
  assets/
    css/tokens.css                   Primitive, semantic, component tokens
    css/base.css                     Reset, typography, layout primitives, accessibility
    css/components.css               Header, buttons, lists, profiles, footer, disclosures
    css/pages.css                    Hero and page-specific compositions
    js/site.js                       Mobile menu and disclosure enhancement
    images/                          Approved local office/building and interface imagery
  content/
    about/firm.html                  Firm history and mission
    attorneys/*.html                Four focused biography fragments
    practices/*.html                Eleven long-form practice fragments
  data/
    site.json                        Firm identity, contact data, proof claims, global copy
    attorneys.json                   Attorney metadata and biography file references
    practices.json                   Practice metadata, grouping, matters, relationships
    routes.json                      Canonical routes and legacy aliases
  templates/
    layout.mjs                       Complete document shell and metadata
    components.mjs                   Shared page components
    pages.mjs                        Home, directory, practice, about, contact, legal renderers
tools/
  build-site.mjs                     Data loading, rendering, asset copy, output generation
  validate-site.mjs                  Release checks over generated output
  serve.mjs                          Local static preview server
tests/
  data.test.mjs                      Content and route contracts
  render.test.mjs                    Shared markup and page rendering
  build.test.mjs                     Output generation and failure behavior
  validate.test.mjs                  Broken-link, placeholder, metadata, and asset checks
dist/                                Generated deployable site
```

### Task 1: Establish Project Contracts and Structured Data

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `src/data/site.json`
- Create: `src/data/attorneys.json`
- Create: `src/data/practices.json`
- Create: `src/data/routes.json`
- Create: `tests/data.test.mjs`

**Interfaces:**
- Consumes: approved contact facts, route list, attorney names, and practice groupings from the spec.
- Produces: JSON contracts consumed by every later renderer: `site`, `attorneys[]`, `practices[]`, and `routes`.

- [ ] **Step 1: Add the package scripts and locked runtime expectation**

```json
{
  "name": "hakeem-ellis-marengo-site",
  "private": true,
  "type": "module",
  "engines": { "node": ">=20" },
  "scripts": {
    "build": "node tools/build-site.mjs",
    "test": "node --test",
    "validate": "node tools/validate-site.mjs",
    "serve": "node tools/serve.mjs"
  },
  "dependencies": {
    "@fontsource/newsreader": "^5.2.8",
    "@fontsource/source-sans-3": "^5.2.8"
  }
}
```

- [ ] **Step 2: Write failing data-contract tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const json = async (path) => JSON.parse(await readFile(path, 'utf8'));

test('site contact values are verified and internally consistent', async () => {
  const site = await json('src/data/site.json');
  assert.equal(site.phone.display, '(209) 474-2800');
  assert.equal(site.phone.href, 'tel:+12094742800');
  assert.equal(site.email, 'info@hemlaw.com');
  assert.equal(site.fax, '(209) 474-3654');
});

test('practice inventory contains 11 unique slugs in three groups', async () => {
  const practices = await json('src/data/practices.json');
  assert.equal(practices.length, 11);
  assert.equal(new Set(practices.map(({ slug }) => slug)).size, 11);
  assert.deepEqual(new Set(practices.map(({ group }) => group)),
    new Set(['business-property', 'disputes-defense', 'families-estates']));
});

test('attorney inventory contains the four public attorneys', async () => {
  const attorneys = await json('src/data/attorneys.json');
  assert.deepEqual(attorneys.map(({ name }) => name), [
    'Michael D. Hakeem', 'Albert M. Ellis', 'Renee M. Marengo', 'Stephen J. Baker'
  ]);
});

test('legacy routes resolve to approved canonical routes', async () => {
  const routes = await json('src/data/routes.json');
  assert.equal(routes.legacy['/services'], '/practice-areas/');
  assert.equal(routes.legacy['/about-us-page---freddie'], '/about/');
  assert.equal(routes.legacy['/professions-discipline-by-licensing-agencies'], '/professional-license-defense/');
  assert.equal(routes.legacy['/conservatorship-and-guardianship'], '/criminal-defense/');
});
```

- [ ] **Step 3: Run the tests and confirm the data files fail as missing**

Run: `npm test -- tests/data.test.mjs`  
Expected: FAIL with `ENOENT` for `src/data/site.json`.

- [ ] **Step 4: Create the structured data**

Use exact route slugs and the three groups from the spec. Each practice object must have:

```json
{
  "slug": "business-law",
  "title": "Business Law",
  "group": "business-property",
  "summary": "Practical legal guidance for businesses from formation through transactions, disputes, succession, and dissolution.",
  "contentFile": "src/content/practices/business-law.html",
  "matters": ["Business formation", "Contracts", "Business purchases and sales", "Compliance", "Business disputes"],
  "related": ["corporate-law", "civil-litigation", "real-estate"]
}
```

Use the same schema for all 11 records. Each attorney record must have `slug`, `name`, `shortName`, `summary`, `practiceSlugs`, and `contentFile`. `site.json` must keep proof claims under `proofClaims` with `requiresVerification: true`.

- [ ] **Step 5: Run the contract tests**

Run: `npm test -- tests/data.test.mjs`  
Expected: PASS, 4 tests.

- [ ] **Step 6: Install and lock dependencies**

Run: `npm install`  
Expected: `package-lock.json` created with only the two Fontsource packages and their package metadata.

- [ ] **Step 7: Commit the data contract**

```powershell
git -c safe.directory="C:/Dev/Joel's Workspaces/Personal/Work/Websites/hakeem ellis marengo" add package.json package-lock.json .gitignore src/data tests/data.test.mjs
git -c safe.directory="C:/Dev/Joel's Workspaces/Personal/Work/Websites/hakeem ellis marengo" commit -m "feat: establish site content contracts"
```

### Task 2: Implement the Three-Layer Design System

**Files:**
- Create: `src/assets/css/tokens.css`
- Create: `src/assets/css/base.css`
- Create: `src/assets/css/components.css`
- Create: `src/assets/css/pages.css`
- Create: `THIRD_PARTY_NOTICES.md`
- Create: `tests/styles.test.mjs`

**Interfaces:**
- Consumes: approved palette, typography, spacing, and behavior from the spec.
- Produces: CSS custom properties and class contracts used by all templates.

- [ ] **Step 1: Write failing token-boundary tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('tokens expose approved primitives and semantic roles', async () => {
  const css = await readFile('src/assets/css/tokens.css', 'utf8');
  for (const required of [
    '--burgundy-700: #6D1118', '--wine-900: #3E080D', '--ink-900: #1A1C20',
    '--paper-50: #F7F3EA', '--stone-200: #D8D0C4', '--brass-600: #9B6A33',
    '--color-action:', '--color-surface:', '--button-primary-bg:'
  ]) assert.ok(css.includes(required), required);
});

test('component and page CSS use tokens instead of raw hex colors', async () => {
  for (const path of ['src/assets/css/components.css', 'src/assets/css/pages.css']) {
    const css = await readFile(path, 'utf8');
    assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i);
  }
});
```

- [ ] **Step 2: Run the style tests and verify missing-file failure**

Run: `npm test -- tests/styles.test.mjs`  
Expected: FAIL with `ENOENT` for `tokens.css`.

- [ ] **Step 3: Create primitive, semantic, and component tokens**

The token file must define the approved colors, 4–128px spacing scale, responsive type scale, 2px corner radius, layout widths, focus ring, and motion durations. Semantic and component tokens reference primitives:

```css
:root {
  --burgundy-700: #6D1118;
  --wine-900: #3E080D;
  --ink-900: #1A1C20;
  --paper-50: #F7F3EA;
  --stone-200: #D8D0C4;
  --slate-600: #565C64;
  --brass-600: #9B6A33;
  --white: #FFFFFF;

  --color-surface: var(--paper-50);
  --color-surface-raised: var(--white);
  --color-text: var(--ink-900);
  --color-text-muted: var(--slate-600);
  --color-action: var(--burgundy-700);
  --color-action-hover: var(--wine-900);
  --color-rule: var(--stone-200);

  --button-primary-bg: var(--color-action);
  --button-primary-fg: var(--white);
  --button-primary-bg-hover: var(--color-action-hover);
}
```

- [ ] **Step 4: Create foundations and font declarations**

`base.css` must include the reset, `@font-face` declarations targeting `/assets/fonts/`, semantic landmarks, skip-link behavior, 68ch reading measure, responsive grid/container utilities, focus-visible ring, touch target floor, and reduced-motion override.

- [ ] **Step 5: Create component and page class contracts**

Implement `.utility-bar`, `.masthead`, `.site-nav`, `.nav-drawer`, `.button`, `.hero`, `.proof-band`, `.practice-path`, `.practice-link`, `.attorney-summary`, `.content-section`, `.contact-panel`, `.site-footer`, `.mobile-call`, `.legacy-notice`, and page composition classes. Mobile call positioning must reserve matching page padding and must disappear at the desktop breakpoint.

- [ ] **Step 6: Document font licensing**

`THIRD_PARTY_NOTICES.md` must name Newsreader and Source Sans 3, state that both are licensed under the SIL Open Font License 1.1, and identify their installed Fontsource packages.

- [ ] **Step 7: Run the style tests**

Run: `npm test -- tests/styles.test.mjs`  
Expected: PASS, 2 tests.

- [ ] **Step 8: Commit the design system**

```powershell
git -c safe.directory="C:/Dev/Joel's Workspaces/Personal/Work/Websites/hakeem ellis marengo" add src/assets/css THIRD_PARTY_NOTICES.md tests/styles.test.mjs
git -c safe.directory="C:/Dev/Joel's Workspaces/Personal/Work/Websites/hakeem ellis marengo" commit -m "feat: add HEM design system"
```

### Task 3: Build the Renderer, Shared Shell, and Progressive Navigation

**Files:**
- Create: `src/templates/layout.mjs`
- Create: `src/templates/components.mjs`
- Create: `src/templates/pages.mjs`
- Create: `src/assets/js/site.js`
- Create: `tools/build-site.mjs`
- Create: `tests/render.test.mjs`
- Create: `tests/build.test.mjs`

**Interfaces:**
- Consumes: `site`, `attorneys`, `practices`, `routes`, page-specific data, and content fragments.
- Produces: `renderLayout(page): string`, component renderers, page renderers, and `buildSite({ sourceDir, outputDir }): Promise<BuildResult>`.

- [ ] **Step 1: Write failing renderer tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderLayout } from '../src/templates/layout.mjs';

test('layout renders one h1, skip link, canonical metadata, and verified contact actions', () => {
  const html = renderLayout({
    title: 'Test', description: 'Test description', canonicalPath: '/test/',
    h1: 'Test page', body: '<p>Body</p>', activePath: '/test/'
  });
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /href="#main-content"/);
  assert.match(html, /rel="canonical" href="https:\/\/www\.hakeemellismarengo\.com\/test\/"/);
  assert.match(html, /href="tel:\+12094742800"/);
  assert.match(html, /href="mailto:info@hemlaw\.com"/);
});
```

- [ ] **Step 2: Write failing build behavior tests**

```js
test('build reports a missing fragment with route and path', async () => {
  await assert.rejects(
    () => buildSite({ sourceDir: fixtureSource, outputDir: fixtureOutput }),
    /business-law.*src[\\/]content[\\/]practices[\\/]business-law\.html/i
  );
});
```

- [ ] **Step 3: Run renderer/build tests and verify import failures**

Run: `npm test -- tests/render.test.mjs tests/build.test.mjs`  
Expected: FAIL because the modules do not exist.

- [ ] **Step 4: Implement shared components and document shell**

Export `escapeHtml`, `renderHeader`, `renderFooter`, `renderContactPanel`, `renderPracticeLink`, `renderAttorneySummary`, and `renderLegacyPage` from `components.mjs`. `layout.mjs` owns the doctype, metadata, skip link, CSS/JS references, header, one provided `h1`, `main`, contact panel, and footer.

- [ ] **Step 5: Implement page-renderer interfaces**

```js
export function renderHome({ site, practices, attorneys }) { return { title, description, h1, body }; }
export function renderPracticeDirectory({ site, practices }) { return { title, description, h1, body }; }
export function renderPractice({ site, practice, related, content }) { return { title, description, h1, body }; }
export function renderAbout({ site, attorneys, firmContent, biographies }) { return { title, description, h1, body }; }
export function renderContact({ site }) { return { title, description, h1, body }; }
export function renderAccessibility({ site }) { return { title, description, h1, body }; }
export function renderNotFound({ site }) { return { title, description, h1, body }; }
```

- [ ] **Step 6: Implement the builder**

The builder loads JSON, validates referenced content before rendering, empties only the project-owned `dist/` directory after resolving and checking its absolute path, renders every canonical and legacy page, copies CSS/JS/images/fonts, and returns:

```js
{ pageCount, canonicalPaths, legacyPaths, assetCount, outputDir }
```

- [ ] **Step 7: Implement progressive mobile navigation**

`site.js` must toggle `aria-expanded`, apply and remove `inert` only to the non-drawer page region while open, close on Escape, return focus to the menu button, and do nothing if expected controls are absent. Primary page links remain in HTML before JavaScript runs.

- [ ] **Step 8: Run renderer/build tests**

Run: `npm test -- tests/render.test.mjs tests/build.test.mjs`  
Expected: PASS.

- [ ] **Step 9: Commit the rendering foundation**

```powershell
git -c safe.directory="C:/Dev/Joel's Workspaces/Personal/Work/Websites/hakeem ellis marengo" add src/templates src/assets/js tools/build-site.mjs tests/render.test.mjs tests/build.test.mjs
git -c safe.directory="C:/Dev/Joel's Workspaces/Personal/Work/Websites/hakeem ellis marengo" commit -m "feat: add static site renderer"
```

### Task 4: Build the Homepage and Practice Directory

**Files:**
- Modify: `src/templates/pages.mjs`
- Modify: `src/data/site.json`
- Modify: `src/data/practices.json`
- Create: `tests/home.test.mjs`
- Create: `tests/practice-directory.test.mjs`

**Interfaces:**
- Consumes: shared renderers and the 11-practice data contract.
- Produces: complete `/` and `/practice-areas/` pages.

- [ ] **Step 1: Write failing homepage tests**

Assert the rendered home page contains the exact founding message, the three practice-group headings, all 11 practice links, the four attorney names, the three proof claims with visible “Needs firm confirmation” markup in preview mode, and only one `h1`.

- [ ] **Step 2: Write failing directory tests**

Assert `/practice-areas/` renders all practices once, groups each slug under the correct group, and includes no `href="/services"` link.

- [ ] **Step 3: Run the targeted tests**

Run: `npm test -- tests/home.test.mjs tests/practice-directory.test.mjs`  
Expected: FAIL because the page bodies are not yet complete.

- [ ] **Step 4: Implement the approved homepage sequence**

Render: utility bar, masthead, hero, proof band, three practice paths, firm distinction, four attorney summaries, firm history, contact panel, disclaimer, and footer. Use the headline “Serving the Central Valley since 1985” and actions “Call (209) 474-2800” and “Explore practice areas.”

- [ ] **Step 5: Implement the Practice Areas directory**

Use real headings and lists rather than generic card tiles. Each practice includes its summary and canonical link. The page must explain that the grouping helps navigation and does not limit the firm's services.

- [ ] **Step 6: Run the homepage and directory tests**

Run: `npm test -- tests/home.test.mjs tests/practice-directory.test.mjs`  
Expected: PASS.

- [ ] **Step 7: Commit the primary discovery pages**

```powershell
git -c safe.directory="C:/Dev/Joel's Workspaces/Personal/Work/Websites/hakeem ellis marengo" add src/templates/pages.mjs src/data tests/home.test.mjs tests/practice-directory.test.mjs
git -c safe.directory="C:/Dev/Joel's Workspaces/Personal/Work/Websites/hakeem ellis marengo" commit -m "feat: build home and practice discovery"
```

### Task 5: Migrate and Restructure All 11 Practice Pages

**Files:**
- Create: `src/content/practices/business-law.html`
- Create: `src/content/practices/civil-law.html`
- Create: `src/content/practices/civil-litigation.html`
- Create: `src/content/practices/corporate-law.html`
- Create: `src/content/practices/criminal-defense.html`
- Create: `src/content/practices/estate-planning.html`
- Create: `src/content/practices/family-law.html`
- Create: `src/content/practices/probate.html`
- Create: `src/content/practices/professional-license-defense.html`
- Create: `src/content/practices/real-estate.html`
- Create: `src/content/practices/restraining-orders.html`
- Modify: `src/templates/pages.mjs`
- Create: `tests/practices.test.mjs`

**Interfaces:**
- Consumes: `practices.json`, `renderPractice`, and the current public practice-page content.
- Produces: 11 complete canonical practice pages with matters, structured content, related links, and contact actions.

- [ ] **Step 1: Write failing practice coverage tests**

The test must iterate all `practices.json` records and assert that each fragment exists, contains at least two `h2` sections, has no nested `h1`, contains no placeholder patterns (`555`, `mymail`, `Button`, `Empty heading`), and renders links to every declared related slug.

- [ ] **Step 2: Run the test and verify 11 missing-fragment failures**

Run: `npm test -- tests/practices.test.mjs`  
Expected: FAIL with missing content files.

- [ ] **Step 3: Write Business & Property content**

Use these section structures:

- Business Law: business lifecycle; matters handled; ongoing counsel; disputes and transitions.
- Corporate Law: formation and governance; contracts and transactions; employment/operations documents; dissolution and disputes.
- Real Estate: transactions and development; disputes; land use and entitlements; resolution options.

- [ ] **Step 4: Write Disputes & Defense content**

Use these section structures:

- Civil Law: types of civil matters; assessment and strategy; resolution and trial.
- Civil Litigation: disputes handled; preparation; negotiation, mediation, and trial.
- Criminal Defense: consequences and early representation; charges handled; defense process; post-conviction support.
- Professional License Defense: professionals represented; investigations and accusations; criminal-case overlap; protecting livelihood and reputation.
- Restraining Orders: order types; domestic violence; elder/dependent adult abuse; civil harassment; workplace violence; representation for protected and restrained parties.

- [ ] **Step 5: Write Families & Estates content**

Use these section structures:

- Family Law: divorce and separation; custody and visitation; child support; adoption; marital agreements.
- Estate Planning: powers of attorney and health directives; wills and trusts; asset planning; trust administration.
- Probate: probate overview; executor duties; creditor and notice process; asset distribution; support after a death.

- [ ] **Step 6: Run practice tests and build all routes**

Run: `npm test -- tests/practices.test.mjs && npm run build`  
Expected: PASS and 11 practice output directories in `dist/`.

- [ ] **Step 7: Commit practice content**

```powershell
git -c safe.directory="C:/Dev/Joel's Workspaces/Personal/Work/Websites/hakeem ellis marengo" add src/content/practices src/templates/pages.mjs tests/practices.test.mjs
git -c safe.directory="C:/Dev/Joel's Workspaces/Personal/Work/Websites/hakeem ellis marengo" commit -m "feat: add complete practice area content"
```

### Task 6: Build About, Attorney Biographies, Contact, Accessibility, and 404

**Files:**
- Create: `src/content/about/firm.html`
- Create: `src/content/attorneys/michael-hakeem.html`
- Create: `src/content/attorneys/albert-ellis.html`
- Create: `src/content/attorneys/renee-marengo.html`
- Create: `src/content/attorneys/stephen-baker.html`
- Modify: `src/templates/pages.mjs`
- Create: `tests/secondary-pages.test.mjs`

**Interfaces:**
- Consumes: attorney metadata, site contact data, shared components, and current public biographies.
- Produces: `/about/`, `/contact/`, `/accessibility/`, and `/404.html`.

- [ ] **Step 1: Write failing secondary-page tests**

Assert About renders all four attorneys and excludes public birth dates; Contact renders exact phone/email/fax/address/hours plus the non-engagement notice and no `<form>`; Accessibility includes phone/email and no UserWay compliance claim; 404 contains links to Home, Practice Areas, Contact, and the telephone action.

- [ ] **Step 2: Run the test and verify missing content failure**

Run: `npm test -- tests/secondary-pages.test.mjs`  
Expected: FAIL because firm and biography fragments do not exist.

- [ ] **Step 3: Write firm and attorney content**

Preserve admissions, education, practice focus, public professional service, reported case information, and the former Deputy District Attorney role. Omit birth dates. Divide each biography into concise paragraphs under experience, education/admissions, and practice focus.

- [ ] **Step 4: Implement Contact, Accessibility, and 404**

Contact must provide `tel:+12094742800`, `mailto:info@hemlaw.com`, fax text, address, hours, and a directions link based on the encoded office address. Accessibility must use a dated plain-language commitment. The 404 response is a static page and must not automatically redirect.

- [ ] **Step 5: Run secondary-page tests**

Run: `npm test -- tests/secondary-pages.test.mjs`  
Expected: PASS.

- [ ] **Step 6: Commit secondary pages**

```powershell
git -c safe.directory="C:/Dev/Joel's Workspaces/Personal/Work/Websites/hakeem ellis marengo" add src/content/about src/content/attorneys src/templates/pages.mjs tests/secondary-pages.test.mjs
git -c safe.directory="C:/Dev/Joel's Workspaces/Personal/Work/Websites/hakeem ellis marengo" commit -m "feat: add firm and contact pages"
```

### Task 7: Add Assets, Metadata, Sitemap, Robots, and Legacy Compatibility

**Files:**
- Add: `src/assets/images/*` approved real office/building images
- Create: `src/assets/images/manifest.json`
- Modify: `tools/build-site.mjs`
- Modify: `src/templates/layout.mjs`
- Create: `tests/routes-and-assets.test.mjs`

**Interfaces:**
- Consumes: canonical and legacy route maps, approved asset inventory, and page metadata.
- Produces: local images/fonts, Open Graph metadata, `sitemap.xml`, `robots.txt`, and working compatibility pages.

- [ ] **Step 1: Write failing route and asset tests**

Assert every canonical route writes `index.html`; each legacy path contains a canonical link and visible destination link; `/conservatorship-and-guardianship` targets `/criminal-defense/`; every manifest image exists and has width/height/alt/source fields; `sitemap.xml` includes canonical routes only.

- [ ] **Step 2: Run the tests and verify missing outputs**

Run: `npm test -- tests/routes-and-assets.test.mjs`  
Expected: FAIL because legacy pages, asset manifest, sitemap, and robots output are absent.

- [ ] **Step 3: Acquire and document approved real imagery**

Use the current site's real office/building images identified by filenames `333333333333-1920w.JPG`, `2222222222222222222222-1920w.JPG`, and `11111111111111111111-6697f3de-b739e8ce-1920w.JPG`. Save optimized local copies with descriptive filenames, preserve source URLs in `manifest.json`, and exclude the generic Pexels and stock-photo files.

- [ ] **Step 4: Copy the four self-hosted WOFF2 files during build**

Copy Newsreader Latin 400/500 and Source Sans 3 Latin 400/600 from their Fontsource package `files/` directories to `dist/assets/fonts/`. Fail the build if any expected font file is missing.

- [ ] **Step 5: Render route compatibility and discovery files**

Generate visible compatibility pages, canonical metadata, `sitemap.xml`, and:

```text
User-agent: *
Allow: /
Sitemap: https://www.hakeemellismarengo.com/sitemap.xml
```

- [ ] **Step 6: Run route/asset tests and rebuild**

Run: `npm test -- tests/routes-and-assets.test.mjs && npm run build`  
Expected: PASS.

- [ ] **Step 7: Commit assets and route compatibility**

```powershell
git -c safe.directory="C:/Dev/Joel's Workspaces/Personal/Work/Websites/hakeem ellis marengo" add src/assets/images src/templates/layout.mjs tools/build-site.mjs tests/routes-and-assets.test.mjs
git -c safe.directory="C:/Dev/Joel's Workspaces/Personal/Work/Websites/hakeem ellis marengo" commit -m "feat: add local assets and legacy routes"
```

### Task 8: Add Release Validation and Complete Browser QA

**Files:**
- Create: `tools/validate-site.mjs`
- Create: `tools/serve.mjs`
- Create: `tests/validate.test.mjs`
- Modify: CSS/templates/content files only for issues found by validation or browser QA

**Interfaces:**
- Consumes: generated `dist/` output.
- Produces: a nonzero exit on any release blocker and a local HTTP preview for browser inspection.

- [ ] **Step 1: Write failing validator tests**

Create fixture pages that demonstrate each failure: broken local link, missing image, two `h1` elements, missing description/canonical, fake `555` phone, `mymail` email, wrong `tel:` destination, image without dimensions, empty button/link, and a script-dependent primary navigation.

- [ ] **Step 2: Run tests and verify validator import failure**

Run: `npm test -- tests/validate.test.mjs`  
Expected: FAIL because `validateSite` does not exist.

- [ ] **Step 3: Implement `validateSite(rootDir)`**

Return `{ pages, links, images, errors, warnings }`. Errors must name file and rule. The command exits 1 when `errors.length > 0`, otherwise prints exact totals and exits 0.

- [ ] **Step 4: Implement the local static server**

Use `node:http`, bind to `127.0.0.1`, default to an available port beginning at 4173, serve directory `index.html` files, return `404.html` for missing paths, set correct basic MIME types, and print the final local URL.

- [ ] **Step 5: Run the complete automated suite**

Run: `npm test && npm run build && npm run validate`  
Expected: all tests PASS; build and validator exit 0; placeholder counts are zero.

- [ ] **Step 6: Inspect the complete site in a browser**

Check Home, Practice Areas, About, Contact, Accessibility, all 11 practice pages, all four legacy routes, and 404. Test widths 1440, 1024, 768, 430, 390, and 320px. Verify menu keyboard behavior, Escape focus return, visible focus, reduced motion, clickable telephone/email/directions, no horizontal scroll, no fixed obstruction, and no console errors.

- [ ] **Step 7: Test progressive enhancement**

Inspect generated HTML directly and verify every primary page is linked without relying on script-created nodes. Temporarily prevent `site.js` from loading in the browser and confirm page content and primary navigation remain usable.

- [ ] **Step 8: Fix discovered issues and rerun checks**

Run after every correction: `npm test && npm run build && npm run validate`  
Expected: all checks remain green.

- [ ] **Step 9: Commit validation and verified polish**

```powershell
git -c safe.directory="C:/Dev/Joel's Workspaces/Personal/Work/Websites/hakeem ellis marengo" add tools tests src dist package.json package-lock.json THIRD_PARTY_NOTICES.md
git -c safe.directory="C:/Dev/Joel's Workspaces/Personal/Work/Websites/hakeem ellis marengo" commit -m "test: validate complete static site"
```

### Task 9: Final Review and Handoff

**Files:**
- Create: `README.md`
- Create: `docs/CONTENT-VERIFICATION.md`
- Modify: only files needed for final review findings

**Interfaces:**
- Consumes: verified implementation and the approved spec.
- Produces: maintainable operator instructions and a clear pre-publication verification list.

- [ ] **Step 1: Write the operator README**

Document exact commands for install, test, build, validate, and local preview; explain where contact data, practices, attorneys, long-form content, images, tokens, and route aliases live; state that `dist/` is generated.

- [ ] **Step 2: Write the content-verification checklist**

List the exact items requiring firm confirmation before public launch: `40+ years`, `300+ companies`, `14,000+ clients`, every attorney biography, every practice description, privacy/terms destination, office imagery rights, social profiles, and legal disclaimer wording.

- [ ] **Step 3: Compare implementation against every spec section**

Check Objectives through Completion Criteria and record any deviation in the implementation before claiming completion. No unresolved deviation may be hidden in the handoff.

- [ ] **Step 4: Run final verification from a clean build**

Remove only the validated project-owned `dist/` path through the build script, then run:  
`npm test && npm run build && npm run validate`  
Expected: all tests PASS and validator errors equal zero.

- [ ] **Step 5: Review git state and commit documentation**

```powershell
git -c safe.directory="C:/Dev/Joel's Workspaces/Personal/Work/Websites/hakeem ellis marengo" add README.md docs/CONTENT-VERIFICATION.md
git -c safe.directory="C:/Dev/Joel's Workspaces/Personal/Work/Websites/hakeem ellis marengo" commit -m "docs: add site maintenance and launch checklist"
git -c safe.directory="C:/Dev/Joel's Workspaces/Personal/Work/Websites/hakeem ellis marengo" status --short --branch
```

Expected: clean working tree on the implementation branch.
