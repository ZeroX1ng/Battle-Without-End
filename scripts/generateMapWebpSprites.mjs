import { mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const quality = Number(process.env.BWE_MAP_WEBP_QUALITY ?? '0.9');
const targets = ['DefineSprite_134'];

function frameNumber(name) {
  return Number(name.slice(0, -extname(name).length));
}

function getPngFrames(dir) {
  return readdirSync(dir)
    .filter((file) => file.endsWith('.png'))
    .sort((a, b) => frameNumber(a) - frameNumber(b));
}

function clearOldWebp(dir) {
  for (const file of readdirSync(dir)) {
    if (file.endsWith('.webp')) {
      unlinkSync(join(dir, file));
    }
  }
}

function toDataUrl(bytes) {
  return `data:image/png;base64,${bytes.toString('base64')}`;
}

async function convertFrame(page, sourceBytes) {
  return page.evaluate(
    async ({ dataUrl, qualityValue }) => {
      const image = new Image();
      image.src = dataUrl;
      await image.decode();

      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas 2D context is unavailable.');
      }
      ctx.drawImage(image, 0, 0);
      const webpUrl = canvas.toDataURL('image/webp', qualityValue);
      if (!webpUrl.startsWith('data:image/webp;base64,')) {
        throw new Error('Browser did not return WebP output.');
      }
      return webpUrl.slice('data:image/webp;base64,'.length);
    },
    { dataUrl: toDataUrl(sourceBytes), qualityValue: quality },
  );
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let totalPngBytes = 0;
  let totalWebpBytes = 0;

  try {
    for (const target of targets) {
      const dir = resolve(root, 'public', 'sprites', target);
      mkdirSync(dir, { recursive: true });
      clearOldWebp(dir);

      const pngFrames = getPngFrames(dir);
      let pngBytes = 0;
      let webpBytes = 0;

      for (const frame of pngFrames) {
        const source = readFileSync(join(dir, frame));
        pngBytes += source.length;
        const webpBase64 = await convertFrame(page, source);
        const webp = Buffer.from(webpBase64, 'base64');
        const outName = `${frameNumber(frame)}.webp`;
        writeFileSync(join(dir, outName), webp);
        webpBytes += webp.length;
      }

      totalPngBytes += pngBytes;
      totalWebpBytes += webpBytes;
      console.log(
        `${target}: ${pngFrames.length} frames, png ${(pngBytes / 1024 / 1024).toFixed(3)} MB -> webp ${(webpBytes / 1024 / 1024).toFixed(3)} MB`,
      );
    }
  } finally {
    await browser.close();
  }

  const saved = totalPngBytes - totalWebpBytes;
  console.log(
    `Map animation WebP total: ${(totalWebpBytes / 1024 / 1024).toFixed(3)} MB, saved ${(saved / 1024 / 1024).toFixed(3)} MB vs PNG animation layers at quality ${quality}.`,
  );
}

await main();
