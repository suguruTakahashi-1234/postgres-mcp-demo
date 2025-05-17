CREATE DATABASE mcp_test;

CREATE USER mcp_user WITH PASSWORD 'mcp_password';

GRANT ALL PRIVILEGES ON DATABASE mcp_test TO mcp_user;

\c mcp_test

CREATE TABLE test_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO test_table (name) VALUES 
    ('Test 1'),
    ('Test 2'),
    ('Test 3');

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mcp_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mcp_user;
