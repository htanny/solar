import { test, expect } from "@playwright/test";

/* 決定論的な初期状態を URL クエリで指定し、Canvas を撮影してベースライン比較する。
   状態フォーマット: SS|t|rx|ry|zoomIndex|focus
     - t: シミュレーション日数 (0 = J2000.0)
     - rx, ry: カメラ回転 (rad)
     - zoomIndex: ZS 配列のインデックス (17 = 太陽系標準ビュー, 21 = 銀河ビュー)
     - focus: "all" | "sun" | 惑星名

   ベースライン更新が必要なら: npm run test:update
*/

const CANVAS = "canvas";

async function loadAndWait(page, state) {
  await page.goto(`/?state=${encodeURIComponent(state)}&paused=1`);
  await page.waitForSelector(CANVAS, { state: "visible" });
  /* 1フレーム描画とフォント読込を待つ */
  await page.waitForTimeout(800);
}

test.describe("visual regression — orbit view", () => {
  test("太陽系標準ビュー", async ({ page }) => {
    await loadAndWait(page, "SS|0|0.22|0.3|17|all");
    await expect(page.locator(CANVAS)).toHaveScreenshot("solar-system.png");
  });

  test("太陽フォーカス", async ({ page }) => {
    await loadAndWait(page, "SS|0|0.22|0.3|17|sun");
    await expect(page.locator(CANVAS)).toHaveScreenshot("sun-focus.png");
  });

  test("地球フォーカス", async ({ page }) => {
    await loadAndWait(page, "SS|0|0.22|0.3|17|Earth");
    await expect(page.locator(CANVAS)).toHaveScreenshot("earth-focus.png");
  });

  test("土星フォーカス（リング描画）", async ({ page }) => {
    await loadAndWait(page, "SS|0|0.22|0.3|17|Saturn");
    await expect(page.locator(CANVAS)).toHaveScreenshot("saturn-focus.png");
  });

  test("天王星フォーカス（横倒しリング）", async ({ page }) => {
    await loadAndWait(page, "SS|0|0.22|0.3|17|Uranus");
    await expect(page.locator(CANVAS)).toHaveScreenshot("uranus-focus.png");
  });

  test("木星フォーカス（大赤斑）", async ({ page }) => {
    await loadAndWait(page, "SS|0|0.22|0.3|17|Jupiter");
    await expect(page.locator(CANVAS)).toHaveScreenshot("jupiter-focus.png");
  });
});

test.describe("visual regression — UI", () => {
  test("バージョン表示が描画される", async ({ page }) => {
    await loadAndWait(page, "SS|0|0.22|0.3|17|all");
    await expect(page.locator("text=/v\\d+\\.\\d+\\.\\d+/")).toBeVisible();
  });

  test("Canvas要素が存在する", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(CANVAS)).toBeVisible();
  });
});
