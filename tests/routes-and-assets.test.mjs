import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { buildSite } from '../tools/build-site.mjs';

const projectRoot = resolve('.');
const routes = JSON.parse(await readFile(join(projectRoot, 'src/data/routes.json'), 'utf8'));

const outputPath = (root, route) => route === '/'
  ? join(root, 'index.html')
  : join(root, route.replace(/^\/+|\/+$/g, ''), 'index.html');

test('build writes canonical routes, visible legacy pages, documented imagery, and discovery files', async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), 'hem-routes-'));
  const outputDir = join(tempRoot, 'dist');

  try {
    await buildSite({ sourceDir: join(projectRoot, 'src'), outputDir });

    for (const route of routes.canonical) {
      assert.ok((await stat(outputPath(outputDir, route))).isFile(), `${route} writes index.html`);
    }

    for (const [legacy, canonical] of Object.entries(routes.legacy)) {
      const html = await readFile(outputPath(outputDir, legacy), 'utf8');
      const canonicalUrl = `https://www.hakeemellismarengo.com${canonical}`;
      assert.ok(html.includes(`rel="canonical" href="${canonicalUrl}"`), `${legacy} has canonical metadata`);
      assert.ok(html.includes(`href="${canonical}"`), `${legacy} has a visible destination link`);
    }
    assert.equal(routes.legacy['/conservatorship-and-guardianship'], '/criminal-defense/');

    const manifest = JSON.parse(await readFile(join(projectRoot, 'src/assets/images/manifest.json'), 'utf8'));
    assert.equal(manifest.length, 3);
    for (const image of manifest) {
      for (const field of ['file', 'width', 'height', 'alt', 'source']) assert.ok(image[field], `${image.file || 'image'} has ${field}`);
      assert.ok((await stat(join(projectRoot, 'src/assets/images', image.file))).isFile(), `${image.file} exists in source`);
      assert.ok((await stat(join(outputDir, 'assets/images', image.file))).isFile(), `${image.file} is copied to output`);
    }

    const sitemap = await readFile(join(outputDir, 'sitemap.xml'), 'utf8');
    for (const route of routes.canonical) {
      assert.ok(sitemap.includes(`<loc>https://www.hakeemellismarengo.com${route}</loc>`), `${route} is in sitemap`);
    }
    for (const legacy of Object.keys(routes.legacy)) assert.ok(!sitemap.includes(`<loc>https://www.hakeemellismarengo.com${legacy}</loc>`));

    const robots = await readFile(join(outputDir, 'robots.txt'), 'utf8');
    assert.equal(robots, 'User-agent: *\nAllow: /\nSitemap: https://www.hakeemellismarengo.com/sitemap.xml\n');
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
