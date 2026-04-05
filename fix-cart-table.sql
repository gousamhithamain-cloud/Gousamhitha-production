-- Fix cart table to add user_id column if missing
-- Run this in Supabase SQL Editor

-- First, check if cart table exists and drop it to recreate properly
DROP TABLE IF EXISTS public.cart CASCADE;

-- Create cart table with proper structure
CREATE TABLE public.cart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;

-- Create policies for cart access
CREATE POLICY "Users can view their own cart"
    ON public.cart
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own cart"
    ON public.cart
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart"
    ON public.cart
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own cart"
    ON public.cart
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS cart_user_id_idx ON public.cart(user_id);
CREATE INDEX IF NOT EXISTS cart_product_id_idx ON public.cart(product_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_cart_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_cart_updated_at_trigger ON public.cart;
CREATE TRIGGER update_cart_updated_at_trigger
    BEFORE UPDATE ON public.cart
    FOR EACH ROW
    EXECUTE FUNCTION update_cart_updated_at();

-- Grant permissions
GRANT ALL ON public.cart TO authenticated;
GRANT SELECT ON public.cart TO anon;

-- Success message
SELECT 'Cart table created successfully with user_id column!' as message;
