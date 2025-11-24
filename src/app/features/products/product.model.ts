export interface Product {
  id: number;
  name: string;
  price: number;
  mrp?: number;
  image: string;
  imagesBase64?: string[];
  category?: string;
  description?: string;
  offer?: string;
  stock: number;
  rating?: number;
  reviews?: number;
  prime?: boolean;
  wishlisted: boolean;
  images?: string[];
  features?: string[];
  cartQuantity: number;
}