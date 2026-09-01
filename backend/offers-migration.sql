CREATE TABLE IF NOT EXISTS offers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NULL,
  discount_type ENUM('percentage','fixed','text') NOT NULL DEFAULT 'percentage',
  discount_value DECIMAL(10,2) NULL,
  promo_code VARCHAR(50) NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_offers_active ON offers(active);
CREATE INDEX idx_offers_dates ON offers(start_date, end_date);
CREATE INDEX idx_offers_featured ON offers(is_featured);
