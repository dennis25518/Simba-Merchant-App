# Quick Testing Checklist

## Issue You Reported:
❌ Merchant Dashboard Error: `assigned_merchant_id=eq.dev-merchant-001` returns 400 error  
❌ Admin Dashboard: `net::ERR_FAILED` (network error)

## What We Fixed:
✅ Merchant Dashboard now fetches a REAL merchant ID from database instead of using fake `dev-merchant-001`  
✅ Dev mode automatically finds first merchant with GPS coordinates  
✅ Fallback to any merchant if no GPS data exists

---

## **New Testing Steps**

### **Step 1: Hard Refresh Both Dashboards**
```
Merchant: https://simba-merchant-app.vercel.app
- Press: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
```

```
Admin: https://simba-express.vercel.app  
- Press: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
```

**Wait 3-5 minutes for Vercel to deploy the latest code**

---

### **Step 2: Check Merchant Console**
Open: Merchant Dashboard → F12 → Console

**You should NOW see:**
```
✅ Supabase client initialized successfully
✅ [DEV] Development mode enabled
✅ [DEV] Development mode using real merchant: [ID] [MERCHANT NAME]
✅ [MERCHANT] Initializing real-time order listener...
✅ [MERCHANT] ✅ Subscribed to real-time order updates
```

**NOT:**
```
❌ assigned_merchant_id=eq.dev-merchant-001
❌ Error 400
```

---

### **Step 3: Check Admin Console**
Open: Admin Dashboard → F12 → Console

**You should see:**
```
✅ [ADMIN] Found X pending orders. Processing...
✅ ✅ Order 1 auto-matched to merchant Y
✅ ✅ Order 2 auto-matched to merchant Z
✅ [ADMIN] Dashboard updated: X auto-matched
```

---

### **Step 4: Verify Dashboard Cards Update**

In Admin Dashboard, watch the 4 cards at top:

| Card | Expected |
|------|----------|
| Orders Today | 18+ |
| Auto-Matched | Should INCREASE (15+) |
| Manual Required | Low (2-3) |
| Failed Orders | 0 |

---

### **Step 5: Verify in Supabase**

```sql
-- Check if orders are being matched
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN order_status = 'sent_to_merchant' THEN 1 END) as matched,
    COUNT(CASE WHEN order_status = 'manual_required' THEN 1 END) as manual,
    COUNT(CASE WHEN order_status = 'pending' THEN 1 END) as pending
FROM orders
WHERE customer_phone LIKE '+255 700 111%';

-- Expected Result:
-- total | matched | manual | pending
-- 18   | 15+     | 2-3    | 0
```

---

### **Step 6: Check Merchant Dashboard Receives Orders**

Merchant Dashboard should show all orders assigned to that merchant.

**Each order should display:**
- ✅ Customer name
- ✅ Delivery address  
- ✅ Order items (rice, beans, etc.)
- ✅ Total amount
- ✅ Dispatch button

---

## **If Still Not Working**

### **Problem: Still getting 400 error on merchant dashboard**

**Try this query in Supabase:**
```sql
SELECT id, partner_name FROM merchant LIMIT 5;
```

Should return 9 merchants. If not:
- Run `demo_merchants.sql` first!

### **Problem: Admin dashboard still shows network error**

Try accessing it with this URL:
```
https://simba-express.vercel.app/admin-dash.html
```

Or check Vercel deployment status.

### **Problem: No console logs on Admin Dashboard**

1. Refresh the page
2. Give it 10 seconds to initialize
3. Open Console tab before refreshing
4. Watch for logs as the page loads

---

## **Success Criteria** ✅

- [ ] Merchant dashboard loads without 400 error
- [ ] Merchant name appears (real merchant from database)
- [ ] Orders appear in merchant dashboard
- [ ] Admin dashboard cards show numbers > 0
- [ ] Console shows ✅ matching logs
- [ ] Database query shows `sent_to_merchant` orders

---

**Report back with:**
1. What you see in Merchant console
2. What you see in Admin console  
3. Screenshot of admin dashboard cards
4. Supabase query result

Then we'll debug from there! 🚀
