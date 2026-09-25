import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderLayout } from '../src/templates/layout.mjs';
import { renderHome } from '../src/templates/pages.mjs';

const loadJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const site = loadJson('../src/data/site.json');
const practices = loadJson('../src/data/practices.json');
const attorneys = loadJson('../src/data/attorneys.json');

test('homepage contains the approved discovery sequence and complete firm inventory', () => {
  const html = renderLayout({ ...renderHome({ site, practices, attorneys }), site });

  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, />Serving the Central Valley since 1985</);
  assert.match(html, /A Stockton firm advising individuals and businesses/);
  assert.match(html, /id="firm-distinction"/);
  assert.match(html, /id="firm-history"/);

  for (const group of site.practiceGroups) {
    assert.match(html, new RegExp(`>${group.title.replaceAll('&', '&amp;')}<`));
  }

  for (const practice of practices) {
    assert.match(html, new RegExp(`href="/${practice.slug}/"`));
  }

  for (const attorney of attorneys) {
    assert.match(html, new RegExp(`>${attorney.name}<`));
  }

  for (const claim of site.proofClaims) {
    const present = html.includes(`>${claim.value}<`);
    assert.equal(present, !claim.requiresVerification, `${claim.value} proof claim shown only once confirmed`);
  }
  assert.doesNotMatch(html, /Needs firm confirmation/);
  assert.match(html, />Call \(209\) 474-2800</);
  assert.match(html, />Explore practice areas</);
});

test('homepage uses the handoff hero, situation links, and office introduction', () => {
  const html = renderLayout({ ...renderHome({ site, practices, attorneys }), site });

  assert.match(html, /hem-office-building\.webp/);
  assert.match(html, /class="hero__practice-strip"/);
  assert.match(html, /href="\/practice-areas\/#business-property"/);
  assert.match(html, /class="home-firm-intro__image"/);
  assert.match(html, /Reception, 3414 Brookside Rd\. Ste 100, Stockton/);
  assert.match(html, /class="home-practice-groups"/);
});
