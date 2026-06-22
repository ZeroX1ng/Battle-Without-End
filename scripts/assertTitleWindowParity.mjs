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

const titleWindow = read('src/components/panels/TitleWindow.tsx');
const gameContext = read('src/state/GameContext.tsx');

assertIncludes(titleWindow, 'useInfoWindow', 'TitleWindow must use the global ItemInfoWindow hover chain');
assertIncludes(titleWindow, 'showItemInfo(getTitleDescription(title))', 'TitleCell must show AS3 Title.getDescription() content on hover');
assertIncludes(titleWindow, 'hideItemInfo', 'TitleCell must hide title details on mouse leave');
assertIncludes(titleWindow, 'data-bwe-title-list', 'TitleWindow must expose the widened list for browser smoke');
assertIncludes(titleWindow, 'data-bwe-title-row', 'TitleCell must expose widened row rects for browser smoke');
assertIncludes(titleWindow, 'maxHeight="100%"', 'TitleWindow must use the available right-panel height');
assertIncludes(titleWindow, "width: '100%'", 'TitleCell must fill the rewritten right-panel width');
assertIncludes(titleWindow, 'boxSizing: \'border-box\'', 'TitleCell full-width rows must include padding/border in their measured width');
assertNotIncludes(titleWindow, 'width: 200', 'TitleCell must not keep the old narrow AS3 cell width in the widened React panel');
assertNotIncludes(titleWindow, 'maxHeight={360}', 'TitleWindow must not keep the old short list height cap');
assertIncludes(titleWindow, 'minHeight: 50', 'TitleCell must preserve the original 50px cell height');
assertIncludes(titleWindow, 'title.realName.toUpperCase()', 'TitleCell must display the original uppercase realName text');
assertIncludes(titleWindow, 'rgba(200, 200, 200, 0.8)', 'Unavailable titles must keep the original greyed cell behavior');
assertIncludes(titleWindow, 'rgba(0, 0, 0, 0.8)', 'Unavailable titles must darken text like the AS3 color transform');
assertIncludes(titleWindow, "dispatch({ type: 'TITLE_SET'", 'Available title cells must select the title on click');
assertIncludes(titleWindow, 'cursor: title.isGot ? \'pointer\' : \'default\'', 'Unavailable title cells must not be selectable');
assertNotIncludes(titleWindow, 'title={`', 'TitleWindow must not rely on native browser title tooltips for the info chain');
assertNotIncludes(titleWindow, 'title="', 'TitleWindow must not rely on native browser title tooltips for the info chain');

assertIncludes(gameContext, "case 'TITLE_SET'", 'TITLE_SET reducer case must exist');
assertIncludes(gameContext, 'withBattlePlayer(state, setTitle(state.player, action.title))', 'TITLE_SET must keep active Battle playerState in sync');

console.log('TitleWindow parity checks passed.');
