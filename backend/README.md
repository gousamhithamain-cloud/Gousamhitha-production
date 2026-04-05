# Gousamhitha Backend API

## Setup

```bash
cd backend
npm install
```

## Configure

Copy `.env.example` to `.env` and fill in your values:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key   ← get from Supabase > Settings > API
PORT=4000
FRONTEND_URL=http://127.0.0.1:3000
```

> ⚠️ Use the **service role key** (not the anon key) — it bypasses RLS for server-side operations.

## Run

```bash
npm run dev    # development (nodemon)
npm start      # production
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/products | List all products |
| GET | /api/products?category=X | Filter by category |
| GET | /api/products?search=X | Search by name |
| GET | /api/products/:id | Get single product |
| POST | /api/products | Create product |
| PUT | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |
| GET | /api/cart/:userId | Get user cart |
| POST | /api/cart | Add item to cart |
| PUT | /api/cart/:itemId | Update cart item qty |
| DELETE | /api/cart/:itemId | Remove cart item |
| DELETE | /api/cart/user/:userId | Clear entire cart |
| GET | /api/orders | All orders (admin) |
| GET | /api/orders/user/:userId | User's orders |
| GET | /api/orders/:id | Single order |
| POST | /api/orders | Place order |
| PUT | /api/orders/:id/status | Update order status |
| DELETE | /api/orders/:id | Delete order |
| GET | /api/users/:id | Get user profile |
| POST | /api/users | Create user profile |
| PUT | /api/users/:id | Update user profile |
| POST | /api/auth/signup | Register |
| POST | /api/auth/signin | Login |
| POST | /api/auth/signout | Logout |
| GET | /api/auth/me | Verify token |
| GET | /api/health | Health check |
