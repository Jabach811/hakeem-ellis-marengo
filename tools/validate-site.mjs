import { access, readFile, readdir, stat } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const VERIFIED_PHONE = 'tel:+12094742800';
const VERIFIED_EMAIL = 'mailto:info@hemlaw.com';
const PRIMARY_PATHS = ['/', '/practice-areas/', '/about/', '/contact/'];

const exists = async (path) => {
  try {
    await access(path, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
};

async function walkHtml(rootDir, currentDir = rootDir) {
  const pages = [];
  for (const entry of await readdir(currentDir, { withFileTypes: true })) {
    const path = join(currentDir, entry.name);
    if (entry.isDirectory()) pages.push(...await walkHtml(rootDir, path));
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) pages.push(path);
  }
  return pages;
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  return match?.[2] ?? '';
}

function visibleText(markup) {
  return markup.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
}

function resolveLocalTarget(rootDir, pagePath, href) {
  const clean = href.split('#')[0].split('?')[0];
  if (!clean || clean.startsWith('#') || /^(?:https?:|mailto:|tel:|javascript:|data:)/i.test(clean)) return null;
  let target = clean.startsWith('/')
    ? resolve(rootDir, `.${clean}`)
    : resolve(dirname(pagePath), clean);
  if (clean.endsWith('/') || !extname(target)) target = join(target, 'index.html');
  return target;
}

function addError(errors, rootDir, file, rule, message) {
  errors.push({ file: file.slice(rootDir.length + 1).replaceAll('\\', '/'), rule, message });
}

export async function validateSite(rootDir = resolve('dist')) {
  const root = resolve(rootDir);
  const htmlFiles = await walkHtml(root);
  const errors = [];
  const warnings = [];
  let links = 0;
  let images = 0;
  const seenTitles = new Map();
  const seenDescriptions = new Map();
  const seenCanonicals = new Map();

  const recordUnique = (map, value, file, rule) => {
    if (!value) return;
    if (map.has(value)) {
      addError(errors, root, file, rule, `duplicates ${map.get(value)}`);
    } else {
      map.set(value, file.slice(root.length + 1).replaceAll('\\', '/'));
    }
  };

  for (const file of htmlFiles) {
    const html = await readFile(file, 'utf8');
    const title = visibleText(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '');
    const descriptionTag = html.match(/<meta\b[^>]*name=["']description["'][^>]*>/i)?.[0] || '';
    const canonicalTag = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i)?.[0] || '';
    const description = attribute(descriptionTag, 'content');
    const canonical = attribute(canonicalTag, 'href');
    recordUnique(seenTitles, title, file, 'unique-title');
    recordUnique(seenDescriptions, description, file, 'unique-description');
    if (!/class=["'][^"']*legacy-notice/i.test(html)) recordUnique(seenCanonicals, canonical, file, 'unique-canonical');

    const h1Count = (html.match(/<h1\b/gi) || []).length;
    if (h1Count !== 1) addError(errors, root, file, 'single-h1', `expected one h1, found ${h1Count}`);
    if (!/<meta\b[^>]*name=["']description["'][^>]*content=["'][^"']+["'][^>]*>/i.test(html)) {
      addError(errors, root, file, 'meta-description', 'missing non-empty meta description');
    }
    if (!/<link\b[^>]*rel=["']canonical["'][^>]*href=["'][^"']+["'][^>]*>/i.test(html)) {
      addError(errors, root, file, 'canonical-link', 'missing canonical link');
    }
    if (/\b555[-.)\s]*555[-\s]*5555\b|\+1-?555-?555-?5555/i.test(html)) {
      addError(errors, root, file, 'placeholder-phone', 'placeholder phone number found');
    }
    if (/mymail@mailservice\.com/i.test(html)) {
      addError(errors, root, file, 'placeholder-email', 'placeholder email found');
    }

    const seenIds = new Set();
    for (const match of html.matchAll(/\bid\s*=\s*(["'])(.*?)\1/gi)) {
      if (seenIds.has(match[2])) addError(errors, root, file, 'duplicate-id', `duplicate id ${match[2]}`);
      seenIds.add(match[2]);
    }

    const nav = html.match(/<nav\b[^>]*(?:aria-label=["']Primary navigation["']|class=["'][^"']*site-nav[^"']*["'])[^>]*>([\s\S]*?)<\/nav>/i);
    const navHrefs = nav ? [...nav[1].matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)].map((match) => match[1]) : [];
    if (!nav || PRIMARY_PATHS.some((path) => !navHrefs.includes(path))) {
      addError(errors, root, file, 'primary-navigation', 'primary navigation is missing required HTML links');
    }

    for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
      links += 1;
      const [tag, href, inner] = match;
      const label = visibleText(inner) || attribute(tag, 'aria-label') || attribute(tag, 'title') || attribute(inner, 'alt');
      if (!href || !label) addError(errors, root, file, 'empty-control', 'link has no destination or accessible text');
      if (href.startsWith('tel:') && href !== VERIFIED_PHONE) {
        addError(errors, root, file, 'verified-telephone', `unexpected telephone destination ${href}`);
      }
      if (href.startsWith('mailto:') && href !== VERIFIED_EMAIL) {
        addError(errors, root, file, 'verified-email', `unexpected email destination ${href}`);
      }
      const target = resolveLocalTarget(root, file, href);
      if (target && !(await exists(target))) addError(errors, root, file, 'broken-local-link', `${href} does not resolve`);
    }

    for (const match of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
      const tag = match[0];
      const label = visibleText(match[2]) || attribute(tag, 'aria-label') || attribute(tag, 'title');
      if (!label) addError(errors, root, file, 'empty-control', 'button has no accessible text');
    }

    for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
      images += 1;
      const tag = match[0];
      const src = attribute(tag, 'src');
      const width = attribute(tag, 'width');
      const height = attribute(tag, 'height');
      const altMatch = tag.match(/\balt\s*=\s*(["'])(.*?)\1/i);
      if (!width || !height) addError(errors, root, file, 'image-dimensions', `${src || 'image'} is missing width or height`);
      if (!altMatch) addError(errors, root, file, 'image-alt', `${src || 'image'} is missing alt text`);
      const target = resolveLocalTarget(root, file, src);
      if (target && !(await exists(target))) addError(errors, root, file, 'missing-image', `${src} does not resolve`);
    }
  }

  return { pages: htmlFiles.length, links, images, errors, warnings };
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  const result = await validateSite(process.argv[2] ? resolve(process.argv[2]) : resolve('dist'));
  console.log(`Validated ${result.pages} pages, ${result.links} links, and ${result.images} images: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
  for (const error of result.errors) console.error(`${error.file} [${error.rule}] ${error.message}`);
  if (result.errors.length > 0) process.exitCode = 1;
}
