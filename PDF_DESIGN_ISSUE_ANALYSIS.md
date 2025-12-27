# PDF出力でデザインが消える問題の原因分析

## 問題の原因

### 1. html2canvasのiframe内スタイルキャプチャの制限

**主な原因**: html2canvasは、iframe内のCSSスタイルを正しくキャプチャできない場合があります。

- iframe内でHTMLをレンダリングしているが、html2canvasがクロスオリジンの制約やiframe内のスタイルを正しく処理できない
- `<style>`タグの内容がiframe内で正しく適用されていても、html2canvasがキャプチャ時に失う可能性がある
- 特に、動的に生成されたスタイルや複雑なCSSセレクタが正しく反映されない

### 2. html2pdf.jsの制限

html2pdf.jsは内部的にhtml2canvasとjsPDFを使用していますが、以下の制限があります：

- **CSSの適用漏れ**: 外部スタイルシートや特定のCSSルールが無視される
- **要素の位置やサイズの問題**: 画面外の要素やサイズが大きすぎる要素が正しくレンダリングされない
- **バージョン依存の問題**: html2canvasの特定のバージョンで不具合が報告されている

### 3. 現在の実装の問題点

```javascript
// 現在の実装
const iframe = document.createElement('iframe');
iframeDoc.write(html); // HTMLをiframe内に書き込み
await html2pdf().set(opt).from(iframeBody).save(); // iframe内の要素をキャプチャ
```

**問題**:
- iframe内のスタイルがhtml2canvasに正しく伝わらない
- `onclone`コールバックでスタイルをコピーしているが、完全ではない
- iframeのサイズ制約により、レイアウトが崩れる可能性がある

## 解決策の比較

### オプション1: プレビュー要素を直接キャプチャ（推奨）

**メリット**:
- 既に正しく表示されているプレビュー要素をそのまま使用
- スタイルが完全に適用されている
- iframeの問題を回避できる

**デメリット**:
- プレビュー画面が表示されている必要がある
- ユーザーに見える要素をキャプチャする

**実装**:
```javascript
// プレビュー画面の要素を直接取得
const previewElement = document.querySelector('.invoice-preview');
await html2pdf().set(opt).from(previewElement).save();
```

### オプション2: インラインスタイルを使用

**メリット**:
- CSSの適用漏れを防げる
- スタイルが確実に反映される

**デメリット**:
- HTMLのサイズが大きくなる
- メンテナンスが困難

### オプション3: 別のPDFライブラリに変更

**候補**:
- **pdfmake**: HTMLから直接PDF生成（ただし、HTMLをpdfmakeのドキュメント定義に変換する必要がある）
- **jsPDF + html2canvas**: html2pdf.jsの代わりに直接使用（より細かい制御が可能）
- **Puppeteer（サーバーサイド）**: サーバーでPDF生成（クライアントサイドでは使用不可）

## 推奨される解決策

### 最推奨: プレビュー要素を直接キャプチャ

既にプレビュー画面で正しく表示されている要素を直接キャプチャする方法が最も確実です。

**理由**:
1. プレビュー画面では既にスタイルが正しく適用されている
2. iframeの問題を完全に回避できる
3. 実装が簡単で確実

**実装方針**:
1. プレビュー画面の要素にIDまたはクラスを追加
2. その要素を直接html2pdf.jsでキャプチャ
3. 必要に応じて、一時的にプレビュー要素を非表示にしてキャプチャ

### 次点: html2canvasの設定を改善

現在の実装を維持しつつ、html2canvasの設定を改善：

1. `foreignObjectRendering: true`を追加
2. `removeContainer: false`を追加
3. より長い待機時間を設定
4. スタイルのインライン化を検討

## 結論

**原因**: html2pdf.js（html2canvas）がiframe内のCSSスタイルを正しくキャプチャできない

**最適な解決策**: プレビュー画面で既に正しく表示されている要素を直接キャプチャする

