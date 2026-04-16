# Solar System Simulator — CLAUDE.md

## プロジェクト概要

React + Canvas 2D APIによるインタラクティブな太陽系・銀河系・惑星表面の3Dシミュレーター。外部画像アセット不使用、プロシージャル描画のみ。

- **ライブデモ**: https://htanny.github.io/solar/
- **バージョン**: v2.0 (2026-04)

## 技術スタック

- **フレームワーク**: React 18 (Hooks)
- **描画**: Canvas 2D API（外部ライブラリ不使用）
- **ビルド**: Vite 5
- **デプロイ**: GitHub Actions → GitHub Pages

## ファイル構成

```
src/
  App.jsx        # メインコンポーネント（約980行、単一ファイル）
  main.jsx       # Reactエントリポイント
public/
  favicon.svg
.github/workflows/
  deploy.yml     # GitHub Pages自動デプロイ
```

## 開発コマンド

```bash
npm install       # 依存関係インストール
npm run dev       # 開発サーバー起動 (http://localhost:5173)
npm run build     # 本番ビルド
npm run preview   # ビルド結果をプレビュー
```

## アーキテクチャ

`src/App.jsx` は単一ファイル構成：

- **データ定義**: `PL`（8惑星）、`COMETS`（2彗星）、`GMOONS`（ガリレオ衛星）、`SURF`（地表データ）
- **描画関数**: `drawPlanetBody`、`drawSun`、`drawLanding`
- **3Dユーティリティ**: `RX`/`RY`（軸回転）、`pj`（3D→2D投影）
- **状態管理**: `useState`（UI）+ `useRef`（アニメーションループ）
- **音響**: Web Audio API（BGM + 惑星別環境音）

## デプロイ

`main`ブランチへのpushで自動デプロイ（GitHub Actions）。

```bash
git push origin main
# → Actions が npm run build を実行
# → gh-pages ブランチへデプロイ
# → https://htanny.github.io/solar/ で公開
```

`vite.config.js` の `base: '/solar/'` が GitHub Pages のサブパス対応に必要。

## 注意事項

- `canvas.toDataURL` はArtifact環境でブロックされる（スクリーンショットはOSネイティブ機能を使用）
- BGMはブラウザのオートプレイ制限により手動で有効化が必要
- `localStorage` は未使用、すべてメモリ内で状態管理
