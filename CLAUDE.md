# Solar System Simulator — CLAUDE.md

## プロジェクト概要

React + Canvas 2D APIによるインタラクティブな太陽系・銀河系・惑星表面の3Dシミュレーター。外部画像アセット不使用、プロシージャル描画のみ。

- **ライブデモ**: https://htanny.github.io/solar/
- **バージョン**: v2.65.0 (2026-07)

## 技術スタック

- **フレームワーク**: React 18 (Hooks)
- **描画**: Canvas 2D API（外部ライブラリ不使用）
- **ビルド**: Vite 5
- **デプロイ**: GitHub Actions → GitHub Pages

## ファイル構成

```
src/
  App.jsx                    # メインコンポーネント（状態管理・アニメーションループ・UI）
  main.jsx                   # Reactエントリポイント
  data/
    solarData.js             # 全天体データ（PL/DWARFS/COMETS/GMOONS/SURF/各種FEATURES/QUIZ_DATA 等）
  render/
    utils.js                 # 3D数学・描画ユーティリティ（pj・RX/RY・fillCirc等）
    landingUtils.js          # 着陸系共通ユーティリティ（angSepDeg・terrainH・getEarthBiome等）
    drawBodies.js             # 軌道ビュー：惑星テクスチャ・リング・銀河・星
    drawRings.js              # 土星/天王星リング描画
    drawMoon.js               # 月の描画（満ち欠け・日食）
    drawStar.js               # 太陽描画（黒点・粒状斑・コロナ・CME）
    drawGalaxyView.js         # 銀河系ビュー（渦巻腕・バルジ・近傍恒星）
    drawOverlays.js           # ヒル球・潮汐ベクトル・磁気圏等のオーバーレイ
    drawScreenHUD.js          # 軌道ビューHUD
    drawTourHUD.js            # ツアーモードHUD
    drawLanding.js             # 着陸モード描画コーディネーター
    drawLandingSky.js          # 着陸空：太陽・日食・黄道光・オーロラ・大気
    drawLandingStars.js        # 着陸空：星・命名恒星・星座線・流星群
    drawLandingSkyBodies.js    # 着陸空：他天体（月・惑星）の描画
    drawLandingTerrain.js      # 着陸地表（29天体分の地形描画）
    drawLandingHUD.js          # 着陸HUD（コンパス・ミニマップ・最寄地形表示）
  audio/
    landAudio.js              # 天体別環境音（Web Audio API、29天体対応）
  hooks/
    useRefSync.js             # useState + useRef 同期カスタムフック
    useKeyboard.js             # キーボードショートカット処理
  utils/
    timeUtils.js               # 日付⇔シミュレーション日数変換・天文イベント計算
    computations.js             # 軌道要素・距離等の派生計算
    analytics.js                 # ローカル利用分析（localStorage、送信なし）
    explorerLog.js               # 探検手帳ロジック（訪問判定・実績バッジ計算）
    panelReducer.js              # パネル開閉状態のreducer
    shareCard.js                  # 共有カード生成
    todayHighlight.js              # 「今日の空」おすすめ計算
  styles/
    panelStyles.js               # 共通パネルスタイル（PHONE_BTN・mobileSheet等）
  components/
    DragPanel.jsx                # ドラッグ可能UIパネルコンポーネント
    LandingQuickJump.jsx          # 着陸モード下部のクイックジャンプ行
    InstallPrompt.jsx              # PWAインストール促進バナー
    TodayHighlight.jsx              # 「今日の空」おすすめ表示
    panels/                          # 18種のドラッグ可能UIパネル（InfoPanel・ExoplanetPanel・
                                      # ExplorerLogPanel・QuizPanel・ExamPanel・CompareTablePanel 等）
tests/
  interactions.spec.js         # Playwright インタラクションテスト
  visual.spec.js                # Playwright ビジュアル回帰テスト
  unit/                          # Vitest ユニットテスト（9ファイル）
public/
  favicon.svg
.github/workflows/
  deploy.yml                   # GitHub Pages自動デプロイ
```

**行数目安**: App.jsx ~800行 / 着陸描画系（drawLanding*.js 6ファイル）~2450行 / drawBodies.js ~400行 / 合計 ~6300行

## 開発コマンド

