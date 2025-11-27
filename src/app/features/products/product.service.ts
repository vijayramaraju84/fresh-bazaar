import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from './product.model';
import { StockUpdateRequest } from './updateProduct/stockUpdate.model';

// export interface Product {
//   id: number;
//   name: string;
//   description?: string;
//   price: number;
//   stock?: number;
//   category?: string;
//   imageBase64?: string;
//   image?: string; // ✅ Added for UI display
//   offer?: string;
// }

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = 'https://product-service-7kfu.onrender.com/products';

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/getall`);
  }

  createProduct(formData: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.post(`${this.baseUrl}/create`, formData, { headers });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/getbyid?id=${id}`);
  }

  // src/app/features/products/product.service.ts
updateStock(updates: any[]): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  // FORMAT EXACTLY AS REQUIRED
  const payload = updates.map(u => ({
    productId: u.id,
    quantity: u.quantity,
    action: u.action  // "INCREMENT" or "DECREMENT"
  }));

  return this.http.post(`${this.baseUrl}/update-stock`, payload, { headers,responseType: 'text' });
}
}
