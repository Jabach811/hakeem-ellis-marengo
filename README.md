# Hakeem, Ellis & Marengo website

This repository contains the rebuilt static website for Hakeem, Ellis & Marengo. It uses a small Node.js build script, shared HTML templates, structured content data, local fonts, and local office imagery. There is no runtime framework, database, form service, or client-side content dependency.

## Get started

Use Node.js 20 or newer.

```powershell
npm ci
npm test
npm run build
npm run validate
npm run serve
```

`npm run serve` starts a local preview at `http://127.0.0.1:4173/` or the next available port. Stop it with `Ctrl+C`.

The recommended release gate is:

```powershell
npm test
npm run build
npm run validate
```

The validator checks generated pages for broken local links, missing images, heading and metadata problems, placeholder contact information, incorrect telephone links, empty controls, image dimensions, and primary navigation that depends on JavaScript.

## Where to update content

- Firm contact information, office hours, proof claims, disclaimers, and practice-group labels: `src/data/site.json`
- Practice titles, summaries, matters, relationships, and content-file locations: `src/data/practices.json`
- Attorney names, summaries, practice relationships, and biography-file locations: `src/data/attorneys.json`
- Canonical URLs and old-route aliases: `src/data/routes.json`
- Long-form practice, firm, and attorney copy: `src/content/`
- Approved office photos and their source record: `src/assets/images/` and `src/assets/images/manifest.json`
- Design tokens: `src/assets/css/tokens.css`
- Shared component styles and responsive behavior: `src/assets/css/components.css` and `src/assets/css/pages.css`
- Shared page structure and metadata: `src/templates/`

The `dist/` folder is generated. Do not edit it directly. Each build safely clears only that project-owned output folder and recreates all canonical pages, compatibility pages, local assets, `sitemap.xml`, `robots.txt`, and `404.html`.

## Site structure

The canonical site includes Home, Practice Areas, About, Contact, Accessibility, and eleven individual practice pages. Four known old addresses generate visible compatibility pages with canonical metadata and a clear link to the correct destination.

JavaScript enhances the mobile navigation, including Escape-key close and focus return. The core content and primary links remain in the HTML, and a native mobile navigation fallback remains usable if the enhancement script does not load.

## Before publishing

Complete [the content-verification checklist](docs/CONTENT-VERIFICATION.md). The three proof claims are intentionally labeled “Needs firm confirmation” in this preview until the firm approves them. Publishing is separate from this repository build and has not been performed by these instructions.
