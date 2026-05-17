import { defineConfig, devices } from "@playwright/test";

/* 太陽系シミュレーターのビジュアル回帰テスト設定
   実行: npm test
   ベースライン更新: npm run test:update */
export default defineConfig({
  testDir: "./tests",
  testIgnore: "unit/**",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:5173",
    trace: "off",
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  },
  expect: {
    /* ピクセル単位の比較しきい値: アニメーション/フォントレンダリングの微小差を許容 */
    toHaveScreenshot: {
      maxDiffPixels: 200,
      threshold: 0.2,
      animations: "disabled",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
