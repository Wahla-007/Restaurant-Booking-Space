-- Add status column to bookings table to handle cancellations
-- Default is 'confirmed'. Other values: 'cancelled', 'completed'
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS status text DEFAULT 'confirmed';
