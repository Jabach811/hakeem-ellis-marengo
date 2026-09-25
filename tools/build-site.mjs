import { access, cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { dirname, basename, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderLayout } from '../src/templates/layout.mjs';
import { renderLegacyPage } from '../src/templates/components.mjs';
import {
  renderAbout,
  renderAccessibility,
  renderContact,
  renderHome,
  renderNotFound,
  renderPractice,
  renderPracticeDirectory
} from '../src/templates/pages.mjs';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const exists = async (path) => {
  try {
    await access(path, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
};

function routeOutputPath(outputDir, route) {
  if (route === '/') return join(outputDir, 'index.html');
  if (route === '/404.html') return join(outputDir, '404.html');
  return join(outputDir, route.replace(/^\/+|\/+$/g, ''), 'index.html');
}

function makeLocalUrlsPortable(html, route) {
  const depth = route === '/' || route === '/404.html'
    ? 0
    : route.replace(/^\/+|\/+$/g, '').split('/').length;
  const toRoot = '../'.repeat(depth);

  return html.replace(/\b(href|src)=(['"])\/(?!\/)([^'"]*)\2/g, (_match, attribute, quote, path) => {
    const [pathname, suffix = ''] = path.split(/(?=[?#])/);
    const localPath = attribute === 'href' && (pathname === '' || pathname.endsWith('/'))
      ? `${pathname}index.html`
      : pathname;
    const relativePath = `${toRoot}${localPath}${suffix}`;
    return `${attribute}=${quote}${relativePath}${quote}`;
  });
}

async function writePage(outputDir, route, html) {
  const path = routeOutputPath(outputDir, route);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${html}\n`, 'utf8');
}

async function writeDiscoveryFiles(outputDir, site, canonicalRoutes) {
  const sitemapEntries = canonicalRoutes
    .map((route) => `  <url><loc>${site.siteUrl}${route}</loc></url>`)
    .join('\n');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`;
  const robots = `User-agent: *\nAllow: /\nSitemap: ${site.siteUrl}/sitemap.xml\n`;
  await Promise.all([
    writeFile(join(outputDir, 'sitemap.xml'), sitemap, 'utf8'),
    writeFile(join(outputDir, 'robots.txt'), robots, 'utf8')
  ]);
}

async function loadContent(projectRoot, owner, contentFile) {
  const path = resolve(projectRoot, contentFile);
  if (!(await exists(path))) {
    throw new Error(`${owner}: missing content fragment ${contentFile}`);
  }
  return readFile(path, 'utf8');
}

function readPath(object, path) {
  return path.split('.').reduce((value, key) => value?.[key], object);
}

function validateSiteData(site, practices, routes) {
  const requiredSiteValues = [
    'siteUrl', 'firmName', 'descriptor', 'heroTitle', 'heroSummary',
    'phone.display', 'phone.href', 'email', 'fax', 'address.display',
    'hours', 'directionsUrl', 'disclaimer', 'privacyUrl', 'termsUrl'
  ];
  for (const path of requiredSiteValues) {
    const value = readPath(site, path);
    if (typeof value !== 'string' || value.trim() === '') throw new Error(`site: missing required value ${path}`);
  }
  if (!Array.isArray(routes.canonical) || !routes.canonical.includes('/')) throw new Error('routes: canonical routes must include /');
  if (!routes.legacy || typeof routes.legacy !== 'object') throw new Error('routes: legacy route map is required');
  for (const practice of practices) {
    for (const field of ['slug', 'title', 'summary', 'contentFile']) {
      if (typeof practice[field] !== 'string' || practice[field].trim() === '') throw new Error(`${practice.slug || 'practice'}: missing required value ${field}`);
    }
    if (!routes.canonical.includes(`/${practice.slug}/`)) throw new Error(`${practice.slug}: canonical route is missing`);
  }
  for (const [legacy, canonical] of Object.entries(routes.legacy)) {
    if (!legacy.startsWith('/') || !routes.canonical.includes(canonical)) throw new Error(`${legacy}: invalid legacy destination ${canonical}`);
  }
}

function validatePageContract(route, page) {
  for (const field of ['title', 'description', 'canonicalPath', 'h1', 'body']) {
    if (typeof page[field] !== 'string' || page[field].trim() === '') throw new Error(`${route}: page is missing ${field}`);
  }
}

async function validateImageManifest(sourceDir) {
  const imageDir = join(sourceDir, 'assets', 'images');
  const manifestPath = join(imageDir, 'manifest.json');
  if (!(await exists(manifestPath))) throw new Error('assets: missing image manifest');
  const manifest = await readJson(manifestPath);
  for (const image of manifest) {
    for (const field of ['file', 'width', 'height', 'alt', 'source']) {
      if (!image[field]) throw new Error(`assets: image manifest entry is missing ${field}`);
    }
    if (!(await exists(join(imageDir, image.file)))) throw new Error(`assets: missing referenced image ${image.file}`);
  }
}

async function copyAssets(sourceDir, outputDir, projectRoot) {
  const assetsSource = join(sourceDir, 'assets');
  const assetsOutput = join(outputDir, 'assets');
  let assetCount = 0;

  for (const folder of ['css', 'js', 'images']) {
    const from = join(assetsSource, folder);
    if (!(await exists(from))) continue;
    const to = join(assetsOutput, folder);
    await cp(from, to, { recursive: true });
    assetCount += (await readdir(from, { recursive: true })).length;
  }

  const fontSources = [
    ['@fontsource/newsreader/files/newsreader-latin-400-normal.woff2', 'newsreader-latin-400-normal.woff2'],
    ['@fontsource/newsreader/files/newsreader-latin-500-normal.woff2', 'newsreader-latin-500-normal.woff2'],
    ['@fontsource/source-sans-3/files/source-sans-3-latin-400-normal.woff2', 'source-sans-3-latin-400-normal.woff2'],
    ['@fontsource/source-sans-3/files/source-sans-3-latin-600-normal.woff2', 'source-sans-3-latin-600-normal.woff2']
  ];
  const fontOutput = join(assetsOutput, 'fonts');
  await mkdir(fontOutput, { recursive: true });
  for (const [packagePath, fileName] of fontSources) {
    const from = resolve(projectRoot, 'node_modules', packagePath);
    if (!(await exists(from))) throw new Error(`missing required font ${packagePath}`);
    await cp(from, join(fontOutput, fileName));
    assetCount += 1;
  }
  return assetCount;
}

export async function buildSite({ sourceDir = resolve('src'), outputDir = resolve('dist') } = {}) {
  const resolvedSource = resolve(sourceDir);
  const resolvedOutput = resolve(outputDir);
  const projectRoot = dirname(resolvedSource);
  if (basename(resolvedOutput).toLowerCase() !== 'dist' || resolvedOutput === projectRoot) {
    throw new Error(`refusing to clear unsafe output path: ${resolvedOutput}`);
  }

  const dataDir = join(resolvedSource, 'data');
  const [site, attorneys, practices, routes] = await Promise.all([
    readJson(join(dataDir, 'site.json')),
    readJson(join(dataDir, 'attorneys.json')),
    readJson(join(dataDir, 'practices.json')),
    readJson(join(dataDir, 'routes.json'))
  ]);
  validateSiteData(site, practices, routes);

  const practiceContent = new Map();
  for (const practice of practices) {
    practiceContent.set(practice.slug, await loadContent(projectRoot, practice.slug, practice.contentFile));
  }

  let firmContent = '';
  const biographies = {};
  if (routes.canonical.includes('/about/')) {
    firmContent = await loadContent(projectRoot, 'about', 'src/content/about/firm.html');
    for (const attorney of attorneys) {
      biographies[attorney.slug] = await loadContent(projectRoot, attorney.slug, attorney.contentFile);
    }
  }
  await validateImageManifest(resolvedSource);

  await rm(resolvedOutput, { recursive: true, force: true });
  await mkdir(resolvedOutput, { recursive: true });

  const practiceBySlug = new Map(practices.map((practice) => [practice.slug, practice]));
  const pageForRoute = (route) => {
    if (route === '/') return renderHome({ site, practices, attorneys });
    if (route === '/practice-areas/') return renderPracticeDirectory({ site, practices });
    if (route === '/about/') return renderAbout({ site, attorneys, practices, firmContent, biographies });
    if (route === '/contact/') return renderContact({ site });
    if (route === '/accessibility/') return renderAccessibility({ site });
    const slug = route.replace(/^\/+|\/+$/g, '');
    const practice = practiceBySlug.get(slug);
    if (!practice) throw new Error(`no renderer for canonical route ${route}`);
    return renderPractice({
      site,
      practice,
      content: practiceContent.get(slug),
      attorneys: attorneys.filter((attorney) => attorney.practiceSlugs.includes(slug)),
      related: practice.related.map((relatedSlug) => practiceBySlug.get(relatedSlug)).filter(Boolean)
    });
  };

  for (const route of routes.canonical) {
    const page = pageForRoute(route);
    validatePageContract(route, page);
    await writePage(resolvedOutput, route, makeLocalUrlsPortable(renderLayout({ ...page, site }), route));
  }

  const labels = {
    '/practice-areas/': 'Practice Areas',
    '/about/': 'About',
    '/professional-license-defense/': 'Professional License Defense',
    '/criminal-defense/': 'Criminal Defense'
  };
  for (const [from, to] of Object.entries(routes.legacy)) {
    const page = renderLegacyPage({ site, from, to, label: labels[to] || 'requested' });
    validatePageContract(from, page);
    await writePage(resolvedOutput, from, makeLocalUrlsPortable(renderLayout({ ...page, site }), from));
  }

  const notFoundPage = renderNotFound({ site });
  validatePageContract('/404.html', notFoundPage);
  await writePage(resolvedOutput, '/404.html', makeLocalUrlsPortable(renderLayout({ ...notFoundPage, site }), '/404.html'));
  await writeDiscoveryFiles(resolvedOutput, site, routes.canonical);
  const assetCount = await copyAssets(resolvedSource, resolvedOutput, projectRoot);

  return {
    pageCount: routes.canonical.length + Object.keys(routes.legacy).length + 1,
    canonicalPaths: routes.canonical,
    legacyPaths: Object.keys(routes.legacy),
    assetCount,
    outputDir: resolvedOutput
  };
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  const result = await buildSite();
  console.log(`Built ${result.pageCount} pages and ${result.assetCount} assets in ${relative(process.cwd(), result.outputDir) || 'dist'}.`);
}
