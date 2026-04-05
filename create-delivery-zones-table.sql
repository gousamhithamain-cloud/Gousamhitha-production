-- Create delivery_zones table in Supabase
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.delivery_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_name TEXT NOT NULL,
    pincodes TEXT[] NOT NULL,
    delivery_charge DECIMAL(10, 2) NOT NULL DEFAULT 0,
    min_order_for_free_delivery DECIMAL(10, 2) DEFAULT NULL,
    estimated_days TEXT DEFAULT '2-3 days',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;

-- Create policies (admin access)
CREATE POLICY "Anyone can view delivery zones"
    ON public.delivery_zones
    FOR SELECT
    USING (true);

CREATE POLICY "Admin can insert delivery zones"
    ON public.delivery_zones
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admin can update delivery zones"
    ON public.delivery_zones
    FOR UPDATE
    USING (true);

CREATE POLICY "Admin can delete delivery zones"
    ON public.delivery_zones
    FOR DELETE
    USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS delivery_zones_is_active_idx ON public.delivery_zones(is_active);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_delivery_zones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_delivery_zones_updated_at_trigger ON public.delivery_zones;
CREATE TRIGGER update_delivery_zones_updated_at_trigger
    BEFORE UPDATE ON public.delivery_zones
    FOR EACH ROW
    EXECUTE FUNCTION update_delivery_zones_updated_at();

-- Grant permissions
GRANT ALL ON public.delivery_zones TO authenticated;
GRANT SELECT ON public.delivery_zones TO anon;

-- Insert sample delivery zones (optional)
INSERT INTO public.delivery_zones (zone_name, pincodes, delivery_charge, min_order_for_free_delivery, estimated_days)
VALUES 
    ('Zone 1 - City Center', ARRAY['500001', '500002', '500003'], 50.00, 500.00, '1-2 days'),
    ('Zone 2 - Suburbs', ARRAY['500004', '500005', '500006'], 80.00, 800.00, '2-3 days')
ON CONFLICT DO NOTHING;
