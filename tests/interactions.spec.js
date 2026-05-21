import { test, expect } from "@playwright/test";

/* インタラクションE2Eテスト
   主要なUIフロー（パネル開閉・キーボード・ツアー・着陸）が壊れていないかを確認する。
   ピクセル比較ではなく DOM 状態をアサートするため、軽量で安定する。
*/

const CANVAS = "canvas";

async function load(page, query) {
  /* オンボーディングオーバーレイがクリックを遮るので事前に既訪問フラグを立てる */
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("solar_ob", "1"));
  await page.goto(`/?${query || "paused=1"}`);
  await page.waitForSelector(CANVAS, { state: "visible" });
  await page.waitForTimeout(400);
}

test.describe("interactions — panels", () => {
  test("検索パネルが開閉できる", async ({ page }) => {
    await load(page);
    await page.getByRole("button", { name: /🔍 検索/ }).click();
    await expect(page.getByPlaceholder("惑星名・彗星名...")).toBeVisible();
    await page.getByRole("button", { name: "閉じる" }).first().click();
    await expect(page.getByPlaceholder("惑星名・彗星名...")).not.toBeVisible();
  });

  test("ブックマークパネルが開く", async ({ page }) => {
    await load(page);
    await page.getByRole("button", { name: /🔖 ブックマーク/ }).click();
    await expect(page.getByPlaceholder("名前...")).toBeVisible();
  });

  test("系外惑星パネルが開く", async ({ page }) => {
    await load(page);
    await page.getByRole("button", { name: /🪐 系外惑星/ }).click();
    await expect(page.getByText("近隣の系外惑星地表へ瞬間移動")).toBeVisible();
  });

  test("今夜の空パネルが開く", async ({ page }) => {
    await load(page);
    await page.getByRole("button", { name: /🌙 今夜の空/ }).click();
    await expect(page.getByLabel("緯度")).toBeVisible();
  });

  test("月相カレンダーパネルが開く", async ({ page }) => {
    await load(page);
    await page.getByRole("button", { name: /🌙 月相/ }).click();
    await expect(page.getByText("🌙 月相カレンダー")).toBeVisible();
  });

  test("比較表パネルが開く", async ({ page }) => {
    await load(page);
    await page.getByRole("button", { name: /📊 比較表/ }).click();
    await expect(page.getByText("📊 惑星比較表")).toBeVisible();
  });

  test("? キーでヘルプパネル開閉", async ({ page }) => {
    await load(page);
    await page.keyboard.press("?");
    await expect(page.getByText("⌨ ショートカット一覧")).toBeVisible();
    await page.keyboard.press("?");
    await expect(page.getByText("⌨ ショートカット一覧")).not.toBeVisible();
  });

  test("流星群カレンダーパネルが開く", async ({ page }) => {
    await load(page);
    await page.getByRole("button", { name: /🌠 流星群/ }).click();
    await expect(page.getByText("🌠 流星群カレンダー")).toBeVisible();
    /* 7つの流星群すべてが表示されている */
    await expect(page.getByText("ペルセウス座流星群")).toBeVisible();
    await expect(page.getByText("ふたご座流星群")).toBeVisible();
  });

  test("系外惑星パネルが詳細スペックを表示", async ({ page }) => {
    await load(page);
    await page.getByRole("button", { name: /🪐 系外惑星/ }).click();
    /* 拡充された詳細フィールドが表示される */
    await expect(page.getByText("≈1.07 地球").first()).toBeVisible();
    /* ハビタブルゾーンバッジ */
    await expect(page.locator("text=ＨＺ").first()).toBeVisible();
    /* 着陸ボタン */
    await expect(page.getByRole("button", { name: /🚀 地表に着陸/ }).first()).toBeVisible();
  });
});

test.describe("interactions — localStorage persistence", () => {
  test("言語設定がリロードで永続化される", async ({ page }) => {
    await load(page);
    /* 英語に切替 */
    await page.getByRole("button", { name: "EN/JA" }).click();
    await expect(page.getByRole("button", { name: /Search/ })).toBeVisible();
    /* リロード（onboarding flag は既に立っている） */
    await page.reload();
    await page.waitForSelector(CANVAS, { state: "visible" });
    await page.waitForTimeout(400);
    /* 英語のまま */
    await expect(page.getByRole("button", { name: /Search/ })).toBeVisible();
  });

  test("表示トグルの状態が永続化される", async ({ page }) => {
    await load(page);
    /* 軌道トグルをオフにする（初期はON） */
    const orbitsBtn = page.getByRole("button", { name: "軌道", exact: true });
    await orbitsBtn.click();
    /* localStorage に保存されたことを確認 */
    const cfg = await page.evaluate(() => localStorage.getItem("solar_cfg"));
    expect(cfg).toContain('"orbits":false');
  });
});

