-- 1. We need to clear the existing data because 'bigint' (numbers) cannot be automatically converted to 'uuid' (text-based IDs).
DELETE FROM bookings;

-- 2. Now that the table is empty, we can safely change the column type to UUID.
ALTER TABLE bookings ALTER COLUMN user_id TYPE uuid USING NULL;

-- 3. If your restaurant IDs are also UUIDs (long strings), run the line below too. 
-- If your restaurant IDs are numbers (1, 2, 3), SKIP this line.
ALTER TABLE bookings ALTER COLUMN restaurant_id TYPE uuid USING NULL;

-- 4. Add the booking_code column if it's missing
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_code text;
