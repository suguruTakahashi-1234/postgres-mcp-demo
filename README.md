# PostgreSQL MCP Demo

このリポジトリは、最新バージョンのPostgreSQLを使用したMCP（Multi-Cloud Platform）接続テスト用のデモサービスです。

## 必要条件

- Docker
- Docker Compose

## 使い方

### サービスの起動

以下のコマンドでPostgreSQLサービスを起動します：

```bash
docker-compose up -d
```

### サービスの停止

```bash
docker-compose down
```

データを完全に削除する場合は、ボリュームも削除します：

```bash
docker-compose down -v
```

## 接続情報

### デフォルトのPostgreSQL接続情報

- ホスト: localhost
- ポート: 5432
- ユーザー名: postgres
- パスワード: postgres
- データベース: postgres

### テスト用接続情報

- ホスト: localhost
- ポート: 5432
- ユーザー名: mcp_user
- パスワード: mcp_password
- データベース: mcp_test

## テストデータ

サービス起動時に自動的に以下のテストデータが作成されます：

- `mcp_test` データベース
- `test_table` テーブル（いくつかのサンプルデータ付き）

## MCPでの接続テスト

このサービスはMCP環境での接続テストに使用できます。異なるクラウドプラットフォームからこのPostgreSQLインスタンスに接続し、接続性と機能をテストすることができます。
