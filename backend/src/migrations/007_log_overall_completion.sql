ALTER TABLE raw_log_plus
  ADD COLUMN IF NOT EXISTS overall_completion DECIMAL(5,2);
