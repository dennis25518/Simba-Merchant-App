-- Create admin table for Simba Logistics
CREATE TABLE admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    status VARCHAR(50) DEFAULT 'active',
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups during login
CREATE INDEX idx_admin_email ON admin(email);

-- Insert your admin account (adjust email and name as needed)
INSERT INTO admin (email, full_name, role, status, phone) 
VALUES ('musicsmart255@gmail.com', 'Admin User', 'admin', 'active', '+255123456789')
ON CONFLICT (email) DO NOTHING;

-- Enable RLS (Row Level Security)
ALTER TABLE admin ENABLE ROW LEVEL SECURITY;

-- Simple policy: allow authenticated users to read their own admin record
CREATE POLICY "Users can read their own admin record" ON admin
    FOR SELECT
    USING (auth.jwt() ->> 'email' = email);

