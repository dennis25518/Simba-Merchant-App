# Auto-Matching System Test Guide

## Overview
This guide helps you test the complete order flow from Admin Dashboard → Auto-Matching → Merchant Dashboard.

---

## System Status Check

### 1. **Verify Demo Data Exists**
Run in Supabase SQL Editor:

```sql
-- Check merchants with GPS
SELECT COUNT(*) as total_merchants, 
       COUNT(CASE WHEN latitude IS NOT NULL THEN 1 END) as with_gps
FROM merchant;

-- Check demo orders
SELECT COUNT(*) as total_orders,
       COUNT(CASE WHEN order_status = 'pending' THEN 1 END) as pending,
       COUNT(CASE WHEN order_status = 'sent_to_merchant' THEN 1 END) as auto_matched,
       COUNT(CASE WHEN order_status = 'manual_required' THEN 1 END) as manual_required
FROM orders
WHERE customer_phone LIKE '+255 700 111%';
```

**Expected Result:**
- 9 merchants with GPS coordinates
- 18+ total orders (your demo 9 + any new ones)
- 0 pending (they should start processing)

---

## Testing Flow

### **Step 1: Enable Auto-Matching** ✅ DONE
- `MERCHANT_DASHBOARD_ACTIVE = true` in matchmaker-logic.js
- Vercel deployed

### **Step 2: Open Admin Dashboard**
1. Go to: https://simba-express.vercel.app
2. Login with your admin credentials
3. **Watch the "Operations Overview" section**

### **Step 3: Monitor Dashboard Cards (Real-Time)**

The four cards at the top should update every 30 seconds:

```
📦 ORDERS TODAY          🟢 AUTO-MATCHED      🟣 MANUAL REQUIRED      🔴 FAILED ORDERS
[18]                     [?]                  [?]                     [?]
↓                        ↓                     ↓                        ↓
Shows all orders         Orders matched       Orders waiting for       Orders that
created today            automatically        manual assignment        couldn't match
```

**What you should see:**
- Orders Today: 18 (or however many you created)
- Auto-Matched: Should INCREASE over time (orders being matched)
- Manual Required: Should be LOW if matching is working well
- Failed Orders: Should be minimal

### **Step 4: Open Browser Console**
Press `F12` → Console tab

**Look for these logs:**

```
[ADMIN] Found 18 pending orders. Processing...
✅ Order 1 auto-matched to merchant 5
✅ Order 2 auto-matched to merchant 3
✅ Order 3 auto-matched to merchant 7
...
[ADMIN] Processing complete. Processed: 18, Success: 15, Manual: 3
[ADMIN] Dashboard updated: 15 auto-matched, 3 manual required
```

**Green ✅ = Success**
**Yellow ⚠️ = Manual (no merchants nearby)**

---

## What's Happening Behind the Scenes

### **Auto-Matching Process (Every 30 seconds):**

```
1. ADMIN DASHBOARD polls database
   ↓
2. Fetches all PENDING orders (status = 'pending')
   ↓
3. For each pending order:
   a. Get delivery GPS coordinates
   b. Find merchants within 5km radius
   c. Pick closest merchant
   d. Update order: order_status = 'sent_to_merchant'
       + assigned_merchant_id = [merchant ID]
       + distance_km = [calculated distance]
   ↓
4. If no merchants nearby:
   order_status = 'manual_required'
   ↓
5. Dashboard cards automatically update from database counts
```

---

## Verifying Matches in Database

### **Query 1: See All Matches with Distance**
```sql
SELECT 
    o.id,
    o.customer_name,
    o.delivery_address,
    m.partner_name as merchant_name,
    o.order_status,
    o.distance_km,
    o.assigned_at,
    o.assigned_merchant_id
FROM orders o
LEFT JOIN merchant m ON o.assigned_merchant_id = m.id
WHERE o.customer_phone LIKE '+255 700 111%'
ORDER BY o.id;
```

**Expected Output:**
```
id  | customer_name    | merchant_name     | order_status      | distance_km | assigned_merchant_id
1   | Hassan Juma      | Tabata Wholesale  | sent_to_merchant  | 0.5         | 5
2   | Amina Khalil     | Kariakoo Retail   | sent_to_merchant  | 1.2         | 3
3   | John Mwangi      | Msasani Traders   | manual_required   | NULL        | NULL
...
```

