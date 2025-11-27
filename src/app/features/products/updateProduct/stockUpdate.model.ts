export interface StockUpdateRequest {
  id: number;
  quantity: number;        // amount to add/remove
  action: string
}