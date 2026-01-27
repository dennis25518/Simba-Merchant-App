-- ============================================
-- DEMO MERCHANTS FOR DAR ES SALAAM
-- ============================================
-- Insert 9 demo merchants scattered across Dar es Salaam
-- These merchants will be used to test the auto-matching system

INSERT INTO merchant (
    email,
    store_name,
    partner_type,
    phone,
    location,
    latitude,
    longitude,
    status,
    role,
    created_at
) VALUES
-- 1. Ilala District - City Center
(
    'tabata.wholesale@simba.local',
    'Tabata Wholesale Hub',
    'wholesale',
    '+255 789 123 001',
    'Tabata, Ilala - City Center',
    -6.80480000,
    39.23040000,
    'active',
    'user',
    NOW()
),

-- 2. Ilala District - Kariakoo Market
(
    'kariakoo.supplies@simba.local',
    'Kariakoo Premium Supplies',
    'wholesale',
    '+255 789 123 002',
    'Kariakoo Market, Ilala',
    -6.81200000,
    39.22200000,
    'active',
    'user',
    NOW()
),

-- 3. Kinondoni District - Msasani
(
    'msasani.traders@simba.local',
    'Msasani Quality Traders',
    'wholesale',
    '+255 789 123 003',
    'Msasani Peninsula, Kinondoni',
    -6.76500000,
    39.28500000,
    'active',
    'user',
    NOW()
),

-- 4. Kinondoni District - Oysterbay
(
    'oysterbay.merchant@simba.local',
    'Oysterbay Express Merchant',
    'wholesale',
    '+255 789 123 004',
    'Oysterbay, Kinondoni',
    -6.74800000,
    39.29500000,
    'active',
    'user',
    NOW()
),

-- 5. Kinondoni District - Sinza
(
    'sinza.distribution@simba.local',
    'Sinza Distribution Center',
    'manufacturer',
    '+255 789 123 005',
    'Sinza, Kinondoni',
    -6.78500000,
    39.26500000,
    'active',
    'user',
    NOW()
),

-- 6. Ubungo District - Makumbusho
(
    'makumbusho.supplies@simba.local',
    'Makumbusho Supplies Ltd',
    'wholesale',
    '+255 789 123 006',
    'Makumbusho, Ubungo',
    -6.84500000,
    39.19200000,
    'active',
    'user',
    NOW()
),

-- 7. Temeke District - Chalinze
(
    'chalinze.merchants@simba.local',
    'Chalinze Trading Post',
    'wholesale',
    '+255 789 123 007',
    'Chalinze, Temeke',
    -6.90200000,
    39.21300000,
    'active',
    'user',
    NOW()
),

-- 8. Ubungo District - Kigamboni
(
    'kigamboni.wholesale@simba.local',
    'Kigamboni Wholesale Center',
    'manufacturer',
    '+255 789 123 008',
    'Kigamboni, Ubungo',
    -6.86800000,
    39.16500000,
    'active',
    'user',
    NOW()
),

-- 9. Ilala District - Kivukoni
(
    'kivukoni.express@simba.local',
    'Kivukoni Express Depot',
    'wholesale',
    '+255 789 123 009',
    'Kivukoni Front, Ilala',
    -6.82000000,
    39.21500000,
    'active',
    'user',
    NOW()
);

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify all 9 merchants were inserted
SELECT 
    COUNT(*) as total_merchants,
    AVG(latitude) as avg_latitude,
    AVG(longitude) as avg_longitude
FROM merchant
WHERE email LIKE '%.local'
AND status = 'active';

-- View all demo merchants with GPS coordinates
SELECT 
    id,
    store_name,
    partner_type,
    phone,
    location,
    latitude,
    longitude,
    status
FROM merchant
WHERE email LIKE '%.local'
ORDER BY location;

-- ============================================
-- NOTES
-- ============================================
-- 1. All merchants are set to 'active' status
-- 2. Email format: {area}.{type}@simba.local for easy identification
-- 3. All merchants have unique phone numbers
-- 4. Partner types mix between 'wholesale' and 'manufacturer'
-- 5. Created with current timestamp for tracking
-- 6. GPS coordinates are realistic Dar es Salaam locations
-- 7. Before running this script, ensure merchant table has latitude/longitude columns
--    Run migration_add_gps_columns.sql first if columns don't exist
-- 8. After insertion, run the verification queries to confirm all 9 merchants loaded correctly
