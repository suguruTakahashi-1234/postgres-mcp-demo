# PostgreSQL MCP Demo

このリポジトリは、最新バージョンのPostgreSQLを使用したMCP（Multi-Cloud Platform）接続テスト用のデモサービスです。

## 必要条件

- Docker
- Docker Compose

## セットアップ

1. 環境変数の設定

`.env.example`ファイルを`.env`にコピーして、必要に応じて値を変更します：

```bash
cp .env.example .env
```

デフォルトの環境変数：

```
# PostgreSQL default credentials
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres

# MCP test database credentials
MCP_TEST_USER=mcp_user
MCP_TEST_PASSWORD=mcp_password
MCP_TEST_DB=mcp_test
```

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
- ユーザー名: `.env`ファイルの`POSTGRES_USER`の値（デフォルト: postgres）
- パスワード: `.env`ファイルの`POSTGRES_PASSWORD`の値（デフォルト: postgres）
- データベース: `.env`ファイルの`POSTGRES_DB`の値（デフォルト: postgres）

### テスト用接続情報

- ホスト: localhost
- ポート: 5432
- ユーザー名: `.env`ファイルの`MCP_TEST_USER`の値（デフォルト: mcp_user）
- パスワード: `.env`ファイルの`MCP_TEST_PASSWORD`の値（デフォルト: mcp_password）
- データベース: `.env`ファイルの`MCP_TEST_DB`の値（デフォルト: mcp_test）

## テストデータ

サービス起動時に自動的に以下のテストデータが作成されます：

- テスト用データベース（デフォルト: `mcp_test`）
- `test_table` テーブル（いくつかのサンプルデータ付き）

## MCPでの接続テスト

このサービスはMCP環境での接続テストに使用できます。異なるクラウドプラットフォームからこのPostgreSQLインスタンスに接続し、接続性と機能をテストすることができます。

## セキュリティに関する注意

本番環境で使用する場合は、`.env`ファイルに強力なパスワードを設定してください。`.env`ファイルはGitリポジトリにコミットしないでください（`.gitignore`に追加済み）。
