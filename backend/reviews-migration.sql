ALTER TABLE reviews
  ADD COLUMN status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending' AFTER approved,
  ADD COLUMN source ENUM('manual','google') NOT NULL DEFAULT 'manual' AFTER status,
  ADD COLUMN google_review_id VARCHAR(255) NULL AFTER source,
  ADD COLUMN google_location_id VARCHAR(255) NULL AFTER google_review_id,
  ADD COLUMN featured TINYINT(1) NOT NULL DEFAULT 0 AFTER google_location_id;

UPDATE reviews
SET
  status = CASE
    WHEN approved = 1 THEN 'approved'
    ELSE 'pending'
  END,
  source = 'manual',
  featured = 0
WHERE status IS NULL OR status = '';

CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_source ON reviews(source);
CREATE INDEX idx_reviews_featured ON reviews(featured);
