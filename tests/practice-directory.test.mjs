import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderPracticeDirectory } from '../src/templates/pages.mjs';

const loadJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const site = loadJson('../src/data/site.json');
const practices = loadJson('../src/data/practices.json');

test('practice directory groups every service once and explains the navigation', () => {
  const page = renderPracticeDirectory({ site, practices });

  assert.doesNotMatch(page.body, /href="\/services"/);
  assert.match(page.body, /grouping.+does not limit the firm['’]s services/is);

  for (const group of site.practiceGroups) {
    const groupTitle = group.title.replaceAll('&', '&amp;');
    const groupStart = page.body.indexOf(`>${groupTitle}</h2>`);
    assert.notEqual(groupStart, -1, `${group.title} heading is present`);

    const nextGroup = site.practiceGroups
      .map((candidate) => page.body.indexOf(`>${candidate.title.replaceAll('&', '&amp;')}</h2>`, groupStart + 1))
      .filter((index) => index > groupStart)
      .sort((a, b) => a - b)[0] ?? page.body.length;
    const section = page.body.slice(groupStart, nextGroup);

    for (const practice of practices.filter((item) => item.group === group.slug)) {
      const link = `href="/${practice.slug}/"`;
      assert.equal((section.match(new RegExp(link, 'g')) || []).length, 1, `${practice.title} is listed once in ${group.title}`);
      assert.match(section, new RegExp(practice.summary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
  }

  for (const practice of practices) {
    const link = `href="/${practice.slug}/"`;
    assert.equal((page.body.match(new RegExp(link, 'g')) || []).length, 1, `${practice.title} appears once overall`);
  }
});
