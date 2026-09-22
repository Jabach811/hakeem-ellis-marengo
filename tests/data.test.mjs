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
  assert.deepEqual(
    new Set(practices.map(({ group }) => group)),
    new Set(['business-property', 'disputes-defense', 'families-estates'])
  );
});

test('attorney inventory contains the four public attorneys', async () => {
  const attorneys = await json('src/data/attorneys.json');
  assert.deepEqual(attorneys.map(({ name }) => name), [
    'Michael D. Hakeem',
    'Albert M. Ellis',
    'Renee M. Marengo',
    'Stephen J. Baker'
  ]);
});

test('legacy routes resolve to approved canonical routes', async () => {
  const routes = await json('src/data/routes.json');
  assert.equal(routes.legacy['/services'], '/practice-areas/');
  assert.equal(routes.legacy['/about-us-page---freddie'], '/about/');
  assert.equal(
    routes.legacy['/professions-discipline-by-licensing-agencies'],
    '/professional-license-defense/'
  );
  assert.equal(routes.legacy['/conservatorship-and-guardianship'], '/criminal-defense/');
});
