\set mcp_test_db `echo "$MCP_TEST_DB"`
\set mcp_test_user `echo "$MCP_TEST_USER"`
\set mcp_test_password `echo "$MCP_TEST_PASSWORD"`

CREATE DATABASE :"mcp_test_db";

CREATE USER :"mcp_test_user" WITH PASSWORD :'mcp_test_password';

GRANT ALL PRIVILEGES ON DATABASE :"mcp_test_db" TO :"mcp_test_user";

\c :mcp_test_db

CREATE TABLE test_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO test_table (name) VALUES 
    ('Test 1'),
    ('Test 2'),
    ('Test 3');

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO :"mcp_test_user";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO :"mcp_test_user";
