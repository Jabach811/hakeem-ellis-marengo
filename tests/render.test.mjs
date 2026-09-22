import test from 'node:test';
import assert from 'node:assert/strict';
import { renderLayout } from '../src/templates/layout.mjs';
import { readFileSync } from 'node:fs';

test('layout renders one h1, skip link, canonical metadata, and verified contact actions', () => {
  const html = renderLayout({
    title: 'Test',
    description: 'Test description',
    canonicalPath: '/test/',
    h1: 'Test page',
    body: '<p>Body</p>',
    activePath: '/test/'
  });

  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /href="#main-content"/);
  assert.match(
    html,
    /rel="canonical" href="https:\/\/www\.hakeemellismarengo\.com\/test\/"/
  );
  assert.match(html, /href="tel:\+12094742800"/);
  assert.match(html, /href="mailto:info@hemlaw\.com"/);
  assert.match(html, /<main id="main-content"/);
  assert.match(html, /rel="icon" href="\/assets\/images\/favicon\.svg"/);
});

test('layout includes primary links in HTML before JavaScript runs', () => {
  const html = renderLayout({
    title: 'Test',
    description: 'Test description',
    canonicalPath: '/',
    h1: 'Home',
    body: '<p>Body</p>',
    activePath: '/'
  });

  for (const path of ['/', '/practice-areas/', '/about/', '/contact/']) {
    assert.match(html, new RegExp(`href="${path.replaceAll('/', '\\/')}"`));
  }
});

test('mobile navigation has a native fallback when the enhancement script is unavailable', () => {
  const html = renderLayout({
    title: 'Test',
    description: 'Test description',
    canonicalPath: '/',
    h1: 'Home',
    body: '<p>Body</p>',
    activePath: '/'
  });
  const script = readFileSync(new URL('../src/assets/js/site.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../src/assets/css/components.css', import.meta.url), 'utf8');

  assert.match(html, /<details class="mobile-nav-fallback"/);
  assert.match(html, /<summary>Menu<\/summary>/);
  assert.match(script, /classList\.add\('has-js'\)/);
  assert.match(css, /\.has-js \.mobile-nav-fallback/);
  assert.match(css, /\.has-js \.menu-button/);
});
