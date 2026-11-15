
import {
    convertToModelMessages,
    createUIMessageStream,
    streamText,
} from "ai";

import type { ChatMessage } from "../types/chat";
import { model } from "../config/model";
import { ProductSearchService } from "./product-search.service";

const productSearchService = new ProductSearchService();

// Demo tenant only.
// In production, get this from authenticated user context.
const DEMO_TENANT_ID = "site-01";

export async function chatService(messages: ChatMessage[]) {

    const modelMessages = await convertToModelMessages(messages);

    const lastUserMessage = [...messages]
        .reverse()
        .find(message => message.role === "user");

    const query = lastUserMessage?.parts
        .filter(part => part.type === "text")
        .map(part => part.text)
        .join(" ") ?? "";

    const stream = createUIMessageStream<ChatMessage>({
        execute: async ({ writer }) => {

            try {

            writer.write({ type: "start" });

            // Search products based on user query
            const products = await productSearchService.searchProducts(
                query,
                DEMO_TENANT_ID
            );

            console.log("User query:", query);
            console.log("Retrieved products:", products.map(p => ({
                id: p.id,
                name: p.name,
                price: p.price
            })));

            // Stream actual product records
            writer.write({
                type: "data-products",
                data: products,
            });

            // Prepare product context for LLM
            // const productContext = products.length
            //     ? JSON.stringify(products)
            //     : "No matching products were found.";
            const productContext = products.map((product, index) => ({
                number: index + 1,
                id: product.id,
                name: product.name,
                category: product.category,
                price: `${product.currency} ${product.price}`,
                color: product.color,
                material: product.material,
                occasions: product.occasions,
                averageRating: product.averageRating,
                reviewCount: product.reviewCount,
            }));

            // Generate natural-language response
            const systemPrompt = `
            You are an AI Commerce Assistant.

            You help customers discover products from our ecommerce catalog.

            IMPORTANT: The product catalog below contains the ONLY products
            available for recommendation.

            USER SEARCH QUERY:
            ${query}

            MATCHING PRODUCTS FROM DATABASE:
            ${JSON.stringify(productContext, null, 2)}

            YOUR RESPONSIBILITIES:

            1. Recommend products only from the matching products list.
            2. Use the exact product names from the catalog.
            3. Use the exact prices from the catalog.
            4. Never invent product names, prices, ratings or attributes.
            5. Explain briefly why each product matches the user's query.
            6. If products are available, mention their actual names in your response.
            7. If no products are available, clearly inform the user.
            8. Do not recommend products that are not in the supplied catalog.

            RESPONSE FORMAT:

            If products are available:

            "I found these products matching your requirements:

            1. [Exact Product Name] - [Exact Price]
            [Short explanation]

            2. [Exact Product Name] - [Exact Price]
            [Short explanation]"

            If no products are available:

            "I couldn't find any products matching your requirements.
            Would you like to try a different search?"

            Keep the response concise and friendly.
            `;

            const result = streamText({
                model,
                messages: modelMessages,
                system: systemPrompt,
                temperature: 0,
            });

            writer.merge(
                result.toUIMessageStream({
                    sendStart: false,
                })
            );
            } catch (error) {
                console.log('catch stream errror:', error);
                throw error;
            }
        }
    });

    return stream;
}
