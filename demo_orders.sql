-- ============================================
-- DEMO ORDERS FOR AUTO-MATCHING TESTING
-- ============================================
-- Insert 9 demo orders scattered across Dar es Salaam
-- These orders will be auto-matched to the demo merchants

INSERT INTO orders (
    user_email,
    customer_name,
    customer_phone,
    delivery_latitude,
    delivery_longitude,
    delivery_address,
    order_status,
    order_items,
    created_at
) VALUES
-- Order 1: City Center (Ilala) - Near Tabata
(
    'hassan.juma@simba.local',
    'Hassan Juma',
    '+255 700 111 001',
    -6.8055,
    39.2310,
    'Tabata Main Street, Ilala',
    'pending',
    '[{"item": "Rice", "quantity": 50, "unit": "kg"}, {"item": "Beans", "quantity": 25, "unit": "kg"}]',
    NOW()
),

-- Order 2: Kariakoo Market area
(
    'amina.khalil@simba.local',
    'Amina Khalil',
    '+255 700 111 002',
    -6.8130,
    39.2215,
    'Kariakoo Market, Ilala',
    'pending',
    '[{"item": "Cooking Oil", "quantity": 20, "unit": "liters"}, {"item": "Sugar", "quantity": 30, "unit": "kg"}]',
    NOW()
),

-- Order 3: Msasani Peninsula - Kinondoni
(
    'john.mwangi@simba.local',
    'John Mwangi',
    '+255 700 111 003',
    -6.7660,
    39.2845,
    'Msasani Business Plaza, Kinondoni',
    'pending',
    '[{"item": "Flour", "quantity": 100, "unit": "kg"}, {"item": "Salt", "quantity": 10, "unit": "kg"}]',
    NOW()
),

-- Order 4: Oysterbay Area
(
    'zainab.rashid@simba.local',
    'Zainab Rashid',
    '+255 700 111 004',
    -6.7475,
    39.2955,
    'Oysterbay Commercial Area, Kinondoni',
    'pending',
    '[{"item": "Maize Meal", "quantity": 75, "unit": "kg"}, {"item": "Pasta", "quantity": 40, "unit": "kg"}]',
    NOW()
),

-- Order 5: Sinza Residential Area
(
    'peter.kimani@simba.local',
    'Peter Kimani',
    '+255 700 111 005',
    -6.7860,
    39.2655,
    'Sinza Housing Estate, Kinondoni',
    'pending',
    '[{"item": "Tea", "quantity": 15, "unit": "kg"}, {"item": "Coffee", "quantity": 10, "unit": "kg"}]',
    NOW()
),

-- Order 6: Makumbusho - Ubungo
(
    'rachel.kipchoge@simba.local',
    'Rachel Kipchoge',
    '+255 700 111 006',
    -6.8460,
    39.1915,
    'Makumbusho Market Area, Ubungo',
    'pending',
    '[{"item": "Honey", "quantity": 5, "unit": "liters"}, {"item": "Spices", "quantity": 3, "unit": "kg"}]',
    NOW()
),

-- Order 7: Chalinze - Temeke
(
    'samuel.kamau@simba.local',
    'Samuel Kamau',
    '+255 700 111 007',
    -6.9015,
    39.2135,
    'Chalinze Trading Zone, Temeke',
    'pending',
    '[{"item": "Eggs", "quantity": 500, "unit": "pieces"}, {"item": "Butter", "quantity": 20, "unit": "kg"}]',
    NOW()
),

-- Order 8: Kigamboni - Ubungo
(
    'amara.okafor@simba.local',
    'Amara Okafor',
    '+255 700 111 008',
    -6.8675,
    39.1655,
    'Kigamboni Port Area, Ubungo',
    'pending',
    '[{"item": "Fish Powder", "quantity": 12, "unit": "kg"}, {"item": "Dried Fish", "quantity": 25, "unit": "kg"}]',
    NOW()
),

-- Order 9: Kivukoni Front - Ilala
(
    'mustafa.hassan@simba.local',
    'Mustafa Hassan',
    '+255 700 111 009',
    -6.8210,
    39.2155,
    'Kivukoni Front Harbor, Ilala',
    'pending',
    '[{"item": "Tomatoes", "quantity": 80, "unit": "kg"}, {"item": "Onions", "quantity": 50, "unit": "kg"}]',
    NOW()
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Check total pending orders
SELECT 
    COUNT(*) as total_orders,
    SUM(CASE WHEN order_status = 'pending' THEN 1 ELSE 0 END) as pending_orders
FROM orders
WHERE customer_phone LIKE '+255 700 111%';

-- View all demo orders with their locations
SELECT 
    id,
    customer_name,
    delivery_address,
    delivery_latitude,
    delivery_longitude,
    order_status,
    created_at
FROM orders
WHERE customer_phone LIKE '+255 700 111%'
ORDER BY created_at DESC;

-- ============================================
-- AUTO-MATCHING TEST NOTES
-- ============================================
-- 1. Each order is placed at/near a demo merchant location
-- 2. Merchants are within 5km radius (default matching radius)
-- 3. Orders are set to 'pending' status - ready for auto-matching
-- 4. When admin triggers auto-matching, all 9 orders should match to nearby merchants
-- 5. Check the admin dashboard to see real-time matching results
-- 6. Monitor the 'Manual Required' count - should stay low if all match successfully
