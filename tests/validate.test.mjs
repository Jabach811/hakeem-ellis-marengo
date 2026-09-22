import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { validateSite } from '../tools/validate-site.mjs';
import { startStaticServer } from '../tools/serve.mjs';

test('validator reports every release-blocking HTML and local-asset failure', async () => {
  const root = await mkdtemp(join(tmpdir(), 'hem-validator-'));
  try {
    await mkdir(join(root, 'assets'), { recursive: true });
    await writeFile(join(root, 'index.html'), `<!doctype html>
      <html lang="en"><head><title>Broken fixture</title></head><body>
      <nav aria-label="Primary navigation"></nav>
      <main><h1>First</h1><h1>Second</h1>
      <a href="/missing/">Broken local link</a>
      <a href=""></a><button type="button"></button>
      <a href="tel:+15555555555">Call 555-555-5555</a>
      <a href="mailto:mymail@mailservice.com">mymail@mailservice.com</a>
      <img src="/assets/missing.webp" alt="Missing dimensions">
      </main><script src="/assets/site.js"></script></body></html>`, 'utf8');

    const result = await validateSite(root);
    const rules = result.errors.map((error) => error.rule);

    for (const rule of [
      'broken-local-link',
      'missing-image',
      'single-h1',
      'meta-description',
      'canonical-link',
      'placeholder-phone',
      'placeholder-email',
      'verified-telephone',
      'image-dimensions',
      'empty-control',
      'primary-navigation'
    ]) {
      assert.ok(rules.includes(rule), `${rule} was reported`);
    }
    assert.equal(result.pages, 1);
    assert.ok(result.links >= 4);
    assert.equal(result.images, 1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('static preview serves directory indexes, MIME types, and the custom 404', async () => {
  const root = await mkdtemp(join(tmpdir(), 'hem-server-'));
  let preview;
  try {
    await mkdir(join(root, 'nested'), { recursive: true });
    await writeFile(join(root, 'index.html'), '<h1>Home</h1>', 'utf8');
    await writeFile(join(root, 'nested/index.html'), '<h1>Nested</h1>', 'utf8');
    await writeFile(join(root, '404.html'), '<h1>Not found</h1>', 'utf8');
    await writeFile(join(root, 'site.css'), 'body { color: black; }', 'utf8');

    preview = await startStaticServer({ rootDir: root, port: 0, log: false });
    const home = await fetch(preview.url);
    assert.equal(home.status, 200);
    assert.match(await home.text(), /Home/);

    const nested = await fetch(`${preview.url}nested/`);
    assert.equal(nested.status, 200);
    assert.match(await nested.text(), /Nested/);

    const css = await fetch(`${preview.url}site.css`);
    assert.match(css.headers.get('content-type'), /^text\/css/);

    const missing = await fetch(`${preview.url}missing/`);
    assert.equal(missing.status, 404);
    assert.match(await missing.text(), /Not found/);
  } finally {
    if (preview) await new Promise((resolveClose) => preview.server.close(resolveClose));
    await rm(root, { recursive: true, force: true });
  }
});
