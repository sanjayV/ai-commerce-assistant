import { embed, embedMany, cosineSimilarity } from "ai";
import { ollama } from "ai-sdk-ollama";
import { readFile } from "node:fs/promises";

const embeddingModel = ollama.embedding("nomic-embed-text");


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

// Customer question
const customerQuestion = "Are these shoes comfortable for long-distance running?";

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

    // Extract only the text content from documents
    const documentTexts = documents.map(
        (document) => document.content
    );

    // Generate embeddings for all documents
    const { embeddings } = await embedMany({
        model: embeddingModel,
        values: documentTexts,
    });

    const documentsWithEmbeddings = documents.map(
        (document, index) => {
            const embedding = embeddings[index];

            if (!embedding) {
                throw new Error(
                    `Missing embedding for ${document.id}`
                );
            }

            return {
                ...document,
                embedding,
            };
        }
    );

    // Generate question embedding
    const { embedding: questionEmbedding } = await embed({
        model: embeddingModel,
        value: customerQuestion,
    });

    // Calculate similarity between question and each document
    const scoredDocuments = documentsWithEmbeddings.map(
        (document) => {
            const similarity = cosineSimilarity(
                questionEmbedding,
                document.embedding
            );

            return {
                ...document,
                similarity,
            };
        }
    );

    // Sort documents by similarity (highest first)
    const sortedDocuments = [...scoredDocuments].sort(
        (a, b) => b.similarity - a.similarity
    );

    // Retrieve top 5 documents
    const topResults = sortedDocuments.slice(0, 5);

    console.log("\nTop 5 matching documents:");

    topResults.forEach((document, index) => {
        console.log(`\n${index + 1}. ${document.id}`);
        console.log(`Type: ${document.metadata.type}`);
        console.log(`Product ID: ${document.metadata.productId}`);
        console.log(`Similarity: ${document.similarity.toFixed(4)}`);
        console.log(`Content: ${document.content}`);
    });

    // console.log("\nEmbedding generation completed!");

    // console.log("Documents passed:", documentTexts.length);
    // console.log("Embeddings generated:", embeddings.length);
    // console.log("Vector dimensions:", embeddings[0]?.length);
    // console.log("\nEmbedded documents:");

    // console.log(
    //     documentsWithEmbeddings.map((document) => ({
    //         id: document.id,
    //         type: document.metadata.type,
    //         dimensions: document.embedding.length,
    //         firstFiveValues: document.embedding.slice(0, 5),
    //     }))
    // );

    // console.log("\nCustomer question:");
    // console.log(customerQuestion);

    // console.log("\nQuestion embedding:");
    // console.log("Vector dimensions:", questionEmbedding.length);
    // console.log("First 5 values:", questionEmbedding.slice(0, 5));
}

main().catch(console.error);