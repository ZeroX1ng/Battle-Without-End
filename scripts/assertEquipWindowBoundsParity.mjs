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

function assertOrder(source, before, after, message) {
  const beforeIndex = source.indexOf(before);
  const afterIndex = source.indexOf(after);
  if (beforeIndex === -1 || afterIndex === -1 || beforeIndex > afterIndex) {
    throw new Error(message);
  }
}

const equipWindow = read('src/components/windows/EquipWindow.tsx');

assertIncludes(
  equipWindow,
  'EQUIP_WINDOW_CONTENT_MAX_HEIGHT',
  'EquipWindow must define an explicit AS3-style bounded content height for its internal scroll area.',
);
assertIncludes(
  equipWindow,
  'data-bwe-equip-scroll-region',
  'EquipWindow must expose a bounded internal scroll region for browser-visible bounds smoke.',
);
assertIncludes(
  equipWindow,
  'maxHeight: EQUIP_WINDOW_CONTENT_MAX_HEIGHT',
  'EquipWindow internal scroll region must cap content height instead of relying on page scroll.',
);
assertIncludes(
  equipWindow,
  "overflowY: 'auto'",
  'EquipWindow bounded content must be internally scrollable.',
);
assertIncludes(
  equipWindow,
  'minHeight: 180',
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
