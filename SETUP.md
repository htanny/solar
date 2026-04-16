# 🚀 htanny/solar へのアップロード手順

このZIPを展開してそのフォルダで作業します。

---

## ステップ 1: ZIPを展開してフォルダに移動

```bash
# ZIPを展開した後
cd solar-system-simulator-repo/repo
# ※展開先のパスは環境により異なります
```

---

## ステップ 2: Git初期化 → コミット → プッシュ

```bash
# Git初期化
git init
git branch -M main

# ファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit: v2.0 solar system simulator"

# htanny/solar リポジトリと紐付け
git remote add origin https://github.com/htanny/solar.git

# プッシュ
git push -u origin main
```

### 既存の内容でコンフリクトする場合

リポジトリにすでに何か入っている場合:

```bash
git pull origin main --allow-unrelated-histories
# マージ後
git push -u origin main
```

または強制上書き（※既存の内容を消します）:

```bash
git push -u origin main --force
```

---

## ステップ 3: GitHub認証

初回プッシュ時は認証が必要です。

### Option A: Personal Access Token（PAT）

1. GitHubの [Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens) へ
2. `Generate new token (classic)` をクリック
3. スコープに `repo` をチェック
4. トークンをコピー（再表示不可なので必ず保存）
5. プッシュ時にユーザー名は `htanny`、パスワード欄に**トークン**を入力

### Option B: GitHub CLI（推奨）

```bash
# インストール: https://cli.github.com/
gh auth login
# → 対話形式でブラウザ認証
```

---

## ステップ 4: GitHub Pages を有効化

1. [https://github.com/htanny/solar/settings/pages](https://github.com/htanny/solar/settings/pages) を開く
2. **Source** セクションで:
   - `Deploy from a branch` → **`GitHub Actions`** に変更
3. 数分待つ

---

## ステップ 5: 自動デプロイの確認

1. [https://github.com/htanny/solar/actions](https://github.com/htanny/solar/actions) を開く
2. `Deploy to GitHub Pages` ワークフローが動いているのが見える
3. 緑のチェックマークが出たらデプロイ完了
4. 公開URL: **https://htanny.github.io/solar/**

---

## 設定済みのファイル

このZIPには既に `htanny/solar` 用の設定が入っています:

| ファイル | 設定 |
|---|---|
| `package.json` | name: `solar`, repository URL: `htanny/solar` |
| `vite.config.js` | base path: `/solar/` |
| `README.md` | ライブデモURL: `htanny.github.io/solar/` |

**追加の書き換えは不要です。** プッシュするだけで動作します。

---

## 日常的な開発フロー

```bash
# 変更を加える
vim src/App.jsx

# ローカルで確認
npm run dev

# コミット&プッシュ
git add .
git commit -m "Add: 新機能の説明"
git push

# → GitHub Actions が自動的にデプロイ
# → 数分後に https://htanny.github.io/solar/ で反映
```

---

## ブランチを使った開発（推奨）

```bash
# フィーチャーブランチ作成
git checkout -b feature/voyager-trajectory

# 開発・コミット
git add .
git commit -m "Add voyager trajectory"

# プッシュ
git push -u origin feature/voyager-trajectory

# GitHubでプルリクエストを作成
# マージ → mainにマージされたら自動デプロイ
```

---

## トラブルシューティング

### `git push` が認証エラー

- パスワードではなく**Personal Access Token**を使用
- または `gh auth login` でGitHub CLI認証

### デプロイが失敗する

1. `Actions` タブでエラーログを確認
2. ローカルで `npm install && npm run build` が成功するか確認

### ページが 404 になる

- `Settings → Pages` で Source が `GitHub Actions` になっているか確認
- Actions が成功しているか確認

### アセット（favicon等）が表示されない

- `vite.config.js` の `base: '/solar/'` が設定されているか確認
- Actions のビルドログで `GITHUB_PAGES=true` が設定されているか確認

---

## 便利なリンク

- リポジトリ: [https://github.com/htanny/solar](https://github.com/htanny/solar)
- Actions: [https://github.com/htanny/solar/actions](https://github.com/htanny/solar/actions)
- Pages設定: [https://github.com/htanny/solar/settings/pages](https://github.com/htanny/solar/settings/pages)
- ライブデモ（デプロイ後）: [https://htanny.github.io/solar/](https://htanny.github.io/solar/)

Happy coding! 🚀
