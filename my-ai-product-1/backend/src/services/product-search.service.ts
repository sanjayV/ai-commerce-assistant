import type { Product } from "../types/product";
import type { Review } from "../types/review";
import type { ProductSearchResult } from "../types/product-search";

import { JsonProductRepository } from "../repositories/json/json-product.repository";
import { JsonReviewRepository } from "../repositories/json/json-review.repository";

const productRepository = new JsonProductRepository();
const reviewRepository = new JsonReviewRepository();

const STOP_WORDS = new Set([
    "show", "me", "find", "get", "give", "i", "want",
    "some", "the", "a", "an", "for", "with", "under",
    "below", "less", "than", "products", "product",
    "please", "and", "or", "in", "on", "of", "to"
]);

const COLORS = [
    "navy blue", "light blue", "black", "white", "pink",
    "red", "blue", "green", "grey", "gray", "brown",
    "beige", "purple", "yellow", "maroon"
];

const MATERIALS = [
    "stainless steel", "synthetic leather", "organic cotton",
    "cotton", "denim", "leather", "silk", "polyester",
    "ceramic", "mesh", "rubber", "aluminium"
];

const OCCASIONS = [
    "summer vacation", "daily wear", "weekend trip",
    "travel", "running", "gym", "office", "casual",
    "wedding", "festive", "yoga", "school", "fitness"
];

function findPhrase(text: string, values: string[]) {
    return values.filter(value => text.includes(value));
}

function extractMaxPrice(query: string): number | undefined {
    const match = query.match(
        /(?:under|below|less than|up to|within|max(?:imum)?|budget(?: of)?|₹|rs\.?)\s*₹?\s*([\d,]+)|₹\s*([\d,]+)/
    );

    const value = match?.[1] ?? match?.[2];

    return value ? Number(value.replace(/,/g, "")) : undefined;
}

function normalizeToken(word: string): string {
    const synonyms: Record<string, string> = {
        dresses: "dress",
        shoes: "shoe",
        travelling: "travel",
        headphones: "headphone",
        pants: "pant"
    };

    return synonyms[word] ?? word;
}

function tokenize(query: string): string[] {
    return query
        .toLowerCase()
        .replace(/[₹,]/g, " ")
        .split(/\s+/)
        .map(normalizeToken)
        .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

function calculateRating(reviews: Review[]) {
    if (reviews.length === 0) return 0;

    const total = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
    );

    return Number((total / reviews.length).toFixed(1));
}

export class ProductSearchService {

    async searchProducts(
        query: string,
        tenantId: string
    ): Promise<ProductSearchResult[]> {

        const normalizedQuery = query.toLowerCase();

        const maxPrice = extractMaxPrice(normalizedQuery);
        const sortByRating = /highly rated|best rated|top rated/i.test(normalizedQuery);

        const colors = findPhrase(normalizedQuery, COLORS);
        const materials = findPhrase(normalizedQuery, MATERIALS);
        const occasions = findPhrase(normalizedQuery, OCCASIONS);

        const keywords = tokenize(normalizedQuery);

        const products = await productRepository.findAll();
        const reviews = await reviewRepository.findAll();

        const results = products
            .filter(product => {
                if (product.tenant_id !== tenantId) return false;
                if (!product.active) return false;

                // Price filter
                if (maxPrice !== undefined && product.price > maxPrice) {
                    return false;
                }

                // Color filter
                if (
                    colors.length > 0 &&
                    !colors.some(color => product.color.toLowerCase().includes(color))
                ) {
                    return false;
                }

                // Material filter
                if (
                    materials.length > 0 &&
                    !materials.some(material =>
                        product.material.toLowerCase().includes(material)
                    )
                ) {
                    return false;
                }

                // Occasion filter
                if (
                    occasions.length > 0 &&
                    !product.occasions.some(occasion =>
                        occasions.some(searchOccasion =>
                            occasion.toLowerCase().includes(searchOccasion)
                        )
                    )
                ) {
                    return false;
                }

                return true;
            })
            .map((product: Product) => {

                const productReviews = reviews.filter(
                    review =>
                        review.product_id === product.id &&
                        review.tenant_id === tenantId
                );

                const reviewText = productReviews
                    .map(review => `${review.title} ${review.body}`)
                    .join(" ")
                    .toLowerCase();

                const searchableText = [
                    product.name,
                    product.description,
                    product.category,
                    product.color,
                    product.material,
                    ...product.occasions
                ].join(" ").toLowerCase();

                // Calculate keyword relevance
                const score = keywords.reduce((total, keyword) => {
                    let points = 0;

                    if (product.name.toLowerCase().includes(keyword)) points += 5;
                    if (searchableText.includes(keyword)) points += 2;
                    if (reviewText.includes(keyword)) points += 1;

                    return total + points;
                }, 0);

                return {
                    ...product,
                    averageRating: calculateRating(productReviews),
                    reviewCount: productReviews.length,
                    searchScore: score
                };
            })
            .filter(product => {
                // If there are no meaningful keywords, retain filter matches.
                // Otherwise require at least one keyword match.
                return keywords.length === 0 || product.searchScore > 0;
            })
            .sort((a, b) => {
                if (sortByRating) {
                    return b.averageRating - a.averageRating;
                }

                return b.searchScore - a.searchScore;
            })
            .slice(0, 10);

        return results.map(({ searchScore, ...product }) => product);
    }
}
