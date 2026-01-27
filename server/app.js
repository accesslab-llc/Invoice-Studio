/**
 * InvoiceStudio バックエンド — Express アプリ例
 *
 * monday の Automation / Action から呼ぶ Custom Action Run URL 用。
 * エラーハンドリングは monday 公式形式に合わせており、Marketplace 審査を意識した設計です。
 * AMP（App Management Product）をプラン・アカウントの正の情報源とする設定を注入する。
 *
 * 起動例: node server/app.js （または server/index.js から import して listen）
 */

import express from 'express';
import { getAmpConfigFromEnv } from './config/ampConfig.js';
import { mondayErrorHandler } from './middleware/mondayErrorHandler.js';
import invoiceActionRoutes from './routes/invoiceAction.js';
import planExampleRoutes from './routes/planExample.js';

const app = express();

app.use(express.json());

// AMP 設定と runQuery を後差しで注入（ID 未確定時もロジック開発・テストが可能）
app.set('ampConfig', getAmpConfigFromEnv());
// 本番では monday GraphQL API を呼ぶ関数に差し替える。未設定時はダミーでよい。
app.set('runQuery', async () => ({ data: {} }));

// monday のペイロードは JSON で渡る想定
app.use('/invoice', invoiceActionRoutes);
// AMP ベースのプラン判定の使用例（GET /plan/status, POST /plan/can-export-pdf 等）
app.use('/plan', planExampleRoutes);

// ヘルスチェック（オプション）
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'InvoiceStudio' });
});

// ルートより後に登録する。未処理の MondayError / Error をここで monday 形式に変換
app.use(mondayErrorHandler);

export default app;
