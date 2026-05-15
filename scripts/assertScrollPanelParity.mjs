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

const scrollPanel = read('src/components/common/ScrollPanel.tsx');

assertIncludes(scrollPanel, 'e.preventDefault()', 'ScrollPanel must trap wheel scrolling like MouseWheelTrap');
assertIncludes(scrollPanel, 'e.stopPropagation()', 'ScrollPanel must stop wheel bubbling inside the game stage');
assertIncludes(scrollPanel, 'const flashDelta = -e.deltaY', 'ScrollPanel must normalize browser deltaY to Flash MouseEvent.delta direction');
assertIncludes(scrollPanel, 'const delta = flashDelta * 5', 'ScrollPanel wheel movement must use the AS3 delta * 5 step');
assertNotIncludes(scrollPanel, 'e.deltaY * 3', 'ScrollPanel must not keep the old browser-delta scrolling step');

assertIncludes(scrollPanel, 'Math.max(50, height * height / contentH)', 'ScrollPanel scrollbar thumb must keep the AS3 minimum length of 50');
assertIncludes(scrollPanel, 'width: 20', 'ScrollPanel scrollbar hit area must match MyScrollBar transparent 20px track');
assertIncludes(scrollPanel, 'right: -10', 'ScrollPanel scrollbar hit area must be centered around the 3px thumb like MyScrollBar');
assertIncludes(scrollPanel, 'const nextTop = localY - sbHeight / 2', 'ScrollPanel scrollbar mouse down must jump the thumb center to the pointer');
assertIncludes(scrollPanel, 'scrollYRef.current = -pct * maxScroll', 'ScrollPanel scrollbar drag must drive content position through percent');
assertIncludes(scrollPanel, 'width: 3', 'ScrollPanel visible thumb must match MyScrollBar drawRoundRect width');

console.log('ScrollPanel parity checks passed.');
