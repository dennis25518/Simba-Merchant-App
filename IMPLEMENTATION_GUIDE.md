# Implementation Guide: Order Routing System

## Overview
Complete order fulfillment pipeline connecting Simba Express (customer app) with Simba-Merchant-App (admin/merchant dashboard).

## Data Flow

```
Customer Places Order (Simba Express)
    ↓ (with GPS coordinates)
    ↓
Supabase orders table (order_status = 'pending')
    ↓
Admin Dashboard (Polling every 30s)
    ↓
Matchmaker Engine (find nearby merchant with inventory)
    ↓
Merchant Dashboard (Real-time notification)
    ↓
Merchant accepts order
    ↓
Dispatch + Delivery
```

## 3 Files to Add to Simba-Merchant-App

### 1. Enhanced admin-dash.html (Updated)
**Location:** Replace existing `admin-dash.html`

**Key Features:**
- Polls orders table every 30 seconds
- Shows "New Orders" count in real-time
- Displays manual intervention queue for unmatched orders
- Dashboard stats: total orders, active merchants, drivers, failed orders

**Implementation:**
1. Add the polling script from `admin-polling-script.html` inside the `<script>` tag
2. The polling automatically:
   - Fetches all pending orders
   - Runs matchmaker for each order
   - Updates order_status to 'sent_to_merchant' if successful
   - Marks as 'manual_required' if matchmaker fails

---

### 2. Enhanced matchmaker-logic.js (New/Updated)
**Location:** Use this as `matchmaker-logic.js` in Simba-Merchant-App

**Key Features:**
- GPS-based merchant finding (5km radius)
- Haversine formula for distance calculation
- Inventory validation before assignment
- Auto-routes orders to nearest merchant with stock

**Algorithm:**
```
For each pending order:
  1. Extract GPS: (delivery_latitude, delivery_longitude)
  2. Query all merchants with GPS coordinates
  3. Filter by distance ≤ 5km
  4. Sort by distance (closest first)
  5. For each nearby merchant:
     - Check if merchant has all order items in inventory
     - If yes: assign order + update order_status to 'sent_to_merchant'
     - If no: try next merchant
  6. If no match found: mark as 'manual_required'
```

---

### 3. Merchant Dashboard Real-time Listener (New)
**Location:** Add to `merchant-dash.html` in a `<script>` tag at bottom of body

**Key Features:**
- Real-time Supabase subscription for new orders
- Displays incoming orders with customer info
- "Accept Order" / "Defer" buttons
- Order status tracking: incoming → accepted → packing → ready → dispatched
- Sound/visual notification when new order arrives

**Real-time Flow:**
```
Order assigned to merchant (in admin polling)
    ↓
Supabase broadcasts change
    ↓
Merchant dashboard receives real-time update
    ↓
Show notification + sound alert
    ↓
Display order in "Incoming Requests" section
    ↓
Merchant clicks "Accept Order"
    ↓
Status changes to 'accepted', moves to "Packing & Dispatch"
```

---

## Database Schema Requirements

### Orders Table (Already updated)
```sql
-- These columns must exist:
- id (UUID, PRIMARY KEY)
- user_id (UUID) - customer's user_id
- user_email (TEXT)
- customer_name (TEXT) ✅ NEW
- customer_phone (TEXT) ✅ NEW
- delivery_latitude (NUMERIC) ✅ NEW - GPS latitude
- delivery_longitude (NUMERIC) ✅ NEW - GPS longitude
- order_items (JSONB) - array of {product_id, product_name, quantity, unit_price, total_price}
- subtotal (NUMERIC)
- delivery_fee (NUMERIC)
- total_amount (NUMERIC)
- order_status (TEXT) - 'pending'|'sent_to_merchant'|'accepted'|'ready_for_dispatch'|'delivered'|'manual_required'|'deferred'
- assigned_merchant_id (UUID) - which merchant has this order
- created_at (TIMESTAMP)
- routing_error (TEXT) - error message if matching failed
- routing_timestamp (TIMESTAMP)
- distance_km (NUMERIC) - distance to assigned merchant
```

### Merchants Table (Must exist)
```sql
- id (UUID, PRIMARY KEY)
- user_id (UUID)
- store_name (TEXT)
- latitude (NUMERIC) - Merchant's location
- longitude (NUMERIC) - Merchant's location
- phone (TEXT)
- owner_name (TEXT)
```

### Merchant Inventory Table (Must exist)
```sql
- id (UUID, PRIMARY KEY)
- merchant_id (UUID) - FK to merchants
- product_id (UUID) - FK to products
- quantity (INTEGER) - Stock count
```

---

## Installation Steps

### Step 1: Update Admin Dashboard
1. Open your `Simba-Merchant-App/admin-dash.html` in VS Code
2. Find the `<script>` section at the bottom
3. Add the polling code from `admin-polling-script.html` INSIDE the existing `<script>` tag
4. Commit and push

