/* Shared Playwright helpers — keeps spec files focused on assertions. */

export const CANVAS = "canvas";

/* Skip the first-run onboarding overlay so it doesn't intercept clicks/keys. */
export async function bypassOnboarding(page) {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("solar_ob", "1"));
}

/* Skip the persisted settings panel state so each test starts clean. */
export async function clearStoredSettings(page) {
  await page.evaluate(() => {
    localStorage.removeItem("solar_cfg");
    localStorage.removeItem("solar_bm");
  });
}

/* Interaction tests: assume paused by default + onboarding skipped. */
export async function load(page, query) {
  await bypassOnboarding(page);
  await clearStoredSettings(page);
  await page.goto(`/?${query || "paused=1"}`);
  await page.waitForSelector(CANVAS, { state: "visible" });
  await page.waitForTimeout(400);
}

/* Visual regression: deterministic state via URL, longer wait for first frame + font load.
   Onboarding overlay and the once-a-day Today's Highlight card are suppressed —
   both would otherwise cover/darken the canvas and blind the screenshot comparison. */
export async function loadAndWait(page, state) {
  await bypassOnboarding(page);
  await page.evaluate(() => {
    localStorage.setItem("solar_today", new Date().toISOString().slice(0, 10));
  });
  await page.goto(`/?state=${encodeURIComponent(state)}&paused=1`);
  await page.waitForSelector(CANVAS, { state: "visible" });
  await page.waitForTimeout(800);
}
