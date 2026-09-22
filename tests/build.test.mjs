import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildSite } from '../tools/build-site.mjs';

const writeJson = (path, value) => writeFile(path, `${JSON.stringify(value, null, 2)}\n`);

async function createFixture(siteOverrides = {}) {
  const projectRoot = await mkdtemp(join(tmpdir(), 'hem-build-'));
  const sourceDir = join(projectRoot, 'src');
  const outputDir = join(projectRoot, 'dist');
  const dataDir = join(sourceDir, 'data');
  await mkdir(dataDir, { recursive: true });

  await writeJson(join(dataDir, 'site.json'), {
    siteUrl: 'https://www.hakeemellismarengo.com',
    firmName: 'Hakeem, Ellis & Marengo',
    descriptor: 'A Professional Corporation',
    foundedYear: 1985,
    locationLine: 'Stockton, California',
    heroTitle: 'Serving the Central Valley since 1985',
    heroSummary: 'Experienced legal counsel.',
    phone: { display: '(209) 474-2800', href: 'tel:+12094742800' },
    email: 'info@hemlaw.com',
    fax: '(209) 474-3654',
    address: { display: '3414 Brookside Rd. Ste 100, Stockton, CA 95219' },
    hours: 'Monday–Friday, 9:00 a.m.–5:00 p.m.',
    directionsUrl: 'https://example.test/directions',
    disclaimer: 'General information only.',
    privacyUrl: 'https://example.test/privacy',
    termsUrl: 'https://example.test/terms',
    practiceGroups: [],
    proofClaims: [],
    ...siteOverrides
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
  return { projectRoot, sourceDir, outputDir };
}

test('build reports a missing fragment with route and path', async () => {
  const fixture = await createFixture();
  try {
    await assert.rejects(
      () => buildSite({ sourceDir: fixture.sourceDir, outputDir: fixture.outputDir }),
      /business-law.*src[\\/]content[\\/]practices[\\/]business-law\.html/i
    );
  } finally {
    await rm(fixture.projectRoot, { recursive: true, force: true });
  }
});

test('build rejects missing required contact data before rendering', async () => {
  const fixture = await createFixture({ email: '' });
  try {
    await assert.rejects(
      () => buildSite({ sourceDir: fixture.sourceDir, outputDir: fixture.outputDir }),
      /site.*missing required value.*email/i
    );
  } finally {
    await rm(fixture.projectRoot, { recursive: true, force: true });
  }
});
