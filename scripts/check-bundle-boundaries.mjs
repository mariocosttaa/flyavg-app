// Fails the build when any file reachable from the portal entry carries admin code or strings.
// Walks the Vite manifest (static and dynamic imports) from each HTML entry.
import { readFileSync } from 'node:fs';
import path from 'node:path';

const DIST = path.resolve(import.meta.dirname, '../dist');
const manifest = JSON.parse(readFileSync(path.join(DIST, '.vite/manifest.json'), 'utf8'));

const ADMIN_SOURCE =
  /^(admin\/index\.html|src\/admin\/|src\/shared\/i18n\/locales\/[a-z]+\/admin\.json)/;

// Admin-only strings: minified identifiers do not survive the build, translated text does.
const adminMarkers = ['pt', 'en'].map((language) => {
  const file = path.resolve(
    import.meta.dirname,
    `../src/shared/i18n/locales/${language}/admin.json`,
  );
  return JSON.parse(readFileSync(file, 'utf8')).dashboard.title;
});

function graph(entry) {
  const sources = new Set();
  const files = new Set();
  const visit = (key) => {
    if (sources.has(key)) {
      return;
    }
    const chunk = manifest[key];
    if (!chunk) {
      throw new Error(`Manifest has no entry for ${key}`);
    }
    sources.add(key);
    files.add(chunk.file);
    for (const css of chunk.css ?? []) {
      files.add(css);
    }
    for (const next of [...(chunk.imports ?? []), ...(chunk.dynamicImports ?? [])]) {
      visit(next);
    }
  };
  visit(entry);
  return { sources, files };
}

const markersIn = (files) =>
  adminMarkers.filter((marker) =>
    [...files].some((file) => readFileSync(path.join(DIST, file), 'utf8').includes(marker)),
  );

const portal = graph('index.html');
const admin = graph('admin/index.html');
const leakedSources = [...portal.sources].filter((source) => ADMIN_SOURCE.test(source));
const leakedMarkers = markersIn(portal.files);
const adminMarkersFound = markersIn(admin.files);

// Positive control: if the markers are not found in admin either, the check proves nothing.
if (adminMarkersFound.length !== adminMarkers.length) {
  console.error('Bundle check is blind: admin markers not found in the admin graph.');
  process.exit(1);
}
if (leakedSources.length > 0 || leakedMarkers.length > 0) {
  console.error('Admin code reached the portal bundle:', { leakedSources, leakedMarkers });
  process.exit(1);
}
console.log(
  `Bundle boundaries OK: ${portal.files.size} portal files, ${admin.files.size} admin files, no admin code in portal.`,
);
