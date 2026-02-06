
-- Run this in your Supabase SQL Editor to add the missing columns

ALTER TABLE restaurants 
ADD COLUMN latitude double precision,
ADD COLUMN longitude double precision;
