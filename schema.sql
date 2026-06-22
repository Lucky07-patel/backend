CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  business_name VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  ai_score VARCHAR(20),
  ai_reason TEXT,
  ai_email_draft TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);