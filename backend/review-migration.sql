ALTER TABLE reviews
  ADD COLUMN status ENUM('pending', 'approved', 'rejected')
  NOT NULL DEFAULT 'pending';

ALTER TABLE reviews
  ADD COLUMN source ENUM('manual', 'google')
  NOT NULL DEFAULT 'manual';

ALTER TABLE reviews
  ADD COLUMN google_review_id VARCHAR(255) NULL;

ALTER TABLE reviews
  ADD COLUMN google_location_id VARCHAR(255) NULL;

ALTER TABLE reviews
  ADD COLUMN featured TINYINT(1) NOT NULL DEFAULT 0;

UPDATE reviews
SET status = CASE
  WHEN approved = 1 THEN 'approved'
  ELSE 'pending'
END;

UPDATE reviews
SET source = 'manual'
WHERE source IS NULL;

CREATE INDEX idx_reviews_status
  ON reviews(status);

CREATE INDEX idx_reviews_source
  ON reviews(source);

CREATE INDEX idx_reviews_google_review_id
  ON reviews(google_review_id);