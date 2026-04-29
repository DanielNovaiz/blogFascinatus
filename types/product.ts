export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  images: string[];
  category: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCard {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
}
