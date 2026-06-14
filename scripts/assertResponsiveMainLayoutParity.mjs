import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

let failed = false;

function assert(condition, message) {
  if (condition) {
    console.log(`PASS ${message}`);
  } else {
    failed = true;
    console.error(`FAIL ${message}`);
  }
}

const packageJson = JSON.parse(read('package.json'));
const gameLayout = read('src/components/layout/GameLayout.tsx');
const mainScene = read('src/components/scenes/MainScene.tsx');
const overlayStart = mainScene.indexOf('{overlay && (');
const primaryMainScene = overlayStart === -1 ? mainScene : mainScene.slice(0, overlayStart);
const layoutCss = fs.existsSync(path.join(root, 'src/styles/layout.css'))
  ? read('src/styles/layout.css')
  : '';
const mainSceneCss = fs.existsSync(path.join(root, 'src/styles/main-scene.css'))
  ? read('src/styles/main-scene.css')
  : '';

assert(
  packageJson.scripts?.['assert:responsive-layout'] === 'node scripts/assertResponsiveMainLayoutParity.mjs',
  'package.json exposes assert:responsive-layout'
);

assert(
  !/transform:\s*`translate\(-50%, -50%\) scale\(\$\{scale\}\)`/.test(gameLayout),
  'GameLayout no longer uses Flash-style whole-stage transform scaling'
);

assert(
  !/\bwidth:\s*800\b/.test(gameLayout) && !/\bheight:\s*600\b/.test(gameLayout),
  'GameLayout no longer hard-codes the root stage to 800x600'
);

assert(
  /className="game-layout"/.test(gameLayout) && /className="game-shell"/.test(gameLayout),
  'GameLayout delegates viewport sizing to semantic layout classes'
);

assert(
  /100dvw/.test(layoutCss) && /100dvh/.test(layoutCss),
  'layout CSS fills the dynamic browser viewport'
);

assert(
  /@media\s*\(max-width:\s*899px\)/.test(mainSceneCss) &&
    /@media\s*\(max-width:\s*639px\)/.test(mainSceneCss) &&
    /@media\s*\(orientation:\s*landscape\)\s*and\s*\(max-height:\s*520px\)/.test(mainSceneCss),
  'MainScene CSS defines tablet, mobile portrait, and mobile landscape breakpoints'
);

assert(
  /main-scene__other/.test(mainScene) &&
    /main-scene__battle/.test(mainScene) &&
    /main-scene__log/.test(mainScene),
  'MainScene groups panels into responsive semantic regions'
);

assert(
  !/position:\s*'absolute'/.test(primaryMainScene),
  'MainScene no longer relies on fixed absolute AS3 coordinates for primary layout'
);

if (failed) {
  process.exit(1);
}
