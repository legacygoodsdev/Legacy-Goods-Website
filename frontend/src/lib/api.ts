import axios from 'axios';
import { Product } from '@/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export const fetchProducts = async (): Promise<Product[]> => {
  const response = await axios.get(`${BACKEND_URL}/api/products`);
  return response.data;
  
};export interface OrderPayload {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  payment_method: 'COD' | 'EasyPaisa' | 'JazzCash' | 'BankTransfer';
  total_amount: number;
}

export const createOrder = async (order: OrderPayload) => {
  const response = await axios.post(`${BACKEND_URL}/api/orders`, order);
  return response.data;
};