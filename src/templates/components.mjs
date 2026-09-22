const primaryNav = [
  { href: '/', label: 'Home' },
  { href: '/practice-areas/', label: 'Practice Areas' },
  { href: '/about/', label: 'About' },
  { href: '/contact/', label: 'Contact' }
];

export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function navItems(activePath, className) {
  return primaryNav.map(({ href, label }) => {
    const current = activePath === href ? ' aria-current="page"' : '';
    return `<li><a href="${href}"${current}>${escapeHtml(label)}</a></li>`;
  }).join('');
}

export function renderHeader(site, activePath = '') {
  return `
    <div class="utility-bar">
      <div class="container utility-bar__inner">
        <a href="${site.phone.href}">${escapeHtml(site.phone.display)}</a>
        <div class="utility-bar__secondary">
          <span>${escapeHtml(site.locationLine || site.address.display)}</span>
          <span>${escapeHtml(site.hours)}</span>
        </div>
      </div>
    </div>
    <header class="masthead">
      <div class="container masthead__inner">
        <a class="wordmark" href="/" aria-label="${escapeHtml(site.firmName)} home">
          <span class="wordmark__name">${escapeHtml(site.firmName)}</span>
          <span class="wordmark__descriptor">${escapeHtml(site.descriptor)}</span>
        </a>
        <nav class="site-nav" aria-label="Primary navigation">
          <ul class="site-nav__list">${navItems(activePath, 'site-nav__list')}</ul>
        </nav>
        <a class="button button--primary masthead__call" href="${site.phone.href}">Call the office</a>
        <button class="menu-button" type="button" aria-expanded="false" aria-controls="mobile-navigation" data-menu-open>
          <span class="menu-button__bars" aria-hidden="true"></span>
          <span class="sr-only">Open navigation</span>
        </button>
      </div>
    </header>`;
}

export function renderNavDrawer(site, activePath = '') {
  return `
    <aside class="nav-drawer" id="mobile-navigation" aria-label="Mobile navigation" data-nav-drawer hidden>
      <div class="nav-drawer__header">
        <span class="nav-drawer__title">${escapeHtml(site.firmName)}</span>
        <button class="nav-drawer__close" type="button" data-menu-close aria-label="Close navigation">×</button>
      </div>
      <nav aria-label="Mobile primary navigation">
        <ul class="nav-drawer__list">${navItems(activePath, 'nav-drawer__list')}</ul>
      </nav>
      <div class="stack" style="--stack-space: var(--space-3); margin-block-start: var(--space-8)">
        <a class="button button--on-dark" href="${site.phone.href}">Call ${escapeHtml(site.phone.display)}</a>
        <a href="mailto:${escapeHtml(site.email)}">${escapeHtml(site.email)}</a>
      </div>
    </aside>
    <div class="nav-backdrop" data-nav-backdrop hidden></div>`;
}

export function renderContactPanel(site) {
  return `
    <section class="contact-panel section" aria-labelledby="contact-panel-title">
      <div class="container contact-panel__grid">
        <div class="stack">
          <p class="eyebrow">Start with a direct conversation</p>
          <h2 id="contact-panel-title">Talk with the firm about your legal matter.</h2>
          <p>Call during office hours or email the firm to request a conversation. Contacting the office does not by itself create an attorney-client relationship.</p>
          <div class="cluster">
            <a class="button button--primary" href="${site.phone.href}">Call ${escapeHtml(site.phone.display)}</a>
            <a class="button button--on-dark" href="mailto:${escapeHtml(site.email)}">Email the office</a>
          </div>
        </div>
        <dl class="contact-panel__details">
          <div><dt>Office</dt><dd>${escapeHtml(site.address.display)}</dd></div>
          <div><dt>Hours</dt><dd>${escapeHtml(site.hours)}</dd></div>
          <div><dt>Directions</dt><dd><a href="${escapeHtml(site.directionsUrl)}">Open in Google Maps</a></dd></div>
        </dl>
      </div>
    </section>`;
}

export function renderFooter(site) {
  const year = new Date().getFullYear();
  return `
    <footer class="site-footer">
      <div class="container site-footer__grid">
        <div class="stack" style="--stack-space: var(--space-4)">
          <div class="site-footer__brand">${escapeHtml(site.firmName)}</div>
          <p>${escapeHtml(site.descriptor)}</p>
          <p>${escapeHtml(site.address.display)}<br><a href="${site.phone.href}">${escapeHtml(site.phone.display)}</a></p>
        </div>
        <div class="stack" style="--stack-space: var(--space-6)">
          <ul class="site-footer__links">
            <li><a href="/practice-areas/">Practice Areas</a></li>
            <li><a href="/about/">About</a></li>
            <li><a href="/contact/">Contact</a></li>
            <li><a href="/accessibility/">Accessibility</a></li>
            <li><a href="${escapeHtml(site.privacyUrl)}">Privacy</a></li>
            <li><a href="${escapeHtml(site.termsUrl)}">Terms</a></li>
          </ul>
          <p class="site-footer__disclaimer">${escapeHtml(site.disclaimer)}</p>
          <p>© ${year} ${escapeHtml(site.firmName)}. All rights reserved.</p>
        </div>
      </div>
    </footer>`;
}

export function renderPracticeLink(practice) {
  return `<a class="practice-link" href="/${escapeHtml(practice.slug)}/">${escapeHtml(practice.title)}</a>`;
}

export function renderAttorneySummary(attorney) {
  return `
    <article class="attorney-summary" id="${escapeHtml(attorney.slug)}-summary">
      <h3 class="attorney-summary__name">${escapeHtml(attorney.name)}</h3>
      <p class="attorney-summary__summary">${escapeHtml(attorney.summary)}</p>
      <a class="attorney-summary__link" href="/about/#${escapeHtml(attorney.slug)}">Read biography</a>
    </article>`;
}

export function renderLegacyPage({ site, from, to, label }) {
  return {
    title: `Page moved | ${site.firmName}`,
    description: `The ${label} page has moved to a new address.`,
    canonicalPath: to,
    activePath: '',
    h1: 'This page has moved',
    hero: {
      kicker: 'Updated website address',
      summary: `The requested ${label} page now has a clearer address.`
    },
    body: `
      <section class="section">
        <div class="container">
          <div class="legacy-notice stack">
            <p>The page at <code>${escapeHtml(from)}</code> is now available at the link below.</p>
            <p><a class="button button--primary" href="${escapeHtml(to)}">Continue to ${escapeHtml(label)}</a></p>
          </div>
        </div>
      </section>`,
    showContactPanel: false
  };
}
