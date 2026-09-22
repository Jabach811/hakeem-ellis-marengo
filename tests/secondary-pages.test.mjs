import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderLayout } from '../src/templates/layout.mjs';
import {
  renderAbout,
  renderAccessibility,
  renderContact,
  renderNotFound
} from '../src/templates/pages.mjs';

const loadJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const loadFragment = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const site = loadJson('../src/data/site.json');
const attorneys = loadJson('../src/data/attorneys.json');

test('about page contains complete biographies without public birth dates', () => {
  const firmContent = loadFragment('src/content/about/firm.html');
  const biographies = Object.fromEntries(attorneys.map((attorney) => [attorney.slug, loadFragment(attorney.contentFile)]));
  const html = renderLayout({ ...renderAbout({ site, attorneys, firmContent, biographies }), site });

  for (const attorney of attorneys) assert.match(html, new RegExp(`>${attorney.name}<`));
  assert.doesNotMatch(html, /October 15(?:th)?,? 1946|February 27(?:th)?,? 1955|April 15,? 1958|December 28,? 1993/i);
  assert.match(html, /California Aviation Council v\. County of Amador/);
  assert.match(html, /Former Deputy District Attorney/);
});

test('contact page uses verified office details and no intake form', () => {
  const html = renderLayout({ ...renderContact({ site }), site });
  for (const value of [site.phone.href, site.phone.display, site.email, site.fax, site.address.display, site.hours]) {
    assert.ok(html.includes(value), `${value} is present`);
  }
  assert.ok(html.includes(site.directionsUrl.replaceAll('&', '&amp;')), 'encoded directions URL is present');
  assert.match(html, /does not by itself create an attorney-client relationship/i);
  assert.doesNotMatch(html, /<form\b/i);
});

test('accessibility page provides direct help without third-party compliance claims', () => {
  const html = renderLayout({ ...renderAccessibility({ site }), site });
  assert.ok(html.includes(site.phone.href));
  assert.ok(html.includes(`mailto:${site.email}`));
  assert.match(html, /Last updated:<\/strong> September 22, 2026/);
  assert.doesNotMatch(html, /UserWay/i);
});

test('404 page offers four useful exits and never redirects automatically', () => {
  const html = renderLayout({ ...renderNotFound({ site }), site });
  for (const href of ['/', '/practice-areas/', '/contact/', site.phone.href]) {
    assert.ok(html.includes(`href="${href}"`), `${href} exit is present`);
  }
  assert.doesNotMatch(html, /http-equiv="refresh"|location\.replace|location\.href/i);
});
