import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

export async function cleanupTranspileOutput(outRoot) {
  await rm(outRoot, { recursive: true, force: true });
}

export async function importTsModule({ entry, root, srcRoot = join(root, 'src'), outRoot }) {
  const seen = new Set();

  async function transpileFile(filePath) {
    const normalized = resolve(filePath);
    if (seen.has(normalized) || extname(normalized) !== '.ts') {
      return;
    }
    seen.add(normalized);

    const source = await readFile(normalized, 'utf8');
    const importRegex = /from\s+['"](\.{1,2}\/[^'"]+)['"]/g;
    const imports = [...source.matchAll(importRegex)].map(match => match[1]);
    const patchedSource = source.replace(
      importRegex,
      (match, specifier) => `${match.slice(0, -specifier.length - 1)}${specifier}.js'`
    );

    const output = ts.transpileModule(patchedSource, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
        importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
      },
    }).outputText;

    const outPath = join(outRoot, relative(srcRoot, normalized)).replace(/\.ts$/, '.js');
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, output, 'utf8');

    for (const specifier of imports) {
      await transpileFile(resolve(dirname(normalized), `${specifier}.ts`));
    }
  }

  await cleanupTranspileOutput(outRoot);
  await transpileFile(entry);
  return import(pathToFileURL(join(outRoot, relative(srcRoot, entry)).replace(/\.ts$/, '.js')));
}
