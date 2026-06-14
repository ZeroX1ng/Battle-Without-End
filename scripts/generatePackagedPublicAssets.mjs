import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatBytes, writePackagedPublicAssets } from './lib/packagedAssets.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const summary = await writePackagedPublicAssets({ root });
const excludedSpriteCount = summary.registryEntries.length - summary.spriteEntries.length;

console.log('Generated packaged public assets.');
console.log(`- output: ${summary.outputDir}`);
console.log(`- sprites: ${summary.spriteEntries.length}/${summary.registryEntries.length} keys, ${summary.spriteFiles} files, ${formatBytes(summary.spriteBytes)}`);
console.log(`- excluded sprites: ${excludedSpriteCount} keys`);
console.log(`- passthrough: ${formatBytes(summary.passthroughBytes)} (${summary.passthroughStats.map((item) => item.dir).join(', ')})`);
console.log(`- total: ${formatBytes(summary.outputBytes)} from source public ${formatBytes(summary.sourcePublicBytes)}`);
