
CREATE TABLE IF NOT EXISTS t_p37207906_crypto_price_compara.platform_users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    token_used VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE
);
