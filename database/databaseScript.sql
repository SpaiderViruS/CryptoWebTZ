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
  telegram_account VARCHAR(255) NOT NULL UNIQUE,
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
  chat_session_id INTEGER REFERENCES chat_sessions(id),
  text TEXT NOT NULL,
  from_type TEXT CHECK (from_type IN ('client', 'manager')),
  from_id TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE chat_sessions (
  id SERIAL PRIMARY KEY,
  client_id TEXT NOT NULL,
  manager_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- users
INSERT INTO users (username, password_hash, role)
VALUES ('ER', '1234', 'администратор');

-- currencys
INSERT INTO currencys (id, value_full, value_short, icon_id)
VALUES 
  (1, 'RUB', 'RUB', 1),
  (2, 'USDT TRC20', 'USDT TRC20', 2);

-- currency_pairs
INSERT INTO currency_pairs (id, is_active, icon, buy_currency, sell_currency)
VALUES (2, true, NULL, 2, 1);

-- fees_limits
INSERT INTO fees_limits (currency_pair_id, commission, min_amount, max_amount)
VALUES 
  (1, 1.00, 1.0, 1000.0),
  (2, 1.50, 5.0, 100000.0);