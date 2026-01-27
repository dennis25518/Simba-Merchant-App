# Demo Data Setup Guide

This guide explains how to set up demo merchants and orders to test the Simba Express auto-matching system.

## Files Included

1. **demo_merchants.sql** - 9 demo merchants scattered across Dar es Salaam
2. **demo_orders.sql** - 9 demo orders for testing auto-matching

## Quick Setup

### Step 1: Insert Demo Merchants

Go to your Supabase dashboard and run this SQL:

```sql
-- Copy entire contents of demo_merchants.sql and run in Supabase SQL Editor
```

**Result:** 9 merchants will be created:
- Tabata Wholesale Hub (Ilala)
- Kariakoo Premium Supplies (Ilala)
- Msasani Quality Traders (Kinondoni)
- Oysterbay Express Merchant (Kinondoni)
- Sinza Distribution Center (Kinondoni)
- Makumbusho Supplies Ltd (Ubungo)
- Chalinze Trading Post (Temeke)
- Kigamboni Wholesale Center (Ubungo)
- Kivukoni Express Depot (Ilala)

### Step 2: Insert Demo Orders

Run this SQL in the same editor:

```sql
-- Copy entire contents of demo_orders.sql and run in Supabase SQL Editor
```

**Result:** 9 orders will be created in 'pending' status, ready for auto-matching.

## Demo Merchant Details

| # | Store Name | Area | Latitude | Longitude | Type | Phone |
|---|---|---|---|---|---|---|
| 1 | Tabata Wholesale Hub | Ilala | -6.8048 | 39.2304 | Wholesale | +255 789 123 001 |
| 2 | Kariakoo Premium Supplies | Ilala | -6.8120 | 39.2220 | Wholesale | +255 789 123 002 |
| 3 | Msasani Quality Traders | Kinondoni | -6.7650 | 39.2850 | Wholesale | +255 789 123 003 |
| 4 | Oysterbay Express Merchant | Kinondoni | -6.7480 | 39.2950 | Wholesale | +255 789 123 004 |
| 5 | Sinza Distribution Center | Kinondoni | -6.7850 | 39.2650 | Manufacturer | +255 789 123 005 |
| 6 | Makumbusho Supplies Ltd | Ubungo | -6.8450 | 39.1920 | Wholesale | +255 789 123 006 |
| 7 | Chalinze Trading Post | Temeke | -6.9020 | 39.2130 | Wholesale | +255 789 123 007 |
| 8 | Kigamboni Wholesale Center | Ubungo | -6.8680 | 39.1650 | Manufacturer | +255 789 123 008 |
| 9 | Kivukoni Express Depot | Ilala | -6.8200 | 39.2150 | Wholesale | +255 789 123 009 |

## Demo Order Details

| # | Customer | Delivery Area | Status |
|---|---|---|---|
| 1 | Hassan Juma | Tabata Main Street, Ilala | pending |
| 2 | Amina Khalil | Kariakoo Market, Ilala | pending |
| 3 | John Mwangi | Msasani Business Plaza, Kinondoni | pending |
| 4 | Zainab Rashid | Oysterbay Commercial Area, Kinondoni | pending |
| 5 | Peter Kimani | Sinza Housing Estate, Kinondoni | pending |
| 6 | Rachel Kipchoge | Makumbusho Market Area, Ubungo | pending |
| 7 | Samuel Kamau | Chalinze Trading Zone, Temeke | pending |
| 8 | Amara Okafor | Kigamboni Port Area, Ubungo | pending |
| 9 | Mustafa Hassan | Kivukoni Front Harbor, Ilala | pending |

## How to Test Auto-Matching

### 1. Activate Auto-Matching
Open `matchmaker-logic.js` and change:
```javascript
const MERCHANT_DASHBOARD_ACTIVE = false;  // Change to true
```

### 2. Trigger Admin Dashboard Polling
Go to Admin Dashboard and refresh the page to trigger order polling.

### 3. Monitor Results
- Go to **Admin Dashboard → Manual Match**
- Watch the manual required count
- All 9 orders should auto-match to merchants
- Manual Required count should remain 0 or very low

### 4. Verify Matches
In Supabase, run:
```sql
SELECT 
    id,
    customer_name,
    delivery_address,
    assigned_merchant_id,
    order_status
FROM orders
WHERE customer_phone LIKE '+255 700 111%'
ORDER BY customer_name;
```

## Cleanup (When Done Testing)

Delete demo data:
```sql
-- Delete demo orders
DELETE FROM orders
WHERE customer_phone LIKE '+255 700 111%';

-- Delete demo merchants
DELETE FROM merchant
WHERE email LIKE '%.local';
```

## Map View

**Dar es Salaam Districts Covered:**
- **Ilala** (City Center): 3 merchants
- **Kinondoni** (Northern): 3 merchants
- **Ubungo** (Southern): 2 merchants
- **Temeke** (Far East): 1 merchant

All merchants are within 5km of multiple orders for optimal auto-matching.

## Troubleshooting

### Orders Not Auto-Matching?
- Check if `MERCHANT_DASHBOARD_ACTIVE` is set to `true`
- Verify merchants have GPS coordinates
- Check admin dashboard console for errors
- Ensure orders are in `pending` status

### Wrong Matches?
- Review GPS coordinates in Supabase
- Check matching radius in `matchmaker-logic.js` (default 5km)
- Verify merchant inventory has products

### Missing Data?
- Confirm SQL executed without errors
- Check Supabase logs for constraint violations
- Verify table names match exactly

## Next Steps

1. Test the auto-matching system thoroughly
2. Adjust matching radius if needed
3. Add merchant inventory for more realistic testing
4. Test manual assignment from admin dashboard
5. Verify order dispatch to merchants
