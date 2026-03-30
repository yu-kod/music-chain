# Music Chain

みんなで育てる音楽ネットワーク地図。曲と曲をつないで、1枚の巨大な音楽マップを作ろう。

**URL**: https://music-chain.yu-web.site

## 構成

```
music-chain.yu-web.site
        │
   Route 53 → CloudFront
   ├── /        → S3 (React SPA)
   └── /api/*   → API Gateway → Lambda → DynamoDB
```

## CI/CD

`main` ブランチに push すると GitHub Actions が自動デプロイする。

必要な GitHub Secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

## 手動デプロイ

```bash
# Lambda
npm run build:lambda
cd infra && terraform apply

# フロントエンド
npm run build:frontend
npm run deploy:sync
npm run deploy:invalidate

# 全部まとめて
npm run build
cd infra && terraform apply
npm run deploy:sync
npm run deploy:invalidate
```

## 初回セットアップ

```bash
# 依存関係
npm run install:all

# tfstate 用バケット作成（1回だけ）
cd infra/bootstrap && terraform init && terraform apply

# インフラ構築
cd .. && terraform init && terraform apply

# シードデータ投入
cd .. && npm run seed
```

## ローカル開発

```bash
# DynamoDB Local 起動
docker run -p 8000:8000 amazon/dynamodb-local

# テーブル作成
aws dynamodb create-table --endpoint-url http://localhost:8000 \
  --table-name music-chain-nodes \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

aws dynamodb create-table --endpoint-url http://localhost:8000 \
  --table-name music-chain-edges \
  --attribute-definitions AttributeName=from_node_id,AttributeType=S AttributeName=to_node_id,AttributeType=S \
  --key-schema AttributeName=from_node_id,KeyType=HASH AttributeName=to_node_id,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes '[{"IndexName":"gsi-to-node","KeySchema":[{"AttributeName":"to_node_id","KeyType":"HASH"},{"AttributeName":"from_node_id","KeyType":"RANGE"}],"Projection":{"ProjectionType":"ALL"}}]'

# シード＆起動
DYNAMODB_ENDPOINT=http://localhost:8000 npm run seed
DYNAMODB_ENDPOINT=http://localhost:8000 npm run dev
```

## npm scripts

| コマンド | 内容 |
|----------|------|
| `npm run dev` | ローカル開発サーバー起動 |
| `npm run build` | Lambda + Frontend ビルド |
| `npm run build:lambda` | Lambda バンドル (esbuild) |
| `npm run build:frontend` | Frontend ビルド (Vite) |
| `npm run deploy:sync` | S3 にフロントエンドをアップロード |
| `npm run deploy:invalidate` | CloudFront キャッシュ無効化 |
| `npm run seed` | DynamoDB にシードデータ投入 |
| `npm run install:all` | 全依存関係インストール |
