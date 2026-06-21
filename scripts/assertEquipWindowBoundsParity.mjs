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

function assertOrder(source, before, after, message) {
  const beforeIndex = source.indexOf(before);
  const afterIndex = source.indexOf(after);
  if (beforeIndex === -1 || afterIndex === -1 || beforeIndex > afterIndex) {
    throw new Error(message);
  }
}

const equipWindow = read('src/components/windows/EquipWindow.tsx');

assertNotIncludes(
  equipWindow,
  'EQUIP_WINDOW_CONTENT_MAX_HEIGHT',
  'EquipWindow must not cap its scroll region below the available right-panel height.',
);
assertIncludes(
  equipWindow,
  'data-bwe-equip-scroll-region',
  'EquipWindow must expose a bounded internal scroll region for browser-visible bounds smoke.',
);
assertIncludes(
  equipWindow,
  'flex: 1',
  'EquipWindow internal scroll region must flex within the right-panel content height.',
);
assertIncludes(
  equipWindow,
  'minHeight: 0',
  'EquipWindow internal scroll region must be allowed to shrink inside the fixed panel instead of forcing page scroll.',
);
assertIncludes(
  equipWindow,
  "minHeight: '100%'",
  'EquipWindow content column must fill the available scroll height so lower detail can reach the panel bottom.',
);
assertIncludes(
  equipWindow,
  "overflowY: 'auto'",
  'EquipWindow bounded content must be internally scrollable.',
);
assertIncludes(
  equipWindow,
  'minHeight: 190',
  'EquipWindow detail/stat panel must keep a usable minimum height in small viewports.',
);
assertIncludes(
  equipWindow,
  'flexShrink: 0',
  'EquipWindow action buttons must not shrink out of view at the bottom of the detail panel.',
);
assertOrder(
  equipWindow,
  'data-bwe-equip-scroll-region',
  'data-bwe-equip-detail-panel',
  'EquipWindow detail/stat panel must live inside the bounded internal scroll region.',
);

console.log('EquipWindow bounds parity checks passed.');
