/*
 * UI screenshot capture for the Stellar Reach UI rehaul work.
 *
 * Usage:
 *   node scripts/ui-screenshots.mjs <out-dir>
 *
 * Spins up a Playwright Chromium browser, drives the running dev server at
 * http://localhost:5173, and captures every primary screen at three
 * viewports (mobile portrait, breakpoint, desktop). The dev server must
 * already be running.
 *
 * Naming: <out-dir>/<screen>-<width>.png
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const VIEWPORTS = [
  { label: 'mobile', width: 375, height: 812 },
  { label: 'breakpoint', width: 960, height: 600 },
  { label: 'desktop', width: 1280, height: 720 },
];

// Internal screen ids exposed by the store. The title screen is captured
// before any campaign is started; the rest after launching a campaign.
const SCREENS = ['market', 'ship', 'crew', 'helm', 'news', 'missions', 'log'];

const BASE = process.env.SR_DEV_URL ?? 'http://localhost:5173/';

async function main() {
  const outArg = process.argv[2];
  if (!outArg) {
    console.error('Usage: node scripts/ui-screenshots.mjs <out-dir>');
    process.exit(1);
  }
  const outDir = resolve(outArg);
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch();
  try {
    for (const vp of VIEWPORTS) {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
      });
      const page = await ctx.newPage();

      // Title screen (no save).
      await page.goto(BASE, { waitUntil: 'networkidle' });
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForSelector('h1', { timeout: 5000 });
      await page.screenshot({
        path: `${outDir}/title-${vp.width}.png`,
        fullPage: false,
      });

      // Launch a campaign with a stable seed for reproducibility.
      await page.fill('#captain-name', 'Captain Ren');
      await page.fill('#seed', 'STELLA-9001');
      await page.getByRole('button', { name: 'Launch Campaign' }).click();
      await page.waitForTimeout(400);

      for (const sid of SCREENS) {
        await page.evaluate((s) => {
          // The store exposes setScreen via the zustand `useGameStore`
          // hook; the simplest portable way to drive it from Playwright
          // is to click the matching nav button when present, falling
          // back to a direct store call only as a last resort.
          const labels = {
            market: 'Market',
            ship: 'Ship',
            crew: 'Crew',
            helm: 'Helm',
            news: 'News',
            missions: 'Jobs',
            log: 'LOG',
          };
          const target = labels[s];
          const btns = Array.from(document.querySelectorAll('button'));
          const hit = btns.find((b) => (b.textContent ?? '').trim() === target);
          if (hit) hit.click();
        }, sid);
        await page.waitForTimeout(250);
        await page.screenshot({
          path: `${outDir}/${sid}-${vp.width}.png`,
          fullPage: false,
        });
      }

      await ctx.close();
    }
  } finally {
    await browser.close();
  }
  console.log(`Wrote screenshots to ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
