# 現代日本の教育（modern-japanese-education）

このリポジトリは、現代日本の教育に関する情報を整理・公開するためのウェブサイト開発プロジェクトです。

---

## 📌 プロジェクト概要
- **目的**：教育制度・歴史・課題をわかりやすく紹介するウェブサイトを構築
- **公開方法**：GitHubで開発し、完成したファイルをレンタルサーバーにアップロードして公開
- **対象ユーザー**：一般公開（教育関係者・学生・研究者など）

---

## 🌐 公開URL
- **ステージング**：https://dev.modern.co.jp
- **本番**：https://edu.modern.co.jp

---

## 📂 ディレクトリ構成
```
/
├── index.html        # トップページ
├── script.js         # JavaScript
├── styles.css        # メインCSS
├── styles/           # CSS関連フォルダ
├── public/           # 画像・静的アセット
├── send-mail.php     # メール送信処理
├── contact.php       # 問い合わせフォーム
├── robots.txt        # 検索エンジン制御
├── sitemap.xml       # サイトマップ
└── favicon.ico       # ファビコン
```

---

## 🚀 公開手順（SSH/rsync）
1. 最新ソースを取得
   ```bash
   git clone https://github.com/kurukobaweb/modern-japanese-education.git
   ```
2. ステージングへアップロード
   ```bash
   rsync -avz --delete ./ user@server:/path/to/staging/
   ```
3. ステージングで動作確認（表示崩れ・リンク・フォーム）
4. 本番へアップロード（確認後）
   ```bash
   rsync -avz --delete ./ user@server:/path/to/public_html/
   ```

---

## ✅ 注意事項
- **相対パス統一**：CSS・JS・画像は `./` で指定
- **文字コード**：`<meta charset="UTF-8">` を確認
- **SEOタグ**：`<meta name="description">`、OGPタグ設定済み
- **robots.txt / sitemap.xml**：検索エンジン対応済み

---

## 🔒 セキュリティ
脆弱性報告は https://github.com/kurukobaweb/modern-japanese-education/issues またはメールでお願いします。

---

## 📄 ライセンス
MIT License
