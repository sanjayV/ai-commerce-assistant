import type { Product } from "./product";

export interface ProductSearchResult extends Product {
    averageRating: number;
    reviewCount: number;
}