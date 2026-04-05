-- Migration to add delivery_address column to orders table
-- Run this if you already have an existing orders table

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_address TEXT;

-- This column will store the formatted address from the map selection
-- Example: "123 Main St, Cherlapally, Hyderabad, Telangana, 500051"
