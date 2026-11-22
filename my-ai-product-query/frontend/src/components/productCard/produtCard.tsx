import type { ProductSearchResult } from "../../types/product-search";
import './productCard.css';

interface ProductCardProps {
    product: ProductSearchResult;
}

export default function ProductCard({ product }: ProductCardProps) {
    return (
        <div className="product-tile">
            <div className="product-tile__image">
                <img
                    src={product.image_url}
                    alt={product.name}
                    loading="lazy"
                />
            </div>

            <div className="product-tile__details">
                <h3>{product.name}</h3>

                <div className="product-tile__price">
                    {product.currency} {product.price}
                </div>

                <div className="product-tile__id">
                    {/* {product.id} */}
                    <span><label>Color:</label> {product.color}</span>
                    <span><label>Material:</label> {product.material}</span>
                </div>

                <div className="product-tile__rating">
                    {product.reviewCount > 0 ? (
                        <>
                            ⭐ {product.averageRating}/5
                            ({product.reviewCount} reviews)
                        </>
                    ) : (
                        "No reviews yet"
                    )}
                </div>
            </div>
        </div>
    );
}
