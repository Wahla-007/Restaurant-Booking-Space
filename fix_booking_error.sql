-- Run this SQL in your Supabase Dashboard SQL Editor to fix the schema mismatches.

-- 1. Add the missing booking_code column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_code text;

-- 2. Fix the "invalid input syntax for type bigint" error.
-- This error happens because your 'users' or 'restaurants' tables use UUIDs (text-like IDs), 
-- but your 'bookings' table was created expecting Numbers (bigint).

-- We will change the columns to UUID. 
-- IMPORTANT: This works best if the table is empty or compatible. 
-- If you get an error converting types and don't care about old test bookings, run: DELETE FROM bookings; before these ALTERs.

ALTER TABLE bookings ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE bookings ALTER COLUMN restaurant_id TYPE uuid USING restaurant_id::uuid;

-- If 'restaurants' table actually uses numbers (bigint) for its ID, DO NOT run the restaurant_id line above.
-- However, the error log showed a UUID being rejected, so it's likely one of these two.
