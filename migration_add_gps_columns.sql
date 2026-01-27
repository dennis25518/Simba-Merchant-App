-- ============================================
-- MIGRATION: Add GPS Coordinates to Merchant Table
-- ============================================
-- This migration adds latitude and longitude columns to the merchant table
-- to enable GPS-based auto-matching functionality

-- Step 1: Add latitude column
ALTER TABLE merchant
ADD COLUMN latitude DECIMAL(10, 8);

-- Step 2: Add longitude column
ALTER TABLE merchant
ADD COLUMN longitude DECIMAL(11, 8);

-- Step 3: Add comments for clarity
COMMENT ON COLUMN merchant.latitude IS 'Decimal latitude for GPS location (-90 to 90)';
COMMENT ON COLUMN merchant.longitude IS 'Decimal longitude for GPS location (-180 to 180)';

-- Step 4: Create index for faster geospatial queries
-- This index helps with location-based searches
CREATE INDEX idx_merchant_location ON merchant(latitude, longitude);

-- ============================================
-- VERIFICATION
-- ============================================
-- Check if columns were added successfully
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'merchant'
AND column_name IN ('latitude', 'longitude')
ORDER BY ordinal_position;

-- View merchant table structure
\d merchant;

-- ============================================
-- NOTES
-- ============================================
-- 1. Latitude ranges from -90 (South Pole) to 90 (North Pole)
-- 2. Longitude ranges from -180 (West) to 180 (East)
-- 3. Dar es Salaam coordinates are approximately:
--    Latitude: -6.8 to -7.0
--    Longitude: 39.1 to 39.3
-- 4. The index will improve query performance for location-based searches
-- 5. These columns are nullable by default - you can update existing merchants
-- 6. After running this migration, run demo_merchants.sql to populate GPS data
