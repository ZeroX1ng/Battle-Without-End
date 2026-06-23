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
const infoWindow = read('src/components/common/InfoWindow.tsx');
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
  /DESIGN_STAGE_WIDTH\s*=\s*1280/.test(gameLayout) &&
    /DESIGN_STAGE_HEIGHT\s*=\s*720/.test(gameLayout),
  'GameLayout declares the AS3-adjacent 1280x720 design stage'
);

assert(
  /calculateStageMetrics/.test(gameLayout) &&
    /--bwe-stage-scale/.test(gameLayout) &&
    /--bwe-stage-width/.test(gameLayout) &&
    /--bwe-stage-height/.test(gameLayout) &&
    /data-bwe-stage-frame/.test(gameLayout) &&
    /data-bwe-stage-shell/.test(gameLayout),
  'GameLayout exposes measured adaptive stage metrics and stable DOM hooks'
);

assert(
  /className="game-layout"/.test(gameLayout) &&
    /className="game-stage-frame"/.test(gameLayout) &&
    /className="game-shell"/.test(gameLayout),
  'GameLayout renders a viewport frame around the adaptive game shell'
);

assert(
  /100dvw/.test(layoutCss) && /100dvh/.test(layoutCss),
  'layout CSS fills the dynamic browser viewport'
);

assert(
  /\.game-stage-frame/.test(layoutCss) &&
    /width:\s*calc\(var\(--bwe-stage-width\)\s*\*\s*var\(--bwe-stage-scale\)\)/.test(layoutCss) &&
    /height:\s*calc\(var\(--bwe-stage-height\)\s*\*\s*var\(--bwe-stage-scale\)\)/.test(layoutCss),
  'layout CSS sizes the visual frame from the adaptive stage dimensions and measured scale'
);

assert(
  /width:\s*var\(--bwe-stage-width\)/.test(layoutCss) &&
    /height:\s*var\(--bwe-stage-height\)/.test(layoutCss) &&
    /transform:\s*scale\(var\(--bwe-stage-scale\)\)/.test(layoutCss) &&
    /transform-origin:\s*top left/.test(layoutCss),
  'game shell keeps design pixels and scales visually as one stage'
);

assert(
  !/@media\s*\(max-width:\s*899px\)/.test(mainSceneCss) &&
    !/@media\s*\(max-width:\s*639px\)/.test(mainSceneCss) &&
    !/@media\s*\(orientation:\s*landscape\)\s*and\s*\(max-height:\s*520px\)/.test(mainSceneCss),
  'MainScene no longer changes its primary layout by viewport breakpoints'
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

assert(
  /getTooltipStageScale/.test(infoWindow) &&
    /visualScale/.test(infoWindow) &&
    /transform:\s*`scale\(\$\{visualScale\}\)`/.test(infoWindow),
  'InfoWindow scales out-of-stage tooltips with the visual game stage'
);

if (failed) {
  process.exit(1);
}
