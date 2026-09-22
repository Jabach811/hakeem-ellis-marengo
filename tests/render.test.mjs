import test from 'node:test';
import assert from 'node:assert/strict';
import { renderLayout } from '../src/templates/layout.mjs';

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
