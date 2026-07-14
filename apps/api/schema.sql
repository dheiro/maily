-- schema.sql
DROP TABLE IF EXISTS emails;
DROP TABLE IF EXISTS domains;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

CREATE TABLE domains (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE emails (
    id TEXT PRIMARY KEY,
    "to" TEXT NOT NULL,
    "from" TEXT,
    subject TEXT,
    body_text TEXT,
    body_html TEXT,
    received_at TEXT NOT NULL,
    is_read INTEGER DEFAULT 0
);

INSERT OR IGNORE INTO users (id, username, password_hash)
VALUES ('6cf2e3a9-43b3-4e66-a586-523a82a08aab', 'admin', '97767050f4cad0ddbe9b4e779a806ced:87986ccb7e449e7280b55c31d160254a10360e46f228eaad24aab87ebd975ed6');
