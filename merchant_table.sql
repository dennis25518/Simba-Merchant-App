-- Create merchant table for Simba Logistics
CREATE TABLE merchant (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    store_name VARCHAR(255) NOT NULL,
    partner_type VARCHAR(50) NOT NULL, -- 'wholesale' or 'manufacturer'
    phone VARCHAR(20),
    location VARCHAR(500), -- Can store coordinates or address
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'pending', 'suspended'
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX idx_merchant_email ON merchant(email);
CREATE INDEX idx_merchant_status ON merchant(status);
CREATE INDEX idx_merchant_partner_type ON merchant(partner_type);

-- Enable RLS (Row Level Security)
ALTER TABLE merchant ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to read their own merchant record
CREATE POLICY "Users can read their own merchant record" ON merchant
    FOR SELECT
    USING (auth.jwt() ->> 'email' = email);

-- Optional: Create policy for merchant to update their own info
CREATE POLICY "Merchants can update their own record" ON merchant
    FOR UPDATE
    USING (auth.jwt() ->> 'email' = email);
