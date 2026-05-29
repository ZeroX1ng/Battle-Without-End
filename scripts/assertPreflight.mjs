import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { projectRoot, resolveAs3Path, resolveAs3Root } from './lib/as3Source.mjs';

const requiredNodeMajor = 20;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function countFiles(dir) {
  let count = 0;
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      count += countFiles(fullPath);
    } else {
      count += 1;
    }
  }
  return count;
}

const nodeMajor = Number(process.versions.node.split('.')[0]);
assert(
  nodeMajor >= requiredNodeMajor,
  `Node ${requiredNodeMajor}+ is required for BWE tooling. Current version: ${process.version}`
);

const as3Root = resolveAs3Root();
const requiredAs3Paths = [
  'scripts/iData/Battle.as',
  'scripts/iGlobal/Player.as',
  'scripts/iGlobal/Global.as',
  'scripts/iData/RaceList.as',
  'scripts/iData/iMap/MapList.as',
  'scripts/iData/iSkill/SkillDataList.as',
  'scripts/iData/iItem/Equipment.as',
  'scripts/iData/iMonster/MonsterList.as',
  'scripts/iData/iPlayer/TitleList.as',
  'sprites',
  'buttons',
  'frames',
  'morphshapes',
  'movies',
];

for (const relativePath of requiredAs3Paths) {
  assert(
    existsSync(resolveAs3Path(relativePath)),
    `Missing AS3 reference path: ${relativePath}`
  );
}

const requiredProjectPaths = [
  'package.json',
  'src',
  'scripts',
  'public',
  'docs/ai/00-working-rules.md',
  'docs/parity/manifest.md',
  'reference/as3/BOE-O',
];

for (const relativePath of requiredProjectPaths) {
  assert(
    existsSync(join(projectRoot, relativePath)),
    `Missing BWE project path: ${relativePath}`
  );
}

console.log(`Preflight passed.`);
console.log(`Node: ${process.version}`);
console.log(`BWE root: ${projectRoot}`);
console.log(`AS3 root: ${as3Root}`);
console.log(`AS3 files: ${countFiles(as3Root)}`);
