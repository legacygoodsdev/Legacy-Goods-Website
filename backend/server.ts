const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
import type { Request, Response } from 'express';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY are required');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const paymentMethods = ['COD', 'EasyPaisa', 'JazzCash', 'BankTransfer'] as const;
type PaymentMethod = (typeof paymentMethods)[number];

interface OrderPayload {
  user_id: unknown;
  customer_name: unknown;
  customer_email: unknown;
  customer_phone: unknown;
  shipping_address: unknown;
  city: unknown;
  payment_method: unknown;
  total_amount: unknown;
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isPaymentMethod = (value: unknown): value is PaymentMethod =>
  typeof value === 'string' && paymentMethods.includes(value as PaymentMethod);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Legacy Goods Backend is running' });
});

// Get all products
app.get('/api/products', async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

// Create a new order
app.post('/api/orders', async (req: Request, res: Response) => {
  const authorization = req.headers.authorization;
  const accessToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!accessToken) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !authData.user) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  const {
    user_id,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    city,
    payment_method,
    total_amount,
  } = req.body as OrderPayload;

  if (
    !isNonEmptyString(user_id) ||
    !isNonEmptyString(customer_name) ||
    !isNonEmptyString(customer_email) ||
    !isNonEmptyString(customer_phone) ||
    !isNonEmptyString(shipping_address) ||
    !isNonEmptyString(city) ||
    !isPaymentMethod(payment_method) ||
    typeof total_amount !== 'number' ||
    !Number.isFinite(total_amount) ||
    total_amount <= 0
  ) {
    return res.status(400).json({ error: 'Invalid order details' });
  }

  if (user_id !== authData.user.id || customer_email.trim().toLowerCase() !== (authData.user.email ?? '').toLowerCase()) {
    return res.status(403).json({ error: 'Order identity does not match the signed-in user' });
  }

  const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', authData.user.id).maybeSingle();
  if (profileError) {
    return res.status(500).json({ error: profileError.message });
  }
  if (profile?.role === 'admin') {
    return res.status(403).json({ error: 'Admins can browse the catalogue but cannot place orders' });
  }

  const { data, error } = await supabase.from('orders').insert([
    {
      user_id,
      customer_name: customer_name.trim(),
      customer_email: customer_email.trim(),
      customer_phone: customer_phone.trim(),
      shipping_address: shipping_address.trim(),
      city: city.trim(),
      payment_method,
      total_amount,
      payment_status: payment_method === 'COD' ? 'Pending (COD)' : 'Awaiting Payment'
    }
  ]).select();

  if (error) {
    console.log('Order insertion error:', error);
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ message: 'Order placed successfully', order: data[0] });
});

app.listen(PORT, () => {
  console.log(`🚀 Legacy Goods Backend running on http://localhost:${PORT}`);
});