# Solar System Simulator — CLAUDE.md

## プロジェクト概要

React + Canvas 2D APIによるインタラクティブな太陽系・銀河系・惑星表面の3Dシミュレーター。外部画像アセット不使用、プロシージャル描画のみ。

- **ライブデモ**: https://htanny.github.io/solar/
- **バージョン**: v2.9.0 (2026-05)

## 技術スタック

- **フレームワーク**: React 18 (Hooks)
- **描画**: Canvas 2D API（外部ライブラリ不使用）
- **ビルド**: Vite 5
- **デプロイ**: GitHub Actions → GitHub Pages

## ファイル構成

```
src/
  App.jsx                  # メインコンポーネント（状態管理・アニメーションループ・UI）
  main.jsx                 # Reactエントリポイント
  data/
    solarData.js           # 全天体データ（PL/DWARFS/COMETS/GMOONS/SURF 等）
  render/
    utils.js               # 3D数学・描画ユーティリティ（pj・RX/RY・fillCirc等）
    drawBodies.js          # 軌道ビュー描画（惑星テクスチャ・リング・銀河・星）
    drawLanding.js         # 着陸モード描画（地表・空・HUD）
  audio/
    landAudio.js           # 惑星別環境音（Web Audio API）
  hooks/
    useRefSync.js          # useState + useRef 同期カスタムフック
  utils/
    timeUtils.js           # 日付⇔シミュレーション日数変換・天文イベント計算
  components/
    DragPanel.jsx          # ドラッグ可能UIパネルコンポーネント
public/
  favicon.svg
.github/workflows/
  deploy.yml               # GitHub Pages自動デプロイ
```

**行数目安**: App.jsx ~700行 / drawLanding.js ~680行 / drawBodies.js ~340行 / 合計 ~2100行

## 開発コマンド

```bash
npm install            # 依存関係インストール
npm run dev            # 開発サーバー起動 (http://localhost:5173)
npm run build          # 本番ビルド（出力 ~370KB / gzip 124KB）
npm run preview        # ビルド結果をプレビュー
npm run test:unit      # Vitest ユニットテスト実行
npm run test:unit:watch # Vitest ウォッチモード
npm run typecheck      # JSDoc + // @ts-check の静的型チェック
npm test               # Playwright ビジュアル回帰テスト
```

### 型チェック方針

ES モジュール内の未定義変数アクセスは strict mode 下で `ReferenceError` を発生させる
（実例: v2.17.1 で修正した `sunDir` 問題）。これを静的検出するため:

- `tsconfig.json` で `allowJs:true, checkJs:false` (オプトイン方式)
- ファイル先頭に `// @ts-check` を付けたファイルのみ `tsc --noEmit` が検査
- 検査対象: `drawLanding.js` 系3ファイル
- JSDoc `@typedef` を `drawLanding.js` で集中定義し、子ファイルは `import("./drawLanding.js").LandingSkyState` 形式で参照

## アーキテクチャ

### モジュール責務

| モジュール | 責務 |
|---|---|
| `App.jsx` | React状態・60fpsアニメーションループ・UIパネル全体 |
| `solarData.js` | `PL`（8惑星）、`DWARFS`（準惑星）、`COMETS`、`GMOONS`、`SURF`（地表データ）、`PL_MAP`/`DWARF_MAP` |
| `drawBodies.js` | `drawPlanetBody`、`drawSun`、`dRi`（土星リング）、`dRiUranus`（天王星リング）、`dSh`（影）、`mkStars`、`mkGalaxy`、`mkNearStars` |
| `drawLanding.js` | `drawLanding`（惑星表面・空・HUD）、`earthIsLand`、`getEarthBiome` |
| `utils.js` | `RX`/`RY`（軸回転）、`pj`（3D→2D投影）、`fillCirc`、`clipCirc` |
| `landAudio.js` | `startLandSound`/`stopLandSound`（Web Audio API、12惑星対応） |
| `useRefSync.js` | `useRefSync(init)` → `[state, setState, ref]` の三つ組 |
| `timeUtils.js` | `dateToSimDays`、`simDaysToDate`、`scanEvents` |
| `DragPanel.jsx` | ドラッグ移動可能なUIパネルラッパー |

### 状態管理パターン

- **UI状態**: `useState` — パネル開閉・言語・速度など
- **フレームループ参照**: `useRefSync` — ループ内から毎フレーム読む値（ズーム・フォーカス・トグル等）
- **シミュレーション状態**: `S.current`（`useRef`）— 時刻・カメラ・軌跡バッファ

### 座標系

- **距離単位**: 1 AU = 150 シム単位（= 150 Mkm）
- **惑星半径スケール**: DK=0.08（通常）、SK=0.18（太陽）
- **投影**: `pj(x, y, z, cam)` → `{x, y}` スクリーン座標
- **銀河スケール**: `SUN_GAL_R=26`（26,000光年）

### 主要定数（drawBodies.js）

```js
var TAU = Math.PI * 2;
var SRR = 696;          // 太陽半径（シム単位）
var DK = 0.08;          // 惑星スケール係数
var SK = 0.18;          // 太陽スケール係数
```

## デプロイ

`main`ブランチへのpushで自動デプロイ（GitHub Actions）。

```bash
git push origin main
# → Actions が npm run build を実行
# → gh-pages ブランチへデプロイ
# → https://htanny.github.io/solar/ で公開
```

`vite.config.js` の `base: '/solar/'` が GitHub Pages のサブパス対応に必要。

## バージョン管理ルール

**ソースを変更してコミットする際は、必ずバージョン文字列を更新すること。**

- バージョン表示箇所: `src/App.jsx` の `<div>v2.x.x</div>`（ファイル末尾付近）
- `package.json` の `"version"` フィールドも同時に更新する
- パッチ変更（バグ修正・小改善）: 末尾の数字を +1（例: v2.9.0 → v2.9.1）
- 機能追加: 中間の数字を +1（例: v2.9.x → v2.10.0）

## 実装済み機能一覧（v2.9.0）

### 天体・物理
- 8惑星（ケプラー軌道・自転・地軸傾斜・昼夜影）
- 太陽（黒点・粒状斑・白斑・コロナ・CME）
- 月（公転・満ち欠け・日食）
- ガリレオ衛星 / 各惑星の追加衛星
- 彗星 2個（ハレー・エンケ）— イオン尾+ダスト尾の二重尾
- 準惑星 3個（冥王星・エリス・ケレス）
- 小惑星帯（200個）・命名小惑星 4個
- 探査機 4機・ラグランジュ点 L1〜L5
- N体重力シミュレーション

### ビジュアル可視化
- 土星リング（5層）・天王星リング（6本細リング、97.8°傾斜）
- ヒル球（全8惑星、距離ラベル付き）
- 日食影錐（アンブラ+ペナンブラ三角形）
- 潮汐力ベクトル（地球、4方向）
- 望遠鏡モード（ビネット+レチクル+ターゲットブラケット）
- 銀河系（渦巻4腕・バルジ・近傍9恒星スペクトル型表示）
- ハビタブルゾーン / ヘリオスフィア / 磁気圏 / 黄道光

### UI・モード
- ツアーモード（太陽→海王星自動巡回、距離ベースズーム）
- サイズ比較モード（実比率）
- 着陸モード（12天体、HUD・コンパス・日の出入り）
- 月相カレンダーパネル
- 軌道要素パネル（a・e・i・T・M・ν・r・v）
- 天文イベントスキャン・ブックマーク・今夜の空
- 系外惑星パネル（ProximaB・Trappist1e・Kepler22b・HD189733b）
- 検索・共有URL・日付移動・スクリーンショットモード
- EN/JA 言語切替

### 音響
- BGM（Web Audio API、和音生成）
- 惑星別環境音（地球・火星・金星・月・木星・土星・天王星/海王星・水星・系外惑星4種）

## 注意事項

- `canvas.toDataURL` はArtifact環境でブロックされる（スクリーンショットはOSネイティブ機能を使用）
- BGMはブラウザのオートプレイ制限により手動で有効化が必要
- `localStorage` は未使用、すべてメモリ内で状態管理
- `var` 統一スタイル（`let`/`const` 不使用）— 既存コードに合わせること
- フレームループ内で `useRef` の `.current` を直接読み書き（`useState` の setter は非同期のため不可）
