export interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock: number | null;
  created_at: string;
}

export type ProductCategory = 'Apparel' | 'Leather Goods' | 'Accessories';

export interface CartItem {
  product: Product;
  category: ProductCategory;
  quantity: number;
}