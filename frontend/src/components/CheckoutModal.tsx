'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CartItem } from '@/types';
import { createOrder, type OrderPayload } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Props {
  items: CartItem[];
  totalAmount: number;
  onClose: () => void;
}

export default function CheckoutModal({ items, totalAmount, onClose }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: user?.email ?? '',
    customer_phone: '',
    shipping_address: '',
    city: 'Lahore',
    payment_method: 'COD' as 'COD' | 'EasyPaisa' | 'JazzCash' | 'BankTransfer',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    if (!user.email) {
      setError('Your account does not have an email address available for this order.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createOrder({
        ...form,
        user_id: user.id,
        customer_email: user.email,
        total_amount: totalAmount,
      });
      setSuccess(true);
    } catch {
      setError('Failed to place order. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-backdrop">
      <div className="checkout-card">
        {success ? (
          <div className="text-center py-6">
            <p className="eyebrow text-[#7c6232]">A good choice</p>
            <h2 className="checkout-title">Order placed.</h2>
            <p className="checkout-copy">Thank you for your order. We will contact you at {form.customer_phone} to confirm delivery.</p>
            {form.payment_method !== 'COD' && (
              <div className="checkout-note">
                Please transfer <strong>PKR {totalAmount.toLocaleString('en-PK')}</strong> to our {form.payment_method} account (0300-1234567) and send the transaction screenshot via WhatsApp.
              </div>
            )}
            <button onClick={onClose} className="checkout-submit">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="checkout-form">
            <p className="eyebrow text-[#7c6232]">Final details</p>
            <h2 className="checkout-title">Make it yours.</h2>
            <div className="checkout-summary">
              {items.map((item) => <p key={item.product.id}>{item.quantity} × {item.product.title}</p>)}
              <p className="checkout-total">Total: PKR {totalAmount.toLocaleString('en-PK')}</p>
            </div>

            <input
              type="text"
              placeholder="Full Name"
              required
              className="checkout-input"
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email Address"
              required
              readOnly
              className="checkout-input muted"
              value={form.customer_email}
            />
            <input
              type="tel"
              placeholder="Phone Number (e.g. 03001234567)"
              required
              className="checkout-input"
              value={form.customer_phone}
              onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
            />
            <input
              type="text"
              placeholder="Shipping Address"
              required
              className="checkout-input"
              value={form.shipping_address}
              onChange={(e) => setForm({ ...form, shipping_address: e.target.value })}
            />
            <input
              type="text"
              placeholder="City (e.g. Karachi, Lahore, Islamabad)"
              required
              className="checkout-input"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />

            <div>
              <label className="checkout-label">Payment method</label>
              <select
                className="checkout-input"
                value={form.payment_method}
                onChange={(e) => setForm({ ...form, payment_method: e.target.value as OrderPayload['payment_method'] })}
              >
                <option value="COD">Cash on Delivery (COD)</option>
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="JazzCash">JazzCash</option>
                <option value="BankTransfer">Bank Transfer</option>
              </select>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <div className="checkout-actions">
              <button type="button" onClick={onClose} className="checkout-cancel">Cancel</button>
              <button type="submit" disabled={loading} className="checkout-submit">
                {loading ? 'Processing...' : 'Confirm Order'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}