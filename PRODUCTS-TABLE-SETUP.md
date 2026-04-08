# Products Table Setup Guide

## Step 1: Drop Old Products Table

Run this in your Nhost SQL Editor:

```sql
DROP TABLE IF EXISTS products CASCADE;
```

## Step 2: Create New Products Table

Run the SQL file: `create-new-products-table.sql`

This will:
- Create a new products table with improved structure
- Add proper constraints (price > 0, stock >= 0)
- Auto-calculate `in_stock` based on stock quantity
- Add indexes for better performance
- Create auto-update trigger for `updated_at`
- Insert 5 sample products

## Step 3: Verify Setup

Your admin products page is already configured to work with the new table!

The page will automatically:
- Load products from `/api/products`
- Display product images, name, category, price, stock
- Show in-stock/out-of-stock status
- Allow editing and deleting products

## Admin Products Page Features

- View all products in a table
- Edit product details (name, category, price, stock, unit)
- Delete products
- Auto-refresh after changes
- Responsive design

## API Endpoints Used

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

## Done!

Your admin products page at `admin-products.html` is ready to use with the new products table.
