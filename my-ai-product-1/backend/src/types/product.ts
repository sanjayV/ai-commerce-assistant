export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  color: string;
  material: string;
  occasions: string[];
  image_url: string;
  active: boolean;
}