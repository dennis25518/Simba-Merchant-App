-- ============================================
-- DEMO MERCHANTS FOR DAR ES SALAAM
-- ============================================
-- Insert 9 demo merchants scattered across Dar es Salaam
-- These merchants will be used to test the auto-matching system

INSERT INTO merchant (
    email,
    store_name,
    owner_name,
    partner_type,
    phone,
    location,
    latitude,
    longitude,
    status,
    role,
    created_at,
    auth_id
) VALUES
-- 1. Ilala District - City Center
(
    'tabata.wholesale@simba.local',
    'Tabata Wholesale Hub',
    'Ahmed Hassan',
    'wholesale',
    '+255 789 123 001',
    'Tabata, Ilala - City Center',
    -6.8048,
    39.2304,
    'active',
    'user',
    NOW(),
    NULL
),

-- 2. Ilala District - Kariakoo Market
(
    'kariakoo.supplies@simba.local',
    'Kariakoo Premium Supplies',
    'Fatima Mohamed',
    'wholesale',
    '+255 789 123 002',
    'Kariakoo Market, Ilala',
    -6.8120,
    39.2220,
    'active',
    'user',
    NOW(),
    NULL
),

-- 3. Kinondoni District - Msasani
(
    'msasani.traders@simba.local',
    'Msasani Quality Traders',
    'John Mwase',
    'wholesale',
    '+255 789 123 003',
    'Msasani Peninsula, Kinondoni',
    -6.7650,
    39.2850,
    'active',
    'user',
    NOW(),
    NULL
),

-- 4. Kinondoni District - Oysterbay
(
    'oysterbay.merchant@simba.local',
    'Oysterbay Express Merchant',
    'Zainab Ibrahim',
    'wholesale',
    '+255 789 123 004',
    'Oysterbay, Kinondoni',
    -6.7480,
    39.2950,
    'active',
    'user',
    NOW(),
    NULL
),

-- 5. Kinondoni District - Sinza
(
    'sinza.distribution@simba.local',
    'Sinza Distribution Center',
    'Peter Mugyenyi',
    'manufacturer',
    '+255 789 123 005',
    'Sinza, Kinondoni',
    -6.7850,
    39.2650,
    'active',
    'user',
    NOW(),
    NULL
),

-- 6. Ubungo District - Makumbusho
(
    'makumbusho.supplies@simba.local',
    'Makumbusho Supplies Ltd',
    'Rachel Kipchoge',
    'wholesale',
    '+255 789 123 006',
    'Makumbusho, Ubungo',
    -6.8450,
    39.1920,
    'active',
    'user',
    NOW(),
    NULL
),

-- 7. Temeke District - Chalinze
(
    'chalinze.merchants@simba.local',
    'Chalinze Trading Post',
    'Samuel Kwame',
    'wholesale',
    '+255 789 123 007',
    'Chalinze, Temeke',
    -6.9020,
    39.2130,
    'active',
    'user',
    NOW(),
    NULL
),

-- 8. Ubungo District - Kigamboni
(
    'kigamboni.wholesale@simba.local',
    'Kigamboni Wholesale Center',
    'Amara Okonkwo',
    'manufacturer',
    '+255 789 123 008',
    'Kigamboni, Ubungo',
    -6.8680,
    39.1650,
    'active',
    'user',
    NOW(),
    NULL
),

-- 9. Ilala District - Kivukoni
(
    'kivukoni.express@simba.local',
    'Kivukoni Express Depot',
    'Mustafa Hassan',
    'wholesale',
    '+255 789 123 009',
    'Kivukoni Front, Ilala',
    -6.8200,
    39.2150,
    'active',
    'user',
    NOW(),
    NULL
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
AND store_name LIKE '%' AND status = 'active';

-- View all demo merchants
SELECT 
    id,
    store_name,
    owner_name,
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
-- 2. All merchants are scattered across different areas of Dar es Salaam
-- 3. GPS coordinates are realistic Dar coordinates
-- 4. Email format: {area}.{type}@simba.local for easy identification
-- 5. All merchants have unique phone numbers for SMS verification later
-- 6. Partner types mix between 'wholesale' and 'manufacturer'
-- 7. auth_id is NULL - these are demo accounts without Supabase Auth users
-- 8. When ready to connect with Supabase Auth, update auth_id with real user IDs
