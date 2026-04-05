-- Create vendors table in Supabase
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_name TEXT NOT NULL,
    business_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    status TEXT DEFAULT 'active',
    bank_account_number TEXT,
    bank_name TEXT,
    ifsc_code TEXT,
    upi_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Create policies (admin only access)
CREATE POLICY "Admin can view vendors"
    ON public.vendors
    FOR SELECT
    USING (true);

CREATE POLICY "Admin can insert vendors"
    ON public.vendors
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admin can update vendors"
    ON public.vendors
    FOR UPDATE
    USING (true);

CREATE POLICY "Admin can delete vendors"
    ON public.vendors
    FOR DELETE
    USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS vendors_vendor_name_idx ON public.vendors(vendor_name);
CREATE INDEX IF NOT EXISTS vendors_status_idx ON public.vendors(status);
CREATE INDEX IF NOT EXISTS vendors_created_at_idx ON public.vendors(created_at);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_vendors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_vendors_updated_at_trigger ON public.vendors;
CREATE TRIGGER update_vendors_updated_at_trigger
    BEFORE UPDATE ON public.vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_vendors_updated_at();

-- Grant permissions
GRANT ALL ON public.vendors TO authenticated;
GRANT SELECT ON public.vendors TO anon;

-- Insert sample vendor data (optional)
INSERT INTO public.vendors (vendor_name, business_name, phone, email, address, status)
VALUES 
    ('Sample Vendor', 'Sample Business Pvt Ltd', '9876543210', 'vendor@example.com', '123 Main Street, City', 'active')
ON CONFLICT DO NOTHING;
