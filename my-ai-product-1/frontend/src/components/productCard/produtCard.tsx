
import type { Product } from "../../types/product";

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    return (
        <div className="product-card">

            <img
                src={product.image_url}
                alt={product.name}
            />

            <div className="product-info">
                <h3>{product.name}</h3>

                <p>{product.description}</p>

                <strong>
                    {product.currency} {product.price}
                </strong>

                <p>
                    Color: {product.color}
                </p>

                <p>
                    Material: {product.material}
                </p>
            </div>

        </div>
    );
}
