"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
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
const paymentMethods = ['COD', 'EasyPaisa', 'JazzCash', 'BankTransfer'];
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const isPaymentMethod = (value) => typeof value === 'string' && paymentMethods.includes(value);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Legacy Goods Backend is running' });
});
// Get all products
app.get('/api/products', async (req, res) => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
});
// Create a new order
app.post('/api/orders', async (req, res) => {
    const { customer_name, customer_email, customer_phone, shipping_address, city, payment_method, total_amount, } = req.body;
    if (!isNonEmptyString(customer_name) ||
        !isNonEmptyString(customer_email) ||
        !isNonEmptyString(customer_phone) ||
        !isNonEmptyString(shipping_address) ||
        !isNonEmptyString(city) ||
        !isPaymentMethod(payment_method) ||
        typeof total_amount !== 'number' ||
        !Number.isFinite(total_amount) ||
        total_amount <= 0) {
        return res.status(400).json({ error: 'Invalid order details' });
    }
    const { data, error } = await supabase.from('orders').insert([
        {
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
//# sourceMappingURL=server.js.map