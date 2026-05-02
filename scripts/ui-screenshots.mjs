/*
 * UI screenshot capture for the Stellar Reach UI rehaul work.
 *
 * Usage:
 *   node scripts/ui-screenshots.mjs <out-dir>
 *
 * Spins up a Playwright Chromium browser, drives the running dev server at
 * http://localhost:5173, and captures every primary screen at four
 * viewports (mobile portrait, breakpoint, desktop 720p, desktop 1080p).
 * The dev server must already be running.
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
  { label: 'desktop-fullhd', width: 1920, height: 1080 },
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
      await page.waitForSelector('.title-display', { timeout: 5000 });
      await page.waitForTimeout(300);
      await page.screenshot({
        path: `${outDir}/title-${vp.width}.png`,
        fullPage: false,
      });

      // Open the New Voyage card and launch.
      const newVoyage = page.locator('button.title-action.primary');
      if (await newVoyage.count()) {
        await newVoyage.first().click();
        await page.waitForTimeout(150);
      }
      await page.fill('#captain-name', 'Captain Ren');
      await page.fill('#seed', 'STELLA-9001');
      await page.getByRole('button', { name: 'Launch Campaign' }).click();
      await page.waitForTimeout(500);

      for (const sid of SCREENS) {
        // Match the data-screen attribute on console buttons. This is
        // robust against label text changes and against the F-key span
        // bleeding into textContent.
        await page.evaluate((s) => {
          const btn = document.querySelector(
            `.console-btn[data-screen="${s}"]`,
          );
          if (btn) (btn instanceof HTMLElement ? btn : null)?.click();
        }, sid);
        await page.waitForTimeout(300);
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
