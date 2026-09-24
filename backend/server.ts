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

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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
  const { customer_name, customer_email, customer_phone, shipping_address, city, payment_method, total_amount } = req.body;

  if (!customer_name || !customer_phone || !shipping_address || !city || !payment_method) {
    return res.status(400).json({ error: 'Missing required customer or delivery fields' });
  }

  const { data, error } = await supabase.from('orders').insert([
    {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      city,
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