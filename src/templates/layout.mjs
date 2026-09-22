import { readFileSync } from 'node:fs';
import {
  escapeHtml,
  renderContactPanel,
  renderFooter,
  renderHeader,
  renderNavDrawer
} from './components.mjs';

const defaultSite = JSON.parse(
  readFileSync(new URL('../data/site.json', import.meta.url), 'utf8')
);

function renderHero(page) {
  if (page.hero === null) return '';
  const hero = page.hero || {};
  const h1 = escapeHtml(page.h1);
  const kickerText = hero.kickerHref ? `<a href="${escapeHtml(hero.kickerHref)}">${escapeHtml(hero.kicker)}</a>` : escapeHtml(hero.kicker);
  const kicker = hero.kicker ? `<p class="${hero.type === 'home' ? 'hero__kicker' : 'eyebrow'}">${kickerText}</p>` : '';
  const summary = hero.summary ? `<p class="${hero.type === 'home' ? 'hero__summary' : 'page-hero__lede'}">${escapeHtml(hero.summary)}</p>` : '';

  if (hero.type === 'home') {
    const media = hero.image
      ? `<div class="hero__media"><img src="${escapeHtml(hero.image.src)}" width="${hero.image.width}" height="${hero.image.height}" alt="${escapeHtml(hero.image.alt)}" fetchpriority="high"></div>`
      : '';
    return `
      <section class="hero">
        ${media}
        <div class="container hero__inner">
          <div class="hero__content">
            ${kicker}
            <h1>${h1}</h1>
            ${summary}
            ${hero.actions || ''}
          </div>
        </div>
      </section>`;
  }

  return `
    <header class="page-hero">
      <div class="container page-hero__inner">
        ${kicker}
        <h1>${h1}</h1>
        ${summary}
      </div>
    </header>`;
}

export function renderLayout(page) {
  const site = page.site || defaultSite;
  const canonicalUrl = `${site.siteUrl}${page.canonicalPath === '/' ? '/' : page.canonicalPath}`;
  const pageTitle = page.title.includes(site.firmName) ? page.title : `${page.title} | ${site.firmName}`;
  const showContactPanel = page.showContactPanel !== false;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#F7F3EA">
  <link rel="icon" href="/assets/images/favicon.svg" type="image/svg+xml">
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(page.description)}">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(pageTitle)}">
  <meta property="og:description" content="${escapeHtml(page.description)}">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:image" content="${escapeHtml(`${site.siteUrl}/assets/images/hem-office-exterior.webp`)}">
  <meta property="og:image:width" content="1920">
  <meta property="og:image:height" content="940">
  <meta property="og:image:alt" content="Exterior of the Hakeem, Ellis &amp; Marengo office in Stockton">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="/assets/css/tokens.css">
  <link rel="stylesheet" href="/assets/css/base.css">
  <link rel="stylesheet" href="/assets/css/components.css">
  <link rel="stylesheet" href="/assets/css/pages.css">
  <script type="module" src="/assets/js/site.js"></script>
</head>
<body>
  <div data-page-region>
    <a class="skip-link" href="#main-content">Skip to main content</a>
    ${renderHeader(site, page.activePath)}
    <main id="main-content" tabindex="-1">
      ${renderHero(page)}
      ${page.body}
    </main>
    ${showContactPanel ? renderContactPanel(site) : ''}
    ${renderFooter(site)}
    <a class="button button--primary mobile-call" href="${site.phone.href}">Call ${escapeHtml(site.phone.display)}</a>
  </div>
  ${renderNavDrawer(site, page.activePath)}
</body>
</html>`;
}
