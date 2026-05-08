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
│   ├── App.jsx                  # メインコンポーネント（状態管理・アニメーションループ）
│   ├── main.jsx                 # Reactエントリーポイント
│   ├── data/
│   │   └── solarData.js         # 全天体データ（惑星・衛星・彗星・探査機等）
│   ├── render/
│   │   ├── utils.js             # 3D数学・描画ユーティリティ（pj・RX/RY・fillCirc等）
│   │   ├── drawBodies.js        # 太陽系描画（惑星・軌道・銀河・小惑星帯）
│   │   └── drawLanding.js       # 着陸モード描画（地表・空・HUD）
│   ├── audio/
│   │   └── landAudio.js         # 惑星別環境音（Web Audio API）
│   ├── hooks/
│   │   └── useRefSync.js        # useState + useRef 同期カスタムフック
│   ├── utils/
│   │   └── timeUtils.js         # 日付⇔シミュレーション日数変換・天文イベント計算
│   └── components/
│       └── DragPanel.jsx         # ドラッグ可能UIパネルコンポーネント
├── public/
│   └── favicon.svg
├── .github/workflows/
│   └── deploy.yml               # GitHub Pages自動デプロイ
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## コーディング規約

- **8モジュール構成**: `App.jsx`（状態・ループ）、`solarData.js`（データ）、`drawBodies.js`（描画）、`drawLanding.js`（着陸）、`utils.js`（数学）、`landAudio.js`（音）、`useRefSync.js`（フック）、`timeUtils.js`（時刻）
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
