
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

            // Stream actual product records
            writer.write({
                type: "data-products",
                data: products,
            });

            // Prepare product context for LLM
            const productContext = products.length
                ? JSON.stringify(products)
                : "No matching products were found.";

            // Generate natural-language response
            const result = streamText({
                model,
                messages: modelMessages,
                system: `
                  You are an AI Commerce Assistant. 
                  Here are the products retrieved from our product database: ${productContext}
                  Rules:
                  1. Recommend only products from the retrieved results.
                  2. Never invent product names or prices.
                  3. If no products were found, clearly tell the user.
                  4. Keep your response friendly and concise.
                  5. Do not claim that a product matches a filter unless
                  its retrieved product data supports that claim.
                `,
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
