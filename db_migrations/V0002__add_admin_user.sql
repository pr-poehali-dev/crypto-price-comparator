-- Insert admin user with hashed password
INSERT INTO users (email, password_hash, is_active, created_at)
VALUES (
  'dakmaghd@gmail.com',
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  true,
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET password_hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    is_active = true;