-- Обновить пароль для админа maga
UPDATE t_p37207906_crypto_price_compara.platform_users 
SET password = 'magamaga1010'
WHERE login = 'maga';

-- Создать тестовый аккаунт maga_test с паролем 1234
INSERT INTO t_p37207906_crypto_price_compara.platform_users (login, password, is_active, registered_at)
VALUES ('maga_test', '1234', true, NOW())
ON CONFLICT (login) DO UPDATE 
SET password = '1234';