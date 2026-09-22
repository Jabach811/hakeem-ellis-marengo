import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('operator guide documents every release command and content location', () => {
  const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
  for (const command of ['npm ci', 'npm test', 'npm run build', 'npm run validate', 'npm run serve']) {
    assert.ok(readme.includes(command), `${command} is documented`);
  }
  for (const path of ['src/data/site.json', 'src/data/practices.json', 'src/data/attorneys.json', 'src/content/', 'src/assets/images/', 'src/assets/css/tokens.css', 'src/data/routes.json']) {
    assert.ok(readme.includes(path), `${path} is documented`);
  }
  assert.match(readme, /dist\/.*generated/is);
});

test('launch checklist names every unconfirmed public-content category', () => {
  const checklist = readFileSync(new URL('../docs/CONTENT-VERIFICATION.md', import.meta.url), 'utf8');
  for (const phrase of [
    '40+ years',
    '300+ companies',
    '14,000+ clients',
    'attorney biographies',
    'practice description',
    'privacy and terms',
    'office imagery rights',
    'social profiles',
    'legal disclaimer'
  ]) {
    assert.match(checklist, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  }
});

test('implementation review accounts for every approved specification section', () => {
  const review = readFileSync(new URL('../docs/IMPLEMENTATION-REVIEW.md', import.meta.url), 'utf8');
  for (let section = 1; section <= 15; section += 1) {
    assert.match(review, new RegExp(`^## ${section}\\.`, 'm'), `spec section ${section} is reviewed`);
  }
  assert.match(review, /No unresolved implementation deviation remains/i);
  assert.match(review, /Fontsource packages/i);
});
