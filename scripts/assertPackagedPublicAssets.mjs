import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

function fail(message) {
  failures.push(message);
}

function readText(relativePath) {
  return readFileSync(resolve(root, relativePath), 'utf8');
}

function hasPath(relativePath) {
  return existsSync(resolve(root, relativePath));
}

function walkFiles(dir) {
  if (!existsSync(dir)) {
    return [];
  }

  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const entryPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(entryPath));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }
  return files;
}

const packageJson = JSON.parse(readText('package.json'));
const scripts = packageJson.scripts ?? {};
const mapWindow = readText('src/components/windows/MapWindow.tsx');
const spriteImage = readText('src/components/shared/SpriteImage.tsx');
const spriteRegistry = readText('src/core/utils/spriteRegistry.ts');

function assertIncludes(source, needle, message) {
  if (!source.includes(needle)) {
    fail(message);
  }
}

function assertNotIncludes(source, needle, message) {
  if (source.includes(needle)) {
    fail(message);
  }
}

if (scripts['assets:package'] !== 'node scripts/generatePackagedPublicAssets.mjs') {
  fail('package.json must define assets:package for the packaged public asset pass.');
}
if (scripts['assert:packaged-assets'] !== 'node scripts/assertPackagedPublicAssets.mjs') {
  fail('package.json must define assert:packaged-assets.');
}
if (!String(scripts.build ?? '').startsWith('npm run assets:package && ')) {
  fail('package.json build must run assets:package before typecheck and vite build.');
}
if (!String(scripts.preview ?? '').startsWith('npm run assets:package && ')) {
  fail('package.json preview must run assets:package before vite preview.');
}

assertIncludes(
  mapWindow,
  "import { MapBackground } from '../shared/MapBackground'",
  'MapWindow must render the AS3 map background through the split MapBackground component.',
);
assertIncludes(
  mapWindow,
  '<MapBackground',
  'MapWindow must mount the split map background instead of the flattened map_mc sprite.',
);
assertNotIncludes(
  mapWindow,
  'name="map_mc"',
  'MapWindow must not render the flattened DefineSprite_135_map_mc sequence.',
);
assertIncludes(
  spriteImage,
  "const ext = entry?.ext ?? 'png'",
  'SpriteImage must read the optional sprite registry extension.',
);
assertIncludes(
  spriteImage,
  '${frameIndex}.${ext}',
  'SpriteImage must build frame URLs with the registry extension.',
);
assertIncludes(
  spriteRegistry,
  'export interface SpriteRegistryEntry',
  'spriteRegistry must expose a typed entry that supports optional frame extensions.',
);
assertIncludes(
  spriteRegistry,
  "'DefineSprite_134': { dir: 'DefineSprite_134', frames: 200, ext: 'webp' }",
  'DefineSprite_134 must use optimized WebP frames for the packaged map animation.',
);

const viteConfig = readText('vite.config.mjs');
if (
  !viteConfig.includes('publicDir') ||
  !viteConfig.includes('public-packaged') ||
  !viteConfig.includes("command === 'build'") ||
  !viteConfig.includes('isPreview')
) {
  fail('vite.config.mjs must use public-packaged as publicDir for build and preview.');
}

if (!readText('.gitignore').includes('public-packaged/')) {
  fail('.gitignore must ignore the generated public-packaged directory.');
}

const helperPath = resolve(root, 'scripts/lib/packagedAssets.mjs');
const generatorPath = resolve(root, 'scripts/generatePackagedPublicAssets.mjs');
if (!existsSync(helperPath)) {
  fail('scripts/lib/packagedAssets.mjs is missing.');
}
if (!existsSync(generatorPath)) {
  fail('scripts/generatePackagedPublicAssets.mjs is missing.');
}