### Step 2: Update Matchmaker Logic
1. Open your `Simba-Merchant-App/matchmaker-logic.js` (or create if doesn't exist)
2. Replace entire content with `matchmaker-logic-enhanced.js`
3. This file handles: distance calculation, merchant finding, inventory checking
4. Commit and push

### Step 3: Update Merchant Dashboard
1. Open your `Simba-Merchant-App/merchant-dash.html`
2. Find the closing `</body>` tag
3. Add the real-time listener code from `merchant-realtime-listener.js` as a new `<script>` tag
4. OR find the existing `<script>` section and add the code inside it
5. Commit and push

---

## Testing the System End-to-End

### Test Scenario 1: Successful Auto-Routing
```
1. Open Simba Express in customer browser
2. Add items to cart
3. Go to checkout
4. Click "📍 Chukua Mahali Yangu" button
5. Allow GPS access → coordinates captured
6. Submit order
7. Check Admin Dashboard:
   - Should show new order in "Orders Today" count
   - After 30 seconds, polling should run
   - If merchant nearby with inventory → order disappears (auto-matched)
8. Check Merchant Dashboard:
   - Should see new order notification
   - Order appears in "Incoming Requests"
```

### Test Scenario 2: Manual Intervention Required
```
1. Place order at location with no nearby merchants
   OR at location where merchants have no inventory
2. Check Admin Dashboard:
   - Order should appear in "Manual Match Required" section
   - Shows reason: "NO_MERCHANTS_NEARBY" or "NO_INVENTORY_MATCH"
3. Admin clicks "Assign Now"
4. Enters merchant ID
5. Order is manually assigned
6. Merchant receives real-time notification
```

### Test Scenario 3: Merchant Accepts Order
```
1. Merchant sees new order in dashboard
2. Clicks "✓ Accept Order"
3. Order moves from "Incoming Requests" to "Packing & Dispatch"
4. Order status changes to 'accepted' in database
5. After packing, merchant clicks "📦 Ready for Pickup"
6. Order moves to "Completed Orders"
```

---

## Monitoring & Debugging

### Check Admin Polling
Open browser DevTools (F12) → Console tab:
```javascript
// You should see logs like:
[MATCHMAKER] Processing order abc-123
[MATCHMAKER] Found 3 nearby merchants
[MATCHMAKER] Matched merchant: xyz-456
✅ Order abc-123 routed to merchant xyz-456
```

### Check Merchant Notifications
In Merchant Dashboard DevTools Console:
```javascript
// You should see:
✅ Merchant initialized: My Store (ID: abc)
✅ Subscribed to real-time order updates
🆕 New order received!
Order update received: {payload details}
```

### Check Order Status in Supabase
1. Go to https://app.supabase.com
2. Select your project
3. Go to "SQL Editor"
4. Run:
```sql
-- See all orders with their status
SELECT id, customer_name, order_status, assigned_merchant_id, routing_error 
FROM orders 
ORDER BY created_at DESC 
LIMIT 20;

-- See pending orders
SELECT * FROM orders WHERE order_status = 'pending';

-- See manual required orders
SELECT * FROM orders WHERE order_status = 'manual_required';
```

---

## Performance Tips

1. **Reduce Polling Frequency:** Change 30000ms to 60000ms if server load is high
   ```javascript
   pollInterval = setInterval(async () => {
       await pollPendingOrders();
   }, 60000); // 60 seconds instead of 30
   ```

2. **Limit Orders Per Poll:** Add `.limit(10)` to only process 10 orders per poll
   ```javascript
   const { data: pendingOrders, error } = await supabaseClient
       .from('orders')
       .select('*')
       .eq('order_status', 'pending')
       .limit(10); // Only 10 at a time
   ```

3. **Index the Database:** Add indexes for faster queries
   ```sql
   CREATE INDEX idx_orders_status ON orders(order_status);
   CREATE INDEX idx_orders_merchant ON orders(assigned_merchant_id);
   CREATE INDEX idx_merchant_inventory ON merchant_inventory(merchant_id, product_id);
   ```

---

## Common Issues & Solutions

### Issue: "Supabase client not initialized"
**Solution:** Make sure `supabase-config.js` is loaded before polling starts
- Check that `<script src="supabase-config.js"></script>` is in HTML head
- Increase delay in `setTimeout(() => startOrderPolling(), 3000)` to 5000

### Issue: Orders stay "pending" forever
**Solution:** Check that merchants have GPS coordinates and inventory
```sql
-- Check merchant GPS
SELECT id, store_name, latitude, longitude FROM merchants;

-- Check inventory
SELECT merchant_id, product_id, quantity FROM merchant_inventory;
```

### Issue: Merchant doesn't see real-time updates
**Solution:** Check Supabase real-time subscriptions are enabled
1. Go to Supabase Dashboard → Replication
2. Ensure "Replication" is ON for orders table
3. Check that merchant_id is correctly set in order

### Issue: Distance calculation shows wrong values
**Solution:** Verify GPS coordinates are in correct format
- Latitude should be between -90 and 90
- Longitude should be between -180 and 180
- Example valid: lat=-6.7755, lng=39.2072 (Dar es Salaam)

---

## Next Steps (Future Enhancements)

1. **Driver Assignment:** Auto-assign dispatch driver based on location
2. **Delivery Tracking:** Real-time GPS tracking of delivery in progress
3. **Customer Notifications:** Send SMS/email updates to customer
4. **Performance Metrics:** Track average matching time, success rate
5. **Advanced Routing:** Consider peak hours, merchant load, traffic
6. **Multi-language:** Support more languages in notifications
7. **Payment Integration:** Confirm payment before routing order

---

## File Locations Summary

### Simba Express (Customer App)
- ✅ index.html - Updated with GPS location capture ✅ DONE

### Simba-Merchant-App (Admin/Merchant)
- 📄 admin-dash.html - Add polling script ← NEXT
- 📄 matchmaker-logic.js - Replace with enhanced version ← NEXT
- 📄 merchant-dash.html - Add real-time listener ← NEXT
- ✅ supabase-config.js - Already configured ✅ NO CHANGES NEEDED

---

## Support
If you encounter issues:
1. Check console logs (F12)
2. Verify Supabase database schema
3. Ensure GPS coordinates are being captured in Simba Express
4. Check that merchants have location and inventory data
