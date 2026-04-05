-- Create orders and order_items tables in Supabase
-- Run this in Supabase SQL Editor

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT,
    state TEXT,
    pincode TEXT,
    total DECIMAL(10, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    order_status TEXT DEFAULT 'pending',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for orders
CREATE POLICY "Users can view own orders"
    ON public.orders
    FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert own orders"
    ON public.orders
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admin can update orders"
    ON public.orders
    FOR UPDATE
    USING (true);

CREATE POLICY "Admin can delete orders"
    ON public.orders
    FOR DELETE
    USING (true);

-- Create policies for order_items
CREATE POLICY "Users can view order items"
    ON public.order_items
    FOR SELECT
    USING (true);

CREATE POLICY "Users can insert order items"
    ON public.order_items
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admin can update order items"
    ON public.order_items
    FOR UPDATE
    USING (true);

CREATE POLICY "Admin can delete order items"
    ON public.order_items
    FOR DELETE
    USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON public.order_items(product_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_orders_updated_at_trigger ON public.orders;
CREATE TRIGGER update_orders_updated_at_trigger
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_orders_updated_at();

-- Grant permissions
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.order_items TO authenticated;
GRANT SELECT ON public.orders TO anon;
GRANT SELECT ON public.order_items TO anon;
