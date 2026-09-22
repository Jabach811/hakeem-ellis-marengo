import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('tokens expose approved primitives and semantic roles', async () => {
  const css = await readFile('src/assets/css/tokens.css', 'utf8');
  for (const required of [
    '--burgundy-700: #6D1118',
    '--wine-900: #3E080D',
    '--ink-900: #1A1C20',
    '--paper-50: #F7F3EA',
    '--stone-200: #D8D0C4',
    '--brass-600: #9B6A33',
    '--color-action:',
    '--color-surface:',
    '--button-primary-bg:'
  ]) {
    assert.ok(css.includes(required), required);
  }
});

test('component and page CSS use tokens instead of raw hex colors', async () => {
  for (const path of ['src/assets/css/components.css', 'src/assets/css/pages.css']) {
    const css = await readFile(path, 'utf8');
    assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i);
  }
});
