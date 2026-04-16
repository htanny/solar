# コントリビューションガイド

## 開発環境のセットアップ

```bash
# リポジトリをクローン
git clone https://github.com/htanny/solar.git
cd solar

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
# → http://localhost:5173 で開く

# 本番ビルド
npm run build

# ビルド結果をプレビュー
npm run preview
```

## プロジェクト構造

```
solar/
├── src/
│   ├── App.jsx          # メインコンポーネント（全機能）
│   └── main.jsx         # Reactエントリーポイント
├── public/
│   └── favicon.svg      # ファビコン
├── .github/workflows/
│   └── deploy.yml       # GitHub Pages自動デプロイ
├── index.html           # HTMLエントリー
├── vite.config.js       # Viteビルド設定
├── package.json
├── LICENSE              # MITライセンス
└── README.md
```

## コーディング規約

- **単一ファイル設計**: `src/App.jsx` に全機能を集約。モジュール分割は行わない（現状のアーキテクチャを維持）
- **var を使用**: `let`/`const`ではなく`var`に統一されている（既存のスタイル踏襲）
- **コメント**: 機能の区切りは `/* ===== SECTION ===== */` 形式
- **命名**: 関数はcamelCase、定数はUPPER_CASE

## 機能追加時のチェックリスト

- [ ] 物理的な正確性（実際の天文データに基づく）
- [ ] パフォーマンス（60fps維持、画面外カリング）
- [ ] 既存モードとの整合性（ツアー/銀河/着陸との排他制御）
- [ ] レスポンシブ対応（スマホで動作確認）
- [ ] キーボードショートカット（既存のパターンに従う）
- [ ] 日本語/英語のラベル（UI はすべて日本語）

## プルリクエスト

1. フォーク
2. フィーチャーブランチを作成: `git checkout -b feature/amazing-feature`
3. 変更をコミット: `git commit -m 'Add amazing feature'`
4. プッシュ: `git push origin feature/amazing-feature`
5. プルリクエストを作成

## 物理計算の参考資料

- [NASA Planetary Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/)
- [JPL Small-Body Database](https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html)
- ケプラー方程式、球面三角法の標準文献

## バグ報告

Issue テンプレートに従って報告してください:
- 発生した現象
- 期待していた動作
- 再現手順
- 使用環境（ブラウザ、デバイス）
