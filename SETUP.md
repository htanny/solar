# 開発セットアップ & デプロイ手順

## ローカル開発

```bash
git clone https://github.com/htanny/solar.git
cd solar
npm install
npm run dev        # → http://localhost:5173
```

## 本番ビルド

```bash
npm run build      # dist/ に出力（~298KB / gzip 99KB）
npm run preview    # ビルド結果をローカル確認
```

## デプロイ

`main` ブランチへの push で GitHub Actions が自動ビルド＆デプロイ。

```bash
git add .
git commit -m "feat: 変更内容"
git push origin main
# → Actions が npm run build を実行
# → gh-pages ブランチへデプロイ
# → https://htanny.github.io/solar/ で公開（数分後）
```

デプロイ状況: [GitHub Actions](https://github.com/htanny/solar/actions)

## フィーチャーブランチ開発

```bash
git checkout -b feature/my-feature
# 開発・コミット
git push -u origin feature/my-feature
# GitHub でプルリクエスト → main へマージ → 自動デプロイ
```

## GitHub Pages 設定（初回のみ）

1. [Settings → Pages](https://github.com/htanny/solar/settings/pages)
2. Source を **GitHub Actions** に設定

## vite.config.js の base 設定

GitHub Pages のサブパス `/solar/` に対応するため必須:

```js
base: process.env.GITHUB_PAGES ? '/solar/' : '/'
```

## トラブルシューティング

| 症状 | 対処 |
|---|---|
| `npm run build` が失敗 | `npm install` 後に再試行 |
| デプロイが 404 | Settings → Pages で Source が GitHub Actions になっているか確認 |
| アセットが読めない | `vite.config.js` の `base: '/solar/'` を確認 |
| BGM が鳴らない | ブラウザのオートプレイ制限。BGMボタンを手動でタップ |
