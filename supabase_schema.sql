-- Simba Express Merchant Database Schema
-- This script adds merchant management to your existing Supabase schema
-- It works alongside your existing: categories, order-items, orders, products tables

-- ==========================================
-- 1. CREATE MERCHANTS TABLE
-- ==========================================
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_id VARCHAR(50) NOT NULL UNIQUE,
  merchant_name VARCHAR(255) NOT NULL,
  merchant_email VARCHAR(255) NOT NULL UNIQUE,
  merchant_phone VARCHAR(20) NOT NULL,
  merchant_location VARCHAR(255) NOT NULL,
  merchant_status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (merchant_status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. ADD MERCHANT REFERENCE TO EXISTING ORDERS TABLE
-- ==========================================
-- Uncomment the line below ONLY if your orders table doesn't already have a merchant_id column
-- ALTER TABLE orders ADD COLUMN merchant_id VARCHAR(50) REFERENCES merchants(merchant_id) ON DELETE CASCADE;

-- If you uncommented above, also run this to create an index:
-- CREATE INDEX idx_orders_merchant_id ON orders(merchant_id);

-- ==========================================
-- 3. CREATE MERCHANT PAYOUTS TABLE
-- ==========================================
CREATE TABLE merchant_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id VARCHAR(50) NOT NULL REFERENCES merchants(merchant_id) ON DELETE CASCADE,
  payout_amount INTEGER NOT NULL,
  payout_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (payout_status IN ('pending', 'completed', 'failed')),
  payout_date TIMESTAMP WITH TIME ZONE,
  payout_method VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. CREATE MERCHANT SETTINGS TABLE
-- ==========================================
CREATE TABLE merchant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id VARCHAR(50) NOT NULL UNIQUE REFERENCES merchants(merchant_id) ON DELETE CASCADE,
  avg_prep_time INTEGER DEFAULT 30,
  is_visible BOOLEAN DEFAULT TRUE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  store_open BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. CREATE MERCHANT PRODUCTS TABLE
-- ==========================================
-- This allows merchants to have their own product listings
CREATE TABLE merchant_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id VARCHAR(50) NOT NULL REFERENCES merchants(merchant_id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  merchant_product_name VARCHAR(255) NOT NULL,
  merchant_product_price INTEGER NOT NULL,
  merchant_stock_quantity INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 6. CREATE MERCHANT ANALYTICS TABLE
-- ==========================================
CREATE TABLE merchant_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id VARCHAR(50) NOT NULL REFERENCES merchants(merchant_id) ON DELETE CASCADE,
  total_orders INTEGER DEFAULT 0,
  total_revenue INTEGER DEFAULT 0,
  avg_order_value INTEGER DEFAULT 0,
  completed_orders INTEGER DEFAULT 0,
  cancelled_orders INTEGER DEFAULT 0,
  analytics_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(merchant_id, analytics_date)
);

-- ==========================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX idx_merchants_user_id ON merchants(user_id);
CREATE INDEX idx_merchants_merchant_id ON merchants(merchant_id);
CREATE INDEX idx_merchants_status ON merchants(merchant_status);
CREATE INDEX idx_merchant_payouts_merchant_id ON merchant_payouts(merchant_id);
CREATE INDEX idx_merchant_payouts_status ON merchant_payouts(payout_status);
CREATE INDEX idx_merchant_payouts_created_at ON merchant_payouts(created_at DESC);
CREATE INDEX idx_merchant_settings_merchant_id ON merchant_settings(merchant_id);
CREATE INDEX idx_merchant_products_merchant_id ON merchant_products(merchant_id);
CREATE INDEX idx_merchant_products_available ON merchant_products(is_available);
CREATE INDEX idx_merchant_analytics_merchant_id ON merchant_analytics(merchant_id);
CREATE INDEX idx_merchant_analytics_date ON merchant_analytics(analytics_date DESC);

-- ==========================================
-- 8. ENABLE ROW LEVEL SECURITY (RLS)
-- ==========================================
-- Temporarily disable RLS on merchants for registration to work
-- ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_analytics ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 9. CREATE RLS POLICIES FOR MERCHANTS TABLE
-- ==========================================
-- RLS disabled on merchants table for now - enable after testing registration
-- CREATE POLICY "Users can view own merchant"
--   ON merchants
--   FOR SELECT
--   USING (auth.uid() = user_id);
-- 
-- CREATE POLICY "Users can insert own merchant"
--   ON merchants
--   FOR INSERT
--   WITH CHECK (auth.uid() = user_id);
-- 
-- CREATE POLICY "Users can update own merchant"
--   ON merchants
--   FOR UPDATE
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 10. CREATE RLS POLICIES FOR MERCHANT PAYOUTS
-- ==========================================
CREATE POLICY "Users can view own merchant payouts"
  ON merchant_payouts
  FOR SELECT
  USING (
    merchant_id IN (
      SELECT merchant_id FROM merchants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own merchant payouts"
  ON merchant_payouts
  FOR INSERT
  WITH CHECK (
    merchant_id IN (
      SELECT merchant_id FROM merchants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own merchant payouts"
  ON merchant_payouts
  FOR UPDATE
  USING (
    merchant_id IN (
      SELECT merchant_id FROM merchants WHERE user_id = auth.uid()
    )
  );

-- ==========================================
-- 11. CREATE RLS POLICIES FOR MERCHANT SETTINGS
-- ==========================================
CREATE POLICY "Users can view own merchant settings"
  ON merchant_settings
  FOR SELECT
  USING (
    merchant_id IN (
      SELECT merchant_id FROM merchants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own merchant settings"
  ON merchant_settings
  FOR INSERT
  WITH CHECK (
    merchant_id IN (
      SELECT merchant_id FROM merchants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own merchant settings"
  ON merchant_settings
  FOR UPDATE
  USING (
    merchant_id IN (
      SELECT merchant_id FROM merchants WHERE user_id = auth.uid()
    )
  );

-- ==========================================
-- 12. CREATE RLS POLICIES FOR MERCHANT PRODUCTS
-- ==========================================
CREATE POLICY "Users can view own merchant products"
  ON merchant_products
  FOR SELECT
  USING (
    merchant_id IN (
      SELECT merchant_id FROM merchants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own merchant products"
  ON merchant_products
  FOR INSERT
  WITH CHECK (
    merchant_id IN (
      SELECT merchant_id FROM merchants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own merchant products"
  ON merchant_products
  FOR UPDATE
  USING (
    merchant_id IN (
      SELECT merchant_id FROM merchants WHERE user_id = auth.uid()
    )
  );

-- ==========================================
-- 13. CREATE RLS POLICIES FOR MERCHANT ANALYTICS
-- ==========================================
CREATE POLICY "Users can view own merchant analytics"
  ON merchant_analytics
  FOR SELECT
  USING (
    merchant_id IN (
      SELECT merchant_id FROM merchants WHERE user_id = auth.uid()
    )
  );

-- ==========================================
-- 14. CREATE FUNCTION FOR AUTOMATIC TIMESTAMP UPDATES
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 15. CREATE TRIGGERS FOR UPDATED_AT COLUMNS
-- ==========================================
CREATE TRIGGER update_merchants_updated_at BEFORE UPDATE ON merchants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merchant_payouts_updated_at BEFORE UPDATE ON merchant_payouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merchant_settings_updated_at BEFORE UPDATE ON merchant_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merchant_products_updated_at BEFORE UPDATE ON merchant_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merchant_analytics_updated_at BEFORE UPDATE ON merchant_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 16. SAMPLE DATA (OPTIONAL - Remove if not needed)
-- ==========================================
-- Uncomment to insert sample merchant data:
-- INSERT INTO merchants (user_id, merchant_id, merchant_name, merchant_email, merchant_phone, merchant_location)
-- VALUES (
--   'YOUR_USER_ID_HERE',
--   'MERCH001',
--   'Mais Suppliers',
--   'merchant@example.com',
--   '+255123456789',
--   'Dar es Salaam'
-- );

-- INSERT INTO merchant_settings (merchant_id, avg_prep_time, is_visible)
-- VALUES ('MERCH001', 30, true);
