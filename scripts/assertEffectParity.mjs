import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

function read(relativePath) {
  const filePath = join(root, relativePath);
  if (!existsSync(filePath)) {
    throw new Error(`Missing ${relativePath}`);
  }
  return readFileSync(filePath, 'utf8');
}

function assertIncludes(source, needle, message) {
  if (!source.includes(needle)) {
    throw new Error(message);
  }
}

function assertNotIncludes(source, needle, message) {
  if (source.includes(needle)) {
    throw new Error(message);
  }
}

const effects = read('src/utils/effects.tsx');
const effectCss = read('src/styles/effects.css');
const packageJson = read('package.json');

assertIncludes(effects, 'const DEFAULT_FADE_FRAME_COUNT = 10', 'fadeIn/fadeOut must keep AS3 default count=10 frame timing');
assertIncludes(effects, 'const HIDE_MESSAGE_FADE_FRAME_COUNT = 30', 'HideMessageThread must trigger the AS3 30-frame wrapper fade-out');
assertIncludes(effects, 'const HIDE_MESSAGE_FADE_THRESHOLD = 50', 'HideMessageThread must start wrapper fade-out below 50 particles');
assertIncludes(effects, 'const HIDE_MESSAGE_FINALIZE_THRESHOLD = 20', 'HideMessageThread must finalize below or at 20 particles');
assertIncludes(effects, 'const HIDE_MESSAGE_BLUR = 4', 'HideMessageThread must apply the AS3 BlurFilter(4,4) trail');
assertIncludes(effects, 'requestFrameFade', 'fadeIn/fadeOut must be driven by requestAnimationFrame frame counts, not fixed milliseconds');
assertIncludes(effects, 'restoreInteractivity', 'fadeOut must restore Sprite-style mouse interaction after completion');
assertIncludes(effects, 'createHideMessageParticle', 'HideMessageParticle constructor behavior must be mapped to React helpers');
assertIncludes(effects, 'stepHideMessageParticles', 'HideMessageThread.step particle update/removal must be mapped explicitly');
assertIncludes(effects, 'sampleParticlesFromImageData', 'HideMessageThread.run bitmap sampling must be mapped explicitly');
assertIncludes(effects, 'if (!active && !visible) return null', 'Canvas effects must stay mounted on the active frame so refs can initialize');
assertIncludes(effects, 'ctx2.filter = `blur(${HIDE_MESSAGE_BLUR}px)`', 'TextDisperse must apply the AS3 blur trail every frame');
assertIncludes(effects, 'ctx.filter = `blur(${HIDE_MESSAGE_BLUR}px)`', 'ExplodeOut must apply the AS3 blur trail every frame');
assertIncludes(effects, 'alive < HIDE_MESSAGE_FADE_THRESHOLD', 'Canvas effects must start fade-out at the AS3 particle threshold');
assertIncludes(effects, 'alive > HIDE_MESSAGE_FINALIZE_THRESHOLD', 'Canvas effects must keep running until the AS3 finalize threshold');
assertIncludes(effectCss, 'effect-gradient-in-expand 500ms steps(30, end)', 'gradientIn CSS must preserve AS3 count=30 stepped frame timing');
assertIncludes(effectCss, 'effect-gradient-outside-shrink 500ms steps(var(--gradient-count), end)', 'gradientInOutsideFirst CSS must preserve caller-provided stepped frame timing');
assertIncludes(packageJson, '"assert:effects": "node scripts/assertEffectParity.mjs"', 'package.json must expose the effect parity guard');

assertNotIncludes(effects, 'life:', 'HideMessageParticle parity must not add a non-AS3 particle life clock');
assertNotIncludes(effects, 'Math.random() * 360', 'explodeOut fallback must not invent random colors outside AS3 bitmap sampling');
assertNotIncludes(effects, 'html2canvas(document.body)', 'explodeOut must not depend on full-page screenshots instead of target bitmap data');

console.log('Effect parity checks passed.');
