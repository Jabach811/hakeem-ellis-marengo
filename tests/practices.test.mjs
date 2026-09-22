import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderPractice } from '../src/templates/pages.mjs';

const loadJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const site = loadJson('../src/data/site.json');
const practices = loadJson('../src/data/practices.json');
const attorneys = loadJson('../src/data/attorneys.json');

test('all eleven practice pages have complete structured content and related links', () => {
  const issues = [];

  for (const practice of practices) {
    let content;
    try {
      content = readFileSync(new URL(`../${practice.contentFile}`, import.meta.url), 'utf8');
    } catch {
      issues.push(`${practice.slug}: missing fragment ${practice.contentFile}`);
      continue;
    }

    if ((content.match(/<h2\b/g) || []).length < 2) issues.push(`${practice.slug}: fewer than two h2 sections`);
    if (/<h1\b/i.test(content)) issues.push(`${practice.slug}: fragment contains h1`);
    if (/555|mymail|Button|Empty heading/i.test(content)) issues.push(`${practice.slug}: fragment contains placeholder copy`);

    const related = practice.related.map((slug) => practices.find((item) => item.slug === slug));
    const practiceAttorneys = attorneys.filter((attorney) => attorney.practiceSlugs.includes(practice.slug));
    const html = renderPractice({ site, practice, related, content, attorneys: practiceAttorneys }).body;
    for (const slug of practice.related) {
      if (!html.includes(`href="/${slug}/"`)) issues.push(`${practice.slug}: missing related link ${slug}`);
    }
    for (const attorney of practiceAttorneys) {
      if (!html.includes(`href="/about/#${attorney.slug}"`)) issues.push(`${practice.slug}: missing attorney link ${attorney.slug}`);
      if (!html.includes(attorney.name)) issues.push(`${practice.slug}: missing attorney name ${attorney.name}`);
    }
  }

  assert.deepEqual(issues, []);
});
