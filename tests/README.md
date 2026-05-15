# Visual Regression Tests

太陽系シミュレーターのビジュアル回帰テスト（Playwright + Chromium）。

## 初回セットアップ

```bash
npm install
npx playwright install chromium    # 約 170MB のブラウザバイナリをダウンロード
```

## 実行

```bash
npm test              # 既存ベースラインと比較
npm run test:update   # ベースラインを再生成（意図的な見た目変更時）
```

`npm test` は内部的に Vite dev サーバーを起動し、Chromium で各テストケースを撮影、`tests/visual.spec.js-snapshots/` のベースラインと比較します。

## テストの仕組み

各テストは URL クエリ `?state=<state>&paused=1` で初期状態を指定します。
`paused=1` がアニメーションを停止し、`state=` が以下のフォーマットでカメラ・時刻・フォーカスを指定します:

```
SS | t | rx | ry | zoomIndex | focus
```

| フィールド | 内容 | 例 |
|---|---|---|
| `t` | シミュレーション日数 (J2000.0 = 0) | `0` |
| `rx`, `ry` | カメラ回転 (rad) | `0.22`, `0.3` |
| `zoomIndex` | `ZS` 配列のインデックス（17=太陽系, 21=銀河） | `17` |
| `focus` | `"all"` / `"sun"` / 惑星名 | `Saturn` |

## ベースライン更新フロー

1. 意図的な視覚変更を加える（例: 土星リングのチューニング）
2. `npm test` を実行 → 差分が検出される
3. 差分が意図通りなら `npm run test:update` で再生成
4. `git add tests/visual.spec.js-snapshots/` でベースラインをコミット

## 注意

- ベースラインは OS・GPU により微妙にレンダリングが異なるため、CI 環境と開発環境が異なる場合は CI 専用ベースラインを使うこと（Playwright が自動で `*-linux.png` / `*-darwin.png` を生成）
- `maxDiffPixels: 200`、`threshold: 0.2` の許容値は `playwright.config.js` で調整可能
- 1280×800 ビューポート固定。リサイズテストは別途追加が必要
