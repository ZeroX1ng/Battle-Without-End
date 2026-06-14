import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './transpileTsModule.mjs';

const thisDir = dirname(fileURLToPath(import.meta.url));
const defaultRoot = resolve(thisDir, '../..');
const packagedPublicDirs = ['sprites', 'fonts', 'sounds'];
const passthroughPublicDirs = ['fonts', 'sounds'];
const weaponIconTypes = new Set(['sword', 'axe', 'bow', 'crossbow', 'staff', 'sceptre', 'dagger', 'shield', 'tome']);
const weaponPositions = new Set(['onehand', 'twohand', 'offhand']);

export function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(3)} MB`;
}

export async function collectPackagedAssetPlan({ root = defaultRoot } = {}) {
  const registryEntries = readSpriteRegistry(root);
  const registryByKey = new Map(registryEntries.map((entry) => [entry.key, entry]));
  const spriteKeys = new Set();
  const missingDerivedKeys = new Set();

  const addKey = (key) => {
    if (!key) {
      return;
    }
    if (registryByKey.has(key)) {
      spriteKeys.add(key);
    } else {
      missingDerivedKeys.add(key);
    }
  };

  addStaticSourceSpriteKeys({ root, registryEntries, addKey });
  await addDataDerivedSpriteKeys({ root, registryByKey, addKey });

  const spriteEntries = [...spriteKeys]
    .sort((a, b) => a.localeCompare(b))
    .map((key) => registryByKey.get(key));

  const sourcePublicBytes = getDirectoryStats(resolve(root, 'public')).bytes;
  const sourceSpriteStats = getDirectoryStats(resolve(root, 'public/sprites'));
  const spriteStats = getPlannedSpriteStats(root, spriteEntries);
  const passthroughStats = passthroughPublicDirs.map((dir) => ({
    dir,
    ...getDirectoryStats(resolve(root, 'public', dir)),
  }));
  const passthroughBytes = passthroughStats.reduce((sum, stats) => sum + stats.bytes, 0);
  const totalBytes = spriteStats.bytes + passthroughBytes;

  return {
    publicDirs: packagedPublicDirs,
    registryEntries,
    spriteKeys: [...spriteKeys].sort((a, b) => a.localeCompare(b)),
    spriteEntries,
    missingDerivedKeys: [...missingDerivedKeys].sort((a, b) => a.localeCompare(b)),
    sourcePublicBytes,
    sourceSpriteBytes: sourceSpriteStats.bytes,
    sourceSpriteFiles: sourceSpriteStats.files,
    spriteBytes: spriteStats.bytes,
    spriteFiles: spriteStats.files,
    passthroughStats,
    passthroughBytes,
    totalBytes,
  };
}

export async function writePackagedPublicAssets({ root = defaultRoot, outDir = resolve(root, 'public-packaged') } = {}) {
  const plan = await collectPackagedAssetPlan({ root });
  assertSafeOutputDir({ root, outDir });

  if (plan.missingDerivedKeys.length > 0) {
    throw new Error(`Packaged sprite plan has missing derived keys: ${plan.missingDerivedKeys.join(', ')}`);
  }

  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  for (const entry of plan.spriteEntries) {
    const sourceDir = resolve(root, 'public/sprites', entry.dir);
    const targetDir = resolve(outDir, 'sprites', entry.dir);
    if (!existsSync(sourceDir)) {
      throw new Error(`Missing source sprite directory: ${relative(root, sourceDir)}`);
    }
    copySpriteDirectory(sourceDir, targetDir, entry.ext ?? 'png');
  }

  for (const dir of passthroughPublicDirs) {
    const sourceDir = resolve(root, 'public', dir);
    if (!existsSync(sourceDir)) {
      continue;
    }
    copyDirectory(sourceDir, resolve(outDir, dir));
  }

  const outputStats = getDirectoryStats(outDir);
  return {
    ...plan,
    outputDir: outDir,
    outputBytes: outputStats.bytes,
    outputFiles: outputStats.files,
  };
}

function readSpriteRegistry(root) {
  const source = readFileSync(resolve(root, 'src/core/utils/spriteRegistry.ts'), 'utf8');
  const entries = [];
  const entryRegex = /'([^']+)':\s*\{\s*dir:\s*'([^']+)'\s*,\s*frames:\s*(\d+)(?:\s*,\s*ext:\s*'([^']+)')?\s*\}/g;
  for (const match of source.matchAll(entryRegex)) {
    entries.push({
      key: match[1],
      dir: match[2],
      frames: Number(match[3]),
      ext: match[4] ?? 'png',
    });
  }
  return entries;
}

function addStaticSourceSpriteKeys({ root, registryEntries, addKey }) {
  const sourceFiles = walkFiles(resolve(root, 'src'))
    .filter((file) => /\.(ts|tsx)$/.test(file))
    .filter((file) => !file.replaceAll('\\', '/').endsWith('/src/core/utils/spriteRegistry.ts'));
  const sourceText = sourceFiles.map((file) => readFileSync(file, 'utf8')).join('\n');

  for (const entry of registryEntries) {
    if (sourceText.includes(`'${entry.key}'`) || sourceText.includes(`"${entry.key}"`)) {
      addKey(entry.key);
    }
  }

  // Detect template-literal prefixes (e.g. `buff_${name}`) and auto-add
  // all matching registry keys so dynamic lookups aren't missed by the
  // static string-scan alone.  The guard validates that every
  // template-prefixed key in the registry is covered (or explicitly
  // excluded) and rejects missingDerivedKeys.
  const templatePrefixes = new Set();
  const templateRe = /`([a-z]+_)\$\{/g;
  for (const m of sourceText.matchAll(templateRe)) {
    templatePrefixes.add(m[1]);
  }
  for (const prefix of templatePrefixes) {
    for (const entry of registryEntries) {
      if (entry.key.startsWith(prefix)) {
        addKey(entry.key);
      }
    }
  }
}

