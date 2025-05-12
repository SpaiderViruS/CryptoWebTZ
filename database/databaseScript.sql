-- Таблица: users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица: reviews
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    text TEXT,
    author_name VARCHAR(100),
    created_at TIMESTAMP,
    rating INTEGER NOT NULL,
    client_uuid UUID
);

-- Таблица: notification_contacts
CREATE TABLE IF NOT EXISTS notification_contacts (
    id SERIAL PRIMARY KEY,
    telegram_account VARCHAR(255) NOT NULL,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    username VARCHAR(255)
);

-- Таблица: files
CREATE TABLE IF NOT EXISTS files (
    id SERIAL PRIMARY KEY,
    file_name VARCHAR(120) NOT NULL,
    content_id INTEGER NOT NULL,
    file_bin BYTEA
);

-- Таблица: file_content
CREATE TABLE IF NOT EXISTS file_content (
    id SMALLINT PRIMARY KEY,
    value_full VARCHAR(60),
    value_short VARCHAR(120)
);

-- Таблица: fees_limits
CREATE TABLE IF NOT EXISTS fees_limits (
    id SERIAL PRIMARY KEY,
    currency_pair_id INTEGER NOT NULL,
    commission NUMERIC(10,2) NOT NULL,
    min_amount NUMERIC(20,8) NOT NULL,
    max_amount NUMERIC(20,8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица: exchange_requests
CREATE TABLE IF NOT EXISTS exchange_requests (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sell_amount NUMERIC(20,8) NOT NULL,
    buy_amount NUMERIC(20,8) NOT NULL,
    wallet_address VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'новая',
    exchange_rate NUMERIC(20,8),
    commission NUMERIC(10,2),
    currency_pair_id INTEGER,
    client_uuid UUID
);

-- Таблица: exchange_rates
CREATE TABLE IF NOT EXISTS exchange_rates (
    id SERIAL PRIMARY KEY,
    currency_pair_id INTEGER NOT NULL,
    rate NUMERIC(20,8) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица: currencys
CREATE TABLE IF NOT EXISTS currencys (
    id SERIAL PRIMARY KEY,
    value_full VARCHAR(60),
    value_short VARCHAR(120),
    icon_id INTEGER
);

-- Таблица: currency_pairs
CREATE TABLE IF NOT EXISTS currency_pairs (
    id SERIAL PRIMARY KEY,
    is_active BOOLEAN,
    icon VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    buy_currency INTEGER NOT NULL,
    sell_currency INTEGER NOT NULL
);

CREATE TABLE chat (
    id SERIAL PRIMARY KEY,
    manager_id INTEGER,
    text TEXT,
    timestamp TIMESTAMP WITHOUT TIME ZONE,
    client_id UUID
);
