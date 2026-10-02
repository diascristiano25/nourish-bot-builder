# 🎯 STRIPE INTEGRATION - SETUP CHECKLIST

## Step 1: Create Products & Prices in Stripe Dashboard

Go to: https://dashboard.stripe.com/products

### Create Starter Plan
- **Name**: Starter
- **Type**: Recurring
- **Billing Period**: Monthly
- **Price**: R$ 99
- **Copy Price ID** and paste to `.env.local` → `VITE_STRIPE_STARTER_PRICE_ID`

### Create Pro Plan
- **Name**: Professional
- **Type**: Recurring
- **Billing Period**: Monthly
- **Price**: R$ 299
- **Copy Price ID** and paste to `.env.local` → `VITE_STRIPE_PRO_PRICE_ID`

### Create Enterprise Plan
- **Name**: Enterprise
- **Type**: Recurring or One-time
- **Copy Price ID** and paste to `.env.local` → `VITE_STRIPE_ENTERPRISE_PRICE_ID`

---

## Step 2: Get Webhook Secret

1. Go to: https://dashboard.stripe.com/webhooks
2. Create Endpoint:
   - **URL**: `https://yourdomain.com/api/webhooks/stripe`
   - **Events**: 
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`
3. Copy **Signing Secret** → `.env.local` → `STRIPE_WEBHOOK_SECRET`

---

## Step 3: Update .env.local

Create `.env.local` file with:

```bash
# Keys (ADD YOUR OWN KEYS - see Step 1 & 2)
VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE

# Add Price IDs (from Step 1)
VITE_STRIPE_STARTER_PRICE_ID=price_1ULsgvIgAwz2mtIrXXXXXXXX
VITE_STRIPE_PRO_PRICE_ID=price_1ULsgvIgAwz2mtIrYYYYYYYY
VITE_STRIPE_ENTERPRISE_PRICE_ID=price_1ULsgvIgAwz2mtIrZZZZZZZZ

# Add Webhook Secret (from Step 2)
STRIPE_WEBHOOK_SECRET=whsec_test_XXXXXXXXXXXXXXXXXXXXXXXXXX

# URLs (update for production)
APP_URL=http://localhost:5173
STRIPE_RETURN_URL=http://localhost:5173/dashboard
```

---

## Step 4: Create API Endpoint

Create file: `src/server/api/checkout.ts`

```typescript
import { createCheckoutSession } from '@/server/stripe-webhooks';

export async function POST(req: Request) {
  const { priceId, userId, email } = await req.json();

  const session = await createCheckoutSession(userId, priceId, email);
  
  return Response.json({ sessionId: session.id });
}
```

---

## Step 5: Create Database Tables

Run in Supabase SQL Editor:

```sql
-- Stripe customers
CREATE TABLE IF NOT EXISTS stripe_customers (
  id UUID PRIMARY KEY,
  stripe_customer_id TEXT UNIQUE,
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Purchase events
CREATE TABLE IF NOT EXISTS purchase_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  event_type TEXT,
  plan TEXT,
  amount BIGINT,
  currency TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payment events
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT,
  event_type TEXT,
  amount BIGINT,
  currency TEXT,
  stripe_invoice_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT;
```

---

## Step 6: Update App.tsx

Add route:
```typescript
import CheckoutPage from './pages/CheckoutPage';

// In routes:
<Route path="/checkout" element={<CheckoutPage />} />
```

---

## Step 7: Test Integration

1. **Local testing**:
   ```bash
   bun run dev
   ```

2. **Go to**: http://localhost:5173/checkout

3. **Use test card**: `4242 4242 4242 4242`

4. **Expiry**: Any future date (e.g., 12/25)

5. **CVC**: Any 3 digits

---

## Step 8: Deploy to Production

1. Add to Vercel `.env`:
   ```
   VITE_STRIPE_PUBLIC_KEY
   STRIPE_SECRET_KEY
   VITE_STRIPE_STARTER_PRICE_ID
   VITE_STRIPE_PRO_PRICE_ID
   VITE_STRIPE_ENTERPRISE_PRICE_ID
   STRIPE_WEBHOOK_SECRET
   APP_URL=https://nutriflow.inf.br
   ```

2. Update webhook endpoint URL:
   - Go to Stripe Dashboard → Webhooks
   - Change: `https://nutriflow.inf.br/api/webhooks/stripe`

3. Git commit + push

---

## Status

✅ Frontend: CheckoutPage created
✅ Backend: Webhook handler created
✅ Services: Stripe integration service ready
✅ Config: .env.local created

⏳ TODO:
- [ ] Create products in Stripe dashboard
- [ ] Create webhook endpoint
- [ ] Get webhook secret
- [ ] Update .env.local with price IDs
- [ ] Create API endpoint handler
- [ ] Run Supabase migrations
- [ ] Test with test card
- [ ] Deploy to production

---

**You're ready to accept payments!** 💰
