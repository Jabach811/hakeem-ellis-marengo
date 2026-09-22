import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildSite } from '../tools/build-site.mjs';

const writeJson = (path, value) => writeFile(path, `${JSON.stringify(value, null, 2)}\n`);

test('build reports a missing fragment with route and path', async () => {
  const projectRoot = await mkdtemp(join(tmpdir(), 'hem-build-'));
  const sourceDir = join(projectRoot, 'src');
  const outputDir = join(projectRoot, 'dist');
  const dataDir = join(sourceDir, 'data');

  await mkdir(dataDir, { recursive: true });
  await writeJson(join(dataDir, 'site.json'), {
    siteUrl: 'https://www.hakeemellismarengo.com',
    firmName: 'Hakeem, Ellis & Marengo',
    descriptor: 'A Professional Corporation',
    phone: { display: '(209) 474-2800', href: 'tel:+12094742800' },
    email: 'info@hemlaw.com',
    address: { display: '3414 Brookside Rd. Ste 100, Stockton, CA 95219' },
    hours: 'Monday–Friday, 9:00 a.m.–5:00 p.m.',
    disclaimer: 'General information only.',
    privacyUrl: 'https://example.test/privacy',
    termsUrl: 'https://example.test/terms',
    practiceGroups: [],
    proofClaims: []
  });
  await writeJson(join(dataDir, 'attorneys.json'), []);
  await writeJson(join(dataDir, 'practices.json'), [{
    slug: 'business-law',
    title: 'Business Law',
    group: 'business-property',
    summary: 'Business counsel.',
    contentFile: 'src/content/practices/business-law.html',
    matters: [],
    related: []
  }]);
  await writeJson(join(dataDir, 'routes.json'), {
    canonical: ['/', '/business-law/'],
    legacy: {}
  });

  await assert.rejects(
    () => buildSite({ sourceDir, outputDir }),
    /business-law.*src[\\/]content[\\/]practices[\\/]business-law\.html/i
  );

  await rm(projectRoot, { recursive: true, force: true });
});
