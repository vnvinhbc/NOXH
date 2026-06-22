ALTER TABLE lottery_event
ADD COLUMN scheduled_start_at TIMESTAMP;

UPDATE lottery_event
SET scheduled_start_at = COALESCE(locked_at + INTERVAL '15 minutes 30 seconds', created_at + INTERVAL '15 minutes 30 seconds')
WHERE scheduled_start_at IS NULL;
