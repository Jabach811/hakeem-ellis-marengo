import { readFileSync } from 'node:fs';
import {
  escapeHtml,
  renderAttorneySummary,
  renderPracticeLink
} from './components.mjs';

const imageManifest = JSON.parse(
  readFileSync(new URL('../assets/images/manifest.json', import.meta.url), 'utf8')
);
const imageBySlug = (file) => imageManifest.find((image) => image.file === file);

const groupPractices = (practices, group) => practices.filter((practice) => practice.group === group);

const renderPracticeDirectoryItem = (practice) => `
  <article class="practice-directory__item">
    <h3><a href="/${escapeHtml(practice.slug)}/">${escapeHtml(practice.title)}</a></h3>
    <p>${escapeHtml(practice.summary)}</p>
  </article>`;

export function renderHome({ site, practices, attorneys }) {
  const groupTeasers = {
    'business-property': 'Business Law · Corporate Law · Real Estate',
    'disputes-defense': 'Civil Litigation · Criminal Defense · License Defense · Restraining Orders',
    'families-estates': 'Family Law · Estate Planning · Probate'
  };
  const practiceGroups = site.practiceGroups.map((group, index) => `
    <section class="home-practice-group" id="${escapeHtml(group.slug)}">
      <div class="home-practice-group__intro"><span class="section-number">0${index + 1}</span><h3>${escapeHtml(group.title)}</h3><p>${escapeHtml(group.description)}</p></div>
      <div class="home-practice-group__practices">${groupPractices(practices, group.slug).map((practice) => `<article><a href="/${escapeHtml(practice.slug)}/">${escapeHtml(practice.title)} <span aria-hidden="true">→</span></a><ul>${practice.matters.map((matter) => `<li>${escapeHtml(matter)}</li>`).join('')}</ul><a class="practice-more" href="/${escapeHtml(practice.slug)}/">More ${escapeHtml(practice.title.toLowerCase())} matters</a></article>`).join('')}</div>
    </section>`).join('');

  const heroImage = imageBySlug('hem-office-building.webp');
  const receptionImage = imageBySlug('hem-office-exterior.webp');
  const confirmedClaims = site.proofClaims.filter((claim) => !claim.requiresVerification);
  const proofBand = confirmedClaims.length
    ? `
      <section class="proof-band" aria-label="Firm experience">
        <div class="container proof-band__grid">
          ${confirmedClaims.map((claim) => `<div class="proof-band__item"><span class="proof-band__value">${escapeHtml(claim.value)}</span><span class="proof-band__label">${escapeHtml(claim.label)}</span></div>`).join('')}
        </div>
      </section>`
    : '';

  return {
    title: `Stockton Attorneys | ${site.firmName}`,
    description: site.heroSummary,
    canonicalPath: '/',
    activePath: '/',
    h1: site.heroTitle,
    hero: {
      type: 'home',
      kicker: `Attorneys at Law · ${site.locationLine}`,
      summary: site.heroSummary,
      image: {
        src: `/assets/images/${heroImage.file}`,
        width: heroImage.width,
        height: heroImage.height,
        alt: heroImage.alt
      },
      actions: `<div class="cluster hero__actions"><a class="button button--primary" href="${site.phone.href}">Call ${escapeHtml(site.phone.display)}</a><a class="button button--secondary button--secondary-dark" href="/practice-areas/">Explore practice areas</a></div>`,
      strip: `<div class="hero__practice-strip"><div class="container hero__practice-grid">${site.practiceGroups.map((group) => `<a href="/practice-areas/#${escapeHtml(group.slug)}"><strong>${escapeHtml(group.title)} <span aria-hidden="true">→</span></strong><span>${escapeHtml(groupTeasers[group.slug])}</span></a>`).join('')}</div></div>`
    },
    body: `
      <section class="section home-firm-intro" id="firm-distinction">
        <div class="container">
          <div class="home-firm-intro__top"><div class="stack"><p class="eyebrow">The firm</p><h2>A Stockton firm advising individuals and businesses across a wide range of legal matters, with the personal attention of a smaller practice.</h2><p><a class="arrow-link" href="/about/">Read the firm story <span aria-hidden="true">→</span></a></p></div><figure><img class="home-firm-intro__image" src="/assets/images/${receptionImage.file}" width="${receptionImage.width}" height="${receptionImage.height}" alt="${escapeHtml(receptionImage.alt)}" loading="lazy"><figcaption>Reception, 3414 Brookside Rd. Ste 100, Stockton</figcaption></figure></div>
          <div class="home-principles"><article><span class="section-number">01</span><h3>Local perspective.</h3><p>In Stockton since 1985, from the office at 3414 Brookside Road.</p></article><article><span class="section-number">02</span><h3>Broad legal experience.</h3><p>Eleven practice areas across business, disputes, defense, families, and estates.</p></article><article><span class="section-number">03</span><h3>Direct counsel.</h3><p>Four attorneys, and you work with them directly.</p></article></div>
        </div>
      </section>${proofBand}
      <section class="section home-practices" aria-labelledby="home-practices-title">
        <div class="container">
          <div class="home-practices__header">
            <div><p class="eyebrow">Ways we can help</p><h2 id="home-practices-title">Practice areas organized around the problem in front of you.</h2></div>
            <p class="lede">Every practice remains individually accessible. These three paths make it easier to start in the right place.</p>
          </div>
          <div class="home-practice-groups">${practiceGroups}</div>
        </div>
      </section>
      <section class="section home-attorneys" aria-labelledby="home-attorneys-title">
        <div class="container">
          <div class="home-attorneys__header">
            <div><p class="eyebrow">The attorneys</p><h2 id="home-attorneys-title">Four lawyers. Decades of combined perspective.</h2></div>
            <p class="lede">Meet the people behind the firm's business, litigation, property, criminal, family, estate, and licensing work.</p>
          </div>
          <div class="attorney-grid">${attorneys.map(renderAttorneySummary).join('')}</div>
        </div>
      </section>
      <section class="section section--muted" id="firm-history">
        <div class="container firm-story">
          <div class="firm-story__year">1985</div>
          <div class="firm-story__copy stack">
            <p class="eyebrow">Rooted in Stockton</p>
            <h2>Experience that stays personal.</h2>
            <p class="lede">The firm's attorneys bring depth across transactions, litigation, defense, family matters, estates, and professional licensing—without losing direct client relationships.</p>
            <p>The firm has helped Central Valley clients make difficult decisions, resolve disputes, protect what they have built, and plan what comes next.</p>
            <p><a href="/about/">Read the firm story</a></p>
          </div>
        </div>
      </section>`
  };
}

export function renderPracticeDirectory({ site, practices }) {
  const groups = site.practiceGroups.map((group) => `
    <section class="practice-path">
      <h2>${escapeHtml(group.title)}</h2>
      <p class="practice-path__description">${escapeHtml(group.description)}</p>
      <div class="practice-directory__list">${groupPractices(practices, group.slug).map(renderPracticeDirectoryItem).join('')}</div>
    </section>`).join('');
  return {
    title: 'Practice Areas',
    description: 'Explore the firm’s business, litigation, defense, family, estate, probate, licensing, and real estate services.',
    canonicalPath: '/practice-areas/',
    activePath: '/practice-areas/',
    h1: 'Practice areas',
    hero: { kicker: 'Legal services', summary: 'The firm’s work is organized into three clear paths so you can find the right starting point.' },
    body: `<section class="section"><div class="container"><div class="section-intro reading-width stack"><p class="lede">This grouping is a simple way to find a useful starting point. It does not limit the firm's services or the ways its attorneys may be able to help.</p></div><div class="practice-paths">${groups}</div></div></section>`
  };
}

export function renderPractice({ site, practice, related, content, attorneys = [] }) {
  const group = site.practiceGroups.find((item) => item.slug === practice.group);
  return {
    title: `${practice.title} Attorneys in Stockton, CA`,
    description: practice.summary,
    canonicalPath: `/${practice.slug}/`,
    activePath: '/practice-areas/',
    h1: practice.title,
    hero: { kicker: group ? group.title : 'Practice areas', kickerHref: '/practice-areas/', summary: practice.summary },
    body: `
      <section class="section">
        <div class="container page-layout">
          <article class="reading-width">${content}</article>
          <aside class="page-aside" aria-label="Practice overview">
            <div class="page-aside__section"><h2>Matters we handle</h2><ul class="page-aside__list">${practice.matters.map((matter) => `<li>${escapeHtml(matter)}</li>`).join('')}</ul></div>
            <div class="page-aside__section"><h2>Attorneys</h2><ul class="page-aside__list">${attorneys.map((attorney) => `<li><a href="/about/#${escapeHtml(attorney.slug)}">${escapeHtml(attorney.name)}</a></li>`).join('')}</ul></div>
            <div class="page-aside__section"><h2>Related practices</h2><ul class="page-aside__list">${related.map((item) => `<li><a href="/${escapeHtml(item.slug)}/">${escapeHtml(item.title)}</a></li>`).join('')}</ul></div>
            <div class="page-aside__section desktop-only"><a class="button button--primary" href="${site.phone.href}">Call ${escapeHtml(site.phone.display)}</a></div>
          </aside>
        </div>
      </section>`
  };
}

export function renderAbout({ site, attorneys, practices = [], firmContent, biographies }) {
  const practiceTitle = (slug) => {
    const practice = practices.find((item) => item.slug === slug);
    return practice ? practice.title : slug.replaceAll('-', ' ');
  };
  return {
    title: 'About Our Firm',
    description: `Learn about ${site.firmName}, founded in Stockton in ${site.foundedYear}, and meet its four attorneys.`,
    canonicalPath: '/about/',
    activePath: '/about/',
    h1: 'About the firm',
    hero: { kicker: `Stockton · Since ${site.foundedYear}`, summary: 'A local firm combining broad legal experience with direct, personal attention.' },
    body: `
      <section class="section"><div class="container about-intro"><div><p class="eyebrow">Firm history</p><h2>Built in Stockton. Trusted across the Central Valley.</h2></div><div class="reading-width">${firmContent}</div></div></section>
      <section class="office-gallery" aria-label="The firm's Stockton office"><img src="/assets/images/hem-office-building.webp" width="1920" height="756" alt="Hakeem, Ellis &amp; Marengo office building on Brookside Road" loading="lazy"><img src="/assets/images/hem-office-grounds.webp" width="1920" height="934" alt="Grounds outside the Hakeem, Ellis &amp; Marengo office in Stockton" loading="lazy"></section>
      <section class="section section--muted" aria-labelledby="team-title"><div class="container"><p class="eyebrow">Our attorneys</p><h2 id="team-title">Meet the team</h2><div class="team-list">${attorneys.map((attorney) => `<article class="team-profile" id="${escapeHtml(attorney.slug)}"><div class="team-profile__summary"><h3>${escapeHtml(attorney.name)}</h3><p>${escapeHtml(attorney.summary)}</p><ul class="team-profile__practices">${attorney.practiceSlugs.map((slug) => `<li><a href="/${escapeHtml(slug)}/">${escapeHtml(practiceTitle(slug))}</a></li>`).join('')}</ul></div><div class="team-profile__bio">${biographies[attorney.slug]}</div></article>`).join('')}</div></div></section>`
  };
}

export function renderContact({ site }) {
  return {
    title: 'Contact the Firm',
    description: `Call, email, or visit ${site.firmName} in Stockton, California.`,
    canonicalPath: '/contact/',
    activePath: '/contact/',
    h1: 'Contact the firm',
    hero: { kicker: 'A direct conversation', summary: 'Call during office hours or email to request a conversation about your legal matter.' },
    showContactPanel: false,
    body: `
      <section class="section"><div class="container contact-page__grid"><div class="contact-card"><h2>Office information</h2><dl class="contact-list"><div><dt>Phone</dt><dd><a href="${site.phone.href}">${escapeHtml(site.phone.display)}</a></dd></div><div><dt>Email</dt><dd><a href="mailto:${escapeHtml(site.email)}">${escapeHtml(site.email)}</a></dd></div><div><dt>Fax</dt><dd>${escapeHtml(site.fax)}</dd></div><div><dt>Hours</dt><dd>${escapeHtml(site.hours)}</dd></div></dl></div><div class="contact-card"><h2>Visit the office</h2><p>${escapeHtml(site.address.display)}</p><p><a class="button button--primary" href="${escapeHtml(site.directionsUrl)}">Get directions</a></p><p class="notice">Contacting the firm does not by itself create an attorney-client relationship. Do not send confidential information until the firm confirms representation.</p></div></div></section>`
  };
}

export function renderAccessibility({ site }) {
  return {
    title: 'Accessibility',
    description: `${site.firmName} is committed to making its website useful to people with disabilities.`,
    canonicalPath: '/accessibility/',
    activePath: '',
    h1: 'Website accessibility',
    hero: { kicker: 'Access for every visitor', summary: 'We want people with disabilities to be able to use this website and reach the firm.' },
    body: `<section class="section"><div class="container reading-width stack"><h2>Our commitment</h2><p>We work to make this website clear, keyboard accessible, readable at different text sizes, and usable with common assistive technology.</p><h2>Need help?</h2><p>If you have trouble using any part of this website, call <a href="${site.phone.href}">${escapeHtml(site.phone.display)}</a> or email <a href="mailto:${escapeHtml(site.email)}">${escapeHtml(site.email)}</a>. Please identify the page and the problem so the firm can provide assistance.</p><p><strong>Last updated:</strong> September 22, 2026.</p></div></section>`
  };
}

export function renderNotFound({ site }) {
  return {
    title: 'Page Not Found',
    description: 'The requested page could not be found. Find a practice area or contact the firm.',
    canonicalPath: '/404.html',
    activePath: '',
    h1: 'That page could not be found',
    hero: null,
    showContactPanel: false,
    body: `<section class="section not-found"><div class="not-found__content"><div class="not-found__code" aria-hidden="true">404</div><h1>That page could not be found</h1><p>The address may have changed, but the rest of the site is available.</p><div class="cluster not-found__actions"><a class="button button--primary" href="/">Go home</a><a class="button button--secondary" href="/practice-areas/">View practice areas</a></div><p class="not-found__contact">Or <a href="/contact/">contact the firm</a> at <a href="${site.phone.href}">${escapeHtml(site.phone.display)}</a>.</p></div></section>`
  };
}