async function addDataDerivedSpriteKeys({ root, registryByKey, addKey }) {
  addKey('mc_mode');
  for (const key of registryByKey.keys()) {
    if (key.startsWith('buff_')) {
      addKey(key);
    }
  }

  const [{ SkillDataList }, { EquipmentList }, { PetDataList }, petSkillModule] = await Promise.all([
    importSourceModule(root, 'src/core/data/skillData.ts'),
    importSourceModule(root, 'src/core/data/equipmentData.ts'),
    importSourceModule(root, 'src/core/data/petData.ts'),
    importSourceModule(root, 'src/core/data/petSkillData.ts'),
  ]);

  for (const skill of SkillDataList ?? []) {
    addKey(`mc_${normalizeSpriteName(skill.name)}`);
  }

  for (const equip of EquipmentList ?? []) {
    addKey(getEquipmentSpriteName(equip));
  }

  for (const pet of PetDataList ?? []) {
    const rawName = String(pet?.mc ?? '').trim();
    if (rawName) {
      addKey(rawName.startsWith('pet_') ? rawName : `pet_${rawName}`);
    }
  }

  const petSkills = new Set(petSkillModule.PetSkillDataList ?? []);
  for (const skill of Object.values(petSkillModule.PetSkillDataMap ?? {})) {
    petSkills.add(skill);
  }
  for (const skill of petSkills) {
    addKey(`pSkill_${normalizeSpriteName(skill.name)}`);
  }
}

async function importSourceModule(root, relativePath) {
  const outRoot = mkdtempSync(join(tmpdir(), 'bwe-packaged-ts-'));
  try {
    return await importTsModule({
      root,
      entry: resolve(root, relativePath),
      outRoot,
    });
  } finally {
    await cleanupTranspileOutput(outRoot);
  }
}

function normalizeSpriteName(value) {
  return String(value ?? '').trim().toLowerCase().replace(/\s+/g, '_');
}

function getEquipmentSpriteName(equip) {
  if (!equip) {
    return 'mc_mode';
  }

  const type = String(equip.type ?? '').trim();
  const position = String(equip.position ?? '').trim();
  if (!type) {
    return 'mc_mode';
  }
  if (equip.category || weaponIconTypes.has(type) || weaponPositions.has(position)) {
    return `mc_${type}`;
  }
  return position ? `mc_${position}_${type}` : `mc_${type}`;
}

function getPlannedSpriteStats(root, spriteEntries) {
  const sourceRoot = resolve(root, 'public/sprites');
  let bytes = 0;
  let files = 0;
  for (const entry of spriteEntries) {
    const stats = getSpriteFileStats(resolve(sourceRoot, entry.dir), entry.ext ?? 'png');
    bytes += stats.bytes;
    files += stats.files;
  }
  return { bytes, files };
}

function getSpriteFileStats(dir, ext) {
  const files = walkFiles(dir).filter((file) => file.endsWith(`.${ext}`));
  return {
    bytes: files.reduce((sum, file) => sum + statSync(file).size, 0),
    files: files.length,
  };
}

function getDirectoryStats(dir) {
  const files = walkFiles(dir);
  return {
    bytes: files.reduce((sum, file) => sum + statSync(file).size, 0),
    files: files.length,
  };
}

function walkFiles(dir) {
  if (!existsSync(dir)) {
    return [];
  }

  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const entryPath = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(entryPath));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }
  return files;
}

function copyDirectory(sourceDir, targetDir) {
  mkdirSync(targetDir, { recursive: true });
  for (const entry of readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = resolve(sourceDir, entry.name);
    const targetPath = resolve(targetDir, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
    } else if (entry.isFile()) {
      mkdirSync(dirname(targetPath), { recursive: true });
      copyFileSync(sourcePath, targetPath);
    }
  }
}

function copySpriteDirectory(sourceDir, targetDir, ext) {
  mkdirSync(targetDir, { recursive: true });
  for (const entry of readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = resolve(sourceDir, entry.name);
    const targetPath = resolve(targetDir, entry.name);
    if (entry.isDirectory()) {
      copySpriteDirectory(sourcePath, targetPath, ext);
    } else if (entry.isFile() && entry.name.endsWith(`.${ext}`)) {
      mkdirSync(dirname(targetPath), { recursive: true });
      copyFileSync(sourcePath, targetPath);
    }
  }
}

function assertSafeOutputDir({ root, outDir }) {
  const resolvedRoot = resolve(root);
  const resolvedOutDir = resolve(outDir);
  const resolvedPublic = resolve(root, 'public');
  const resolvedTemp = resolve(tmpdir());
  const defaultOutDir = resolve(root, 'public-packaged');
  const isDefaultOutDir = resolvedOutDir === defaultOutDir;
  const isTempOutDir = resolvedOutDir.startsWith(`${resolvedTemp}${sep}`);

  if (resolvedOutDir === resolvedRoot || resolvedOutDir === resolvedPublic) {
    throw new Error(`Refusing to clear unsafe output directory: ${resolvedOutDir}`);
  }
  if (!isDefaultOutDir && !isTempOutDir) {
    throw new Error(`Packaged public output must be public-packaged or a temp dir: ${resolvedOutDir}`);
  }
  if (basename(resolvedOutDir) === 'public') {
    throw new Error(`Refusing to write packaged assets into a directory named public: ${resolvedOutDir}`);
  }
}