### **Query 2: Count by Status**
```sql
SELECT 
    order_status,
    COUNT(*) as count
FROM orders
WHERE customer_phone LIKE '+255 700 111%'
GROUP BY order_status
ORDER BY count DESC;
```

---

## Testing the Full Journey

### **Phase 1: Order Received**
Admin Dashboard shows: `Orders Today: 18`

### **Phase 2: Auto-Matching Runs**
- Admin Dashboard shows increasing `Auto-Matched` count
- Console shows ✅ messages for successful matches
- Database: `order_status` changes from `pending` → `sent_to_merchant`

### **Phase 3: Merchant Dashboard Receives Order**
1. Open Merchant Dashboard: https://simba-merchant-app.vercel.app
2. **MERCHANT_DASHBOARD_ACTIVE = true** means:
   - Orders automatically appear in merchant's dashboard
   - Merchants see orders assigned to them
3. Merchant can:
   - ✅ Accept order
   - ❌ Reject order
   - 📦 Mark for pickup/delivery

### **Phase 4: Real-Time Updates**
- Admin sees dispatch status update
- Order status: `sent_to_merchant` → `accepted` → `in_transit` → `delivered`

---

## Troubleshooting

### **Problem 1: Auto-Matched count stays 0**

**Check Console for errors:**
```javascript
// If you see:
[MATCHMAKER] No merchants with GPS data found
```

**Fix:**
```sql
-- Verify merchants have GPS
SELECT COUNT(*) FROM merchant WHERE latitude IS NOT NULL;
-- Should return 9
```

### **Problem 2: All orders become Manual Required**

**Check:**
```javascript
// If you see:
[MATCHMAKER] Merchant dashboard inactive
```

**Fix:** Verify in matchmaker-logic.js:
```javascript
const MERCHANT_DASHBOARD_ACTIVE = true; // Must be TRUE
```

### **Problem 3: Dashboard cards not updating**

**Check Console:**
```javascript
// Should see:
[ADMIN] Dashboard updated: X auto-matched, Y manual required
```

If missing, try refreshing the page.

### **Problem 4: Orders not matching to nearest merchant**

**Check distance calculation:**
```sql
-- Calculate haversine distance manually
-- Order at: -6.8055, 39.2310 (Tabata)
-- Merchant at: -6.80480000, 39.23040000 (Tabata)
-- Distance should be ~0.5km
```

---

## Success Criteria ✅

✅ Admin Dashboard shows "Auto-Matched" count > 0
✅ Console shows green ✅ messages for successful matches
✅ Database query shows orders with `sent_to_merchant` status
✅ Matched orders have `assigned_merchant_id` set
✅ Distance values are realistic (< 5km)
✅ Merchant Dashboard receives matched orders
✅ Manual Required count is low (< 3 out of 9)

---

## Next Steps After Testing

### **When Everything Works:**

1. **Review Merchant Acceptance Rate**
   - Do merchants accept/reject orders?
   - Are they updating order status?

2. **Test Dispatch Flow**
   - Can admin see real-time updates?
   - Does merchant dashboard refresh?

3. **Optimize Matching**
   - Increase matching radius if needed
   - Add inventory checking
   - Implement merchant rating system

4. **Production Readiness**
   - Disable DEVELOPMENT_MODE in merchant dashboard
   - Set MERCHANT_DASHBOARD_ACTIVE = false to require manual review
   - Monitor actual merchant acceptance rates

---

## Quick Reference

| Component | Status | Action |
|-----------|--------|--------|
| Demo Merchants (9) | ✅ Created | In merchant table |
| Demo Orders (9+) | ✅ Created | In orders table |
| GPS Columns | ✅ Added | latitude, longitude |
| Auto-Matching | ✅ Enabled | MERCHANT_DASHBOARD_ACTIVE = true |
| Admin Dashboard | ✅ Updated | Processes & displays matches |
| Merchant Dashboard | ✅ Ready | Receives matched orders |

---

**Last Updated:** January 27, 2026
**System Version:** 2.0 (Auto-Matching Enabled)
