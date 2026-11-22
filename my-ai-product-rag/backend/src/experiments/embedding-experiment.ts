import { readFile } from "node:fs/promises";

interface ProductRecord {
    id: string;
    content: string;
}

interface ReviewRecord {
    id: string;
    product_id: string;
    content: string;
}

interface ExperimentDocument {
    id: string;
    content: string;
    metadata: {
        type: "product" | "review";
        productId: string;
    };
}

async function main() {
    // Load existing JSON files
    const products = JSON.parse(
        await readFile(
            new URL("../data/products.json", import.meta.url),
            "utf-8"
        )
    ) as ProductRecord[];

    const reviews = JSON.parse(
        await readFile(
            new URL("../data/reviews.json", import.meta.url),
            "utf-8"
        )
    ) as ReviewRecord[];

    // Convert products into unified documents
    const productDocuments: ExperimentDocument[] = products.map(
        (product) => ({
            id: `product-${product.id}`,
            content: product.content,
            metadata: {
                type: "product",
                productId: product.id,
            },
        })
    );

    // Convert reviews into unified documents
    const reviewDocuments: ExperimentDocument[] = reviews.map(
        (review) => ({
            id: `review-${review.id}`,
            content: review.content,
            metadata: {
                type: "review",
                productId: review.product_id,
            },
        })
    );

    // Combine both document types
    const documents = [
        ...productDocuments,
        ...reviewDocuments,
    ];

    console.log("Total documents:", documents.length);
    console.log("Product documents:", productDocuments.length);
    console.log("Review documents:", reviewDocuments.length);

    console.log("\nPrepared documents:");
    console.log(documents);
}

main().catch(console.error);