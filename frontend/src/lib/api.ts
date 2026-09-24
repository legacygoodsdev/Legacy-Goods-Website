import axios from 'axios';
import { Product } from '@/types';
import { supabase } from '@/lib/supabaseClient';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export const fetchProducts = async (): Promise<Product[]> => {
  const response = await axios.get(`${BACKEND_URL}/api/products`);
  return response.data;
  
};export interface OrderPayload {
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  payment_method: 'COD' | 'EasyPaisa' | 'JazzCash' | 'BankTransfer';
  total_amount: number;
}

export const createOrder = async (order: OrderPayload) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const response = await axios.post(`${BACKEND_URL}/api/orders`, order, {
    headers: sessionData.session?.access_token ? { Authorization: `Bearer ${sessionData.session.access_token}` } : undefined,
  });
  return response.data;
};