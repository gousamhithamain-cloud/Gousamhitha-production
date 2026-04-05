-- Migration: Add role column to users table
-- Date: 2026-04-05
-- Description: Add role-based access control support

-- Add role column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer';

-- Add check constraint for valid roles
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_role'
    ) THEN
        ALTER TABLE users
        ADD CONSTRAINT check_role CHECK (role IN ('customer', 'admin'));
    END IF;
END $$;

-- Create index on role column for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update existing users to have 'customer' role if NULL
UPDATE users SET role = 'customer' WHERE role IS NULL;

-- Verify migration
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'role';

-- Show constraint
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'check_role';