```bash
npm install            # 依存関係インストール
npm run dev            # 開発サーバー起動 (http://localhost:5173)
npm run build          # 本番ビルド（出力 ~480KB / gzip 163KB）
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
- 検査対象: `src/render/` 配下ほぼ全ファイル（`drawBodies.js`・`drawLanding*.js`系6ファイル・`landingUtils.js`・`utils.js`等）+ `LandingQuickJump.jsx`
- JSDoc `@typedef` を `drawLanding.js` で集中定義し、子ファイルは `import("./drawLanding.js").LandingSkyState` 形式で参照

## アーキテクチャ

### モジュール責務

| モジュール | 責務 |
|---|---|
| `App.jsx` | React状態・60fpsアニメーションループ・UIパネル全体・モバイル判定(`isPhone`) |
| `solarData.js` | `PL`（8惑星）、`DWARFS`（準惑星）、`COMETS`、`GMOONS`、`SURF`（地表データ）、`PL_MAP`/`DWARF_MAP`、各天体の`*_FEATURES`地形データ、`QUICK_JUMP_CONFIG`/`NEAREST_CFG`/`HUD_TALL`（着陸UI設定）、`QUIZ_DATA` |
| `drawBodies.js` | `drawPlanetBody`、`dSh`（影）等、軌道ビューの惑星描画 |
| `drawStar.js` / `drawMoon.js` / `drawRings.js` | 太陽・月・リングの個別描画（drawBodies.jsから分割） |
| `drawGalaxyView.js` | 銀河系ビュー（渦巻腕・バルジ・近傍恒星スペクトル型） |
| `drawLanding.js` | `drawLanding`（惑星表面・空・HUD統合）、`earthIsLand`、`getEarthBiome` |
| `drawLandingTerrain.js` | 29着陸天体分の地形描画（`else if(plName===...)`分岐） |
| `landingUtils.js` | `angSepDeg`（大円距離）、`terrainH`、`seedR`系ヘルパー |
| `utils.js` | `RX`/`RY`（軸回転）、`pj`（3D→2D投影）、`fillCirc`、`clipCirc` |
| `landAudio.js` | `startLandSound`/`stopLandSound`（Web Audio API、29天体対応） |
| `explorerLog.js` | `EXPLORER_GROUPS`（5分類29天体）、`BADGES`（10種実績）、`computeBadges`、`nextGoal` |
| `analytics.js` | ローカルのみの利用分析記録（外部送信なし） |
| `useRefSync.js` | `useRefSync(init)` → `[state, setState, ref]` の三つ組 |
| `timeUtils.js` | `dateToSimDays`、`simDaysToDate`、`scanEvents` |
| `DragPanel.jsx` | ドラッグ移動可能なUIパネルラッパー |
| `LandingQuickJump.jsx` | `QUICK_JUMP_CONFIG`駆動の着陸地点クイックジャンプボタン行 |
| `panelStyles.js` | `PHONE_BTN`（スマホ用タップターゲット拡大）、`mobileSheet`（safe-area対応） |

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

- バージョン表示箇所: `package.json` の `"version"` フィールド（`App.jsx`は`import { version } from "../package.json"`で参照するため二重管理不要）
- パッチ変更（バグ修正・小改善）: 末尾の数字を +1（例: v2.64.0 → v2.64.1）
- 機能追加: 中間の数字を +1（例: v2.64.x → v2.65.0）

## 実装済み機能一覧（v2.65.0）

### 天体・物理
- 8惑星（ケプラー軌道・自転・地軸傾斜・昼夜影）
- 太陽（黒点・粒状斑・白斑・コロナ・CME）
- 月（公転・満ち欠け・日食）
- ガリレオ衛星4個（イオ・エウロパ・ガニメデ・カリスト）/ 各惑星の追加衛星（フォボス・ダイモス・タイタン・エンケラドゥス・ミマス・レア・イアペトゥス・ミランダ・ティタニア 等）
- 彗星 2個（ハレー・エンケ）— イオン尾+ダスト尾の二重尾
- 準惑星 3個（ケレス・冥王星・エリス）
- 小惑星帯（200個）・命名小惑星 4個・小惑星イトカワ/リュウグウ
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

### 着陸モード（全29天体）
天体表面に降り立ち、コンパス・日の出入り・地形/探査機ラベル・環境音付きで探索できるモード。天体ごとにプロシージャル地形・専用HUD最寄地形表示（`NEAREST_CFG`）・クイックジャンプ地点（`QUICK_JUMP_CONFIG`）を持つ。

- **惑星（8）**: 水星・金星・地球（バイオーム別地表: 極域/ツンドラ/タイガ/砂漠/サバンナ/ジャングル/海洋/草原）・火星（ローバー標識）・木星・土星・天王星・海王星
- **準惑星（3）**: ケレス（オッカトル・ファクラ+アフナ山氷火山）・冥王星（スプートニク平原+ニューホライズンズ標識）・エリス（メタン氷平原）
- **衛星（11）**: 月（アポロ6地点+近側/遠側マリア）・フォボス（スティックニー+溝状地形）・イオ（火山溶岩湖+噴煙プルーム）・エウロパ（線状地形+カオス地形）・ガニメデ・カリスト（ヴァルハラ多重リング盆地）・タイタン（メタン湖+砂丘+ホイヘンス標識）・エンケラドゥス（虎縞地形+水蒸気間欠泉）・ミランダ（ベローナ断崖）・トリトン（カンタロープ地形+窒素間欠泉）・カロン（セレニティ・カスマ）
- **小天体（3）**: イトカワ・リュウグウ（はやぶさ/はやぶさ2着陸点）・ハレー彗星核（ジオット最接近標識）
- **系外惑星（4）**: ProximaB・Trappist1e・Kepler22b・HD189733b
- 天体別プロシージャル環境音（Web Audio API、29天体対応）— 火山性トレモア・潮汐共鳴・氷殻クラック音・メタン間欠泉ホワール等

### 探検手帳・ゲーミフィケーション・学習
- 探検手帳パネル（5分類29天体の訪問状況を可視化）
- 実績バッジ 10種（初着陸・岩石惑星マスター・巨大惑星マスター・ガリレオの目・準惑星ハンター・衛星コレクター・小惑星ホッパー・彗星の核心・恒星間旅行者・グランドツアー）
- 天文クイズ（初級/中級/上級/受験対策、計40問、EN/JA対応、選択肢シャッフル）
- 受験対策パネル（`ExamPanel`）— 中学受験・中3理科向け「月の満ち欠け」「金星の見え方」のインタラクティブ軌道図解。8位置クリックで地球から見た形・出入り時刻・入試の鉄則を表示
- 「今日の空」おすすめ表示（今夜見える天文イベントを提案）

### UI・モード
- ツアーモード（初級/中級/上級の3レベル、太陽→海王星自動巡回、距離ベースズーム）
- サイズ比較モード（実比率）・惑星比較表（半径・密度・重力・脱出速度等でソート可能）
- 地球内部構造パネル（内核〜地殻の5層、温度・組成表示）
- 月相カレンダーパネル・流星群パネル
- 軌道要素パネル（a・e・i・T・M・ν・r・v）
- 天文イベントスキャン・ブックマーク
- 検索・共有URL・共有カード生成・日付移動・スクリーンショットモード
- 利用分析パネル（ローカルのみ、外部送信なし）
- EN/JA 言語切替
- モバイルUX（タップターゲット拡大`PHONE_BTN`、safe-area対応、ランドスケープ折りたたみ、ボトムシート形式パネル）
- PWAインストール促進バナー

### 音響
- BGM（Web Audio API、和音生成）
- 天体別環境音（着陸モード全29天体対応、詳細は上記「着陸モード」参照）

## 注意事項

- `canvas.toDataURL` はArtifact環境でブロックされる（スクリーンショットはOSネイティブ機能を使用）
- BGMはブラウザのオートプレイ制限により手動で有効化が必要
- `localStorage` 使用キー: `solar_cfg`（表示設定）・`solar_bm`（ブックマーク）・`solar_analytics`（利用分析）・`solar_ob`（オンボード完了状態）・`solar_today`（今日のハイライト既読）・`solar_badges`（実績バッジ）・`solar_pwa_dismissed`（PWAバナー非表示）
- `var` 統一スタイル（`let`/`const` 不使用）— 既存コードに合わせること
- フレームループ内で `useRef` の `.current` を直接読み書き（`useState` の setter は非同期のため不可）