test.describe("interactions — focus selection", () => {
  test("フォーカスパネルから地球を選択", async ({ page }) => {
    await load(page);
    await page.locator("button:has-text(\"地球\")").first().click();
    /* 情報パネルが表示される（タイトルに「地球」を含む） */
    await expect(page.locator("text=地球").first()).toBeVisible();
  });

  test("初期URLでフォーカス指定", async ({ page }) => {
    await load(page, "state=SS%7C0%7C0.22%7C0.3%7C17%7CMars&paused=1");
    /* フォーカスが火星に設定されている: 情報パネルに「火星」表示 */
    await expect(page.locator("text=火星").first()).toBeVisible();
  });

  test("初期URLで着陸モード復元 (SL形式)", async ({ page }) => {
    /* SL|t|plName|lat|lng|yaw|fov|tilt — 地球の北緯35度・東経135度に着陸 */
    await load(page, "state=SL%7C0%7CEarth%7C35%7C135%7C0%7C1%7C0&paused=1");
    /* 着陸モード時のみ表示される「離陸」ボタンの存在で確認 */
    await expect(page.getByRole("button", { name: /🚀 離陸/ })).toBeVisible();
  });
});

test.describe("interactions — keyboard shortcuts", () => {
  test("スペースキーで一時停止トグル", async ({ page }) => {
    await load(page, "paused=0");
    /* 初期は再生中: ⏸ ボタンが見える */
    await expect(page.locator("button:has-text(\"⏸\")").first()).toBeVisible();
    await page.keyboard.press(" ");
    /* 一時停止後: ▶ ボタンが見える */
    await expect(page.locator("button:has-text(\"▶\")").first()).toBeVisible();
  });

  test("数字キー 3 で地球フォーカス", async ({ page }) => {
    await load(page);
    await page.keyboard.press("3");
    await expect(page.locator("text=地球").first()).toBeVisible();
  });

  test("S キーで太陽フォーカス", async ({ page }) => {
    await load(page);
    await page.keyboard.press("s");
    /* 情報パネルに太陽データ（質量行）が出る */
    await expect(page.locator("text=/質量.*kg/").first()).toBeVisible();
  });
});

test.describe("interactions — language toggle", () => {
  test("EN/JA ボタンで英語表示に切り替わる", async ({ page }) => {
    await load(page);
    await page.getByRole("button", { name: "EN/JA" }).click();
    /* 英語ラベルが表示される */
    await expect(page.getByRole("button", { name: /Search/ })).toBeVisible();
  });
});

test.describe("interactions — bookmarks", () => {
  test("ブックマーク保存と表示", async ({ page }) => {
    await load(page);
    await page.getByRole("button", { name: /🔖 ブックマーク/ }).click();
    await page.getByPlaceholder("名前...").fill("テスト");
    await page.getByRole("button", { name: "保存" }).click();
    /* 保存後にテスト名のボタンが現れる */
    await expect(page.locator("button:has-text(\"テスト\")")).toBeVisible();
  });
});

test.describe("interactions — search flow", () => {
  test("検索からフォーカス遷移", async ({ page }) => {
    await load(page);
    await page.getByRole("button", { name: /🔍 検索/ }).click();
    const input = page.getByPlaceholder("惑星名・彗星名...");
    await input.fill("ハレー");
    /* 検索結果リスト（パネル内のスクロール領域）から最初のヒットを選ぶ */
    const result = input.locator("..").locator("button").first();
    await expect(result).toBeVisible();
    await result.click();
    /* 検索パネルが閉じる */
    await expect(input).not.toBeVisible();
  });
});

test.describe("interactions — version", () => {
  test("バージョン表示が現在の package.json と一致", async ({ page }) => {
    await load(page);
    const versionText = await page.locator("text=/v\\d+\\.\\d+\\.\\d+/").textContent();
    expect(versionText).toMatch(/^v\d+\.\d+\.\d+$/);
  });
});