if (existsSync(helperPath)) {
  const helper = await import(pathToFileURL(helperPath).href);
  const plan = await helper.collectPackagedAssetPlan({ root });
  const spriteKeys = new Set(plan.spriteKeys ?? plan.spriteEntries?.map((entry) => entry.key) ?? []);
  const registrySize = plan.registryEntries?.length ?? 0;

  if (spriteKeys.size === 0) {
    fail('packaged asset plan did not select any sprite keys.');
  }
  if (registrySize > 0 && spriteKeys.size >= registrySize) {
    fail(`packaged asset plan selected every sprite key (${spriteKeys.size}/${registrySize}); it should be a strict subset.`);
  }

  const missingKeys = plan.missingDerivedKeys ?? [];
  if (missingKeys.length > 0) {
    fail(`packaged asset plan has missing derived keys (${missingKeys.join(', ')}). Add them to the registry or fix the data-derived sprite-name derivation.`);
  }

  for (const key of [
    'after_item',
    'before_item',
    'buff_burn',
    'button_map',
    'button_save',
    'doubleCircle',
    'DefineSprite_128',
    'DefineSprite_134',
    'map_icon',
    'mc_mode',
    'mc_smash',
    'pet_fox',
    'pSkill_fireball',
  ]) {
    if (!spriteKeys.has(key)) {
      fail(`packaged asset plan is missing currently used sprite key: ${key}`);
    }
  }

  for (const key of [
    'DefineSprite_130',
    'DefineSprite_131',
    'DefineSprite_133',
    'map_mc',
    'brand_mc',
    'button_gamble',
    'caption_mc',
    'people_use1',
    'people_use2',
  ]) {
    if (spriteKeys.has(key)) {
      fail(`packaged asset plan still includes unused heavy sprite key: ${key}`);
    }
  }

  const publicDirs = new Set(plan.publicDirs ?? []);
  for (const dir of ['fonts', 'sounds', 'sprites']) {
    if (!publicDirs.has(dir)) {
      fail(`packaged asset plan must include public/${dir}.`);
    }
  }
  for (const dir of ['buttons', 'frames', 'images', 'morphshapes', 'movies', 'shapes']) {
    if (publicDirs.has(dir)) {
      fail(`packaged asset plan should not include unused public/${dir}.`);
    }
  }

  const tempRoot = mkdtempSync(join(tmpdir(), 'bwe-packaged-assets-'));
  try {
    const outDir = join(tempRoot, 'public-packaged');
    const summary = await helper.writePackagedPublicAssets({ root, outDir });
    const sourceSpriteFiles = walkFiles(resolve(root, 'public/sprites'));
    const packagedSpriteFiles = walkFiles(join(outDir, 'sprites'));

    if (!hasPath('public/sprites/DefineSprite_131/1.png')) {
      fail('source public sprites were unexpectedly changed; DefineSprite_131 must remain in public.');
    }
    if (!hasPath('public/sprites/DefineSprite_134/1.webp')) {
      fail('source public sprites are missing optimized DefineSprite_134 WebP frames.');
    }
    if (existsSync(join(outDir, 'sprites/DefineSprite_135_map_mc'))) {
      fail('packaged output still contains the flattened map_mc sprite sequence.');
    }
    if (!existsSync(join(outDir, 'sprites/DefineSprite_128/1.png'))) {
      fail('packaged output is missing the split map base sprite.');
    }
    if (!existsSync(join(outDir, 'sprites/DefineSprite_134/50.webp'))) {
      fail('packaged output is missing optimized DefineSprite_134 WebP frames.');
    }
    if (existsSync(join(outDir, 'sprites/DefineSprite_131'))) {
      fail('packaged output should not copy upstream DefineSprite_131; DefineSprite_134 is the runtime vortex sequence.');
    }
    if (existsSync(join(outDir, 'sprites/DefineSprite_134/50.png'))) {
      fail('packaged output should not copy PNG frames for WebP-optimized DefineSprite_134.');
    }
    if (existsSync(join(outDir, 'sprites/DefineSprite_291_brand_mc'))) {
      fail('packaged output still contains unused brand_mc frames.');
    }
    for (const dir of ['buttons', 'frames', 'images', 'morphshapes', 'movies', 'shapes']) {
      if (existsSync(join(outDir, dir))) {
        fail(`packaged output should not contain public/${dir}.`);
      }
    }
    if (!existsSync(join(outDir, 'fonts'))) {
      fail('packaged output is missing fonts.');
    }
    if (!existsSync(join(outDir, 'sounds'))) {
      fail('packaged output is missing sounds.');
    }
    if (packagedSpriteFiles.length >= sourceSpriteFiles.length) {
      fail(`packaged sprites should be fewer than source sprites (${packagedSpriteFiles.length}/${sourceSpriteFiles.length}).`);
    }
    if ((summary.totalBytes ?? 0) > 45 * 1024 * 1024) {
      fail(`packaged public assets are too large: ${summary.totalBytes} bytes.`);
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

if (failures.length > 0) {
  console.error('Packaged public asset guard failed:');
  for (const message of failures) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

console.log('Packaged public asset guard passed.');
