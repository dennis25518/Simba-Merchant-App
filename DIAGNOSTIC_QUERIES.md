# DIAGNOSTIC QUERIES - Run These in Supabase SQL Editor

## Check 1: Do merchants have GPS columns?
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'merchant' 
ORDER BY ordinal_position;
```

**Expected to see:**
- id
- partner_name
- email
- phone
- latitude ← Should be DECIMAL(10,8)
- longitude ← Should be DECIMAL(11,8)
- ... other columns

**If NO latitude/longitude columns: The migration was NOT run!**

---

## Check 2: How many merchants exist?
```sql
SELECT COUNT(*) as total_merchants,
       COUNT(CASE WHEN latitude IS NOT NULL THEN 1 END) as with_gps
FROM merchant;
```

**Expected Result:**
- total_merchants: 9 (demo merchants)
- with_gps: 9 (all have GPS)

**If total_merchants = 0: demo_merchants.sql was NOT run!**

---

## Check 3: Which orders have GPS data?
```sql
SELECT id, customer_name, 
       CASE WHEN delivery_latitude IS NOT NULL THEN 'HAS GPS' ELSE 'NO GPS' END as gps_status
FROM orders
LIMIT 25;
```

**Expected:**
- Demo orders (8-24): Should say "HAS GPS"
- Old orders (1-7): Might say "NO GPS"

---

## Check 4: Are there any errors in the orders?
```sql
SELECT id, customer_name, delivery_latitude, delivery_longitude, order_status 
FROM orders 
WHERE delivery_latitude IS NULL 
LIMIT 5;
```

**If this returns rows: Those orders are missing GPS data and will fail matching!**

---

## CRITICAL: Required Setup (If Any Checks Failed)

### Step 1: Add GPS Columns to Merchant Table
Copy and run in Supabase SQL Editor:

```sql
-- Check if columns exist first
ALTER TABLE merchant
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);

ALTER TABLE merchant
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_merchant_location ON merchant(latitude, longitude);

-- Verify
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'merchant' 
AND column_name IN ('latitude', 'longitude');
```

### Step 2: Add Demo Merchants with GPS
Copy and run in Supabase SQL Editor:

```sql
INSERT INTO merchant (
    partner_name,
    email,
    phone,
    partner_type,
    status,
    latitude,
    longitude,
    created_at
) VALUES
('Tabata Wholesale', 'tabata.wholesale@simba.local', '+255 700 111 100', 'wholesale', 'active', -6.80480000, 39.23040000, NOW()),
('Kariakoo Retail', 'kariakoo.retail@simba.local', '+255 700 111 101', 'manufacturer', 'active', -6.81200000, 39.22200000, NOW()),
('Msasani Traders', 'msasani.traders@simba.local', '+255 700 111 102', 'wholesale', 'active', -6.76500000, 39.28500000, NOW()),
('Oysterbay Commerce', 'oysterbay.commerce@simba.local', '+255 700 111 103', 'manufacturer', 'active', -6.74800000, 39.29500000, NOW()),
('Sinza Supplies', 'sinza.supplies@simba.local', '+255 700 111 104', 'wholesale', 'active', -6.78500000, 39.26500000, NOW()),
('Makumbusho Market', 'makumbusho.market@simba.local', '+255 700 111 105', 'manufacturer', 'active', -6.84500000, 39.19200000, NOW()),
('Chalinze Trading', 'chalinze.trading@simba.local', '+255 700 111 106', 'wholesale', 'active', -6.90200000, 39.21300000, NOW()),
('Kigamboni Port', 'kigamboni.port@simba.local', '+255 700 111 107', 'manufacturer', 'active', -6.86800000, 39.16500000, NOW()),
('Kivukoni Front', 'kivukoni.front@simba.local', '+255 700 111 108', 'wholesale', 'active', -6.82000000, 39.21500000, NOW());
```

### Step 3: Update Old Orders (1-7) with GPS Data
Copy and run in Supabase SQL Editor:

```sql
UPDATE orders 
SET delivery_latitude = -6.8055,
    delivery_longitude = 39.2310
WHERE id = 1;

UPDATE orders 
SET delivery_latitude = -6.8130,
    delivery_longitude = 39.2215
WHERE id = 2;

UPDATE orders 
SET delivery_latitude = -6.7660,
    delivery_longitude = 39.2845
WHERE id = 3;

UPDATE orders 
SET delivery_latitude = -6.7475,
    delivery_longitude = 39.2955
WHERE id = 4;

UPDATE orders 
SET delivery_latitude = -6.7860,
    delivery_longitude = 39.2655
WHERE id = 5;

UPDATE orders 
SET delivery_latitude = -6.8460,
    delivery_longitude = 39.1915
WHERE id = 6;

UPDATE orders 
SET delivery_latitude = -6.9015,
    delivery_longitude = 39.2135
WHERE id = 7;
```

---

## After Running the Setup

1. Run Check 1-4 again to verify everything
2. Refresh Admin Dashboard (Ctrl+Shift+R)
3. Check Console - should now see matching happening
4. Watch dashboard cards update

**Report back with Check 1-4 results!**
