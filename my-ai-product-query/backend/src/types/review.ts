export interface Review {
  id: string;
  tenant_id: string;
  product_id: string;
  rating: number;
  title: string;
  body: string;
  verified_purchase: boolean;
  created_at: string;
}