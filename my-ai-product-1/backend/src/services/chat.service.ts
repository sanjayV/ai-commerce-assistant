
import {
    convertToModelMessages,
    createUIMessageStream,
    streamText,
    toUIMessageStream,
} from "ai";

import type { ChatMessage } from "../types/chat";
import { model } from "../config/model";
import { JsonProductRepository } from "../repositories/json/json-product.repository";

const productRepository = new JsonProductRepository();

export async function chatService(messages: ChatMessage[]) {
    const modelMessages = await convertToModelMessages(messages);

    const stream = createUIMessageStream<ChatMessage>({
        execute: async ({ writer }) => {

            // Start assistant message
            writer.write({ type: "start" });

            // Get products from repository
            const allProducts = await productRepository.findAll();

            const products = allProducts
                .filter(product => product.active)
                .slice(0, 3);

            // Send structured product data
            writer.write({
                type: "data-products",
                data: products,
            });

            // Generate AI response
            const result = streamText({
                model,
                messages: modelMessages,
                system: `
                You are an AI shopping assistant.

                The following products are available:
                ${JSON.stringify(products)}

                Recommend only products from this list.
                Do not invent product names or prices.
                Keep your response friendly and concise.
                `,
            });

            // Merge AI text into the same stream
            writer.merge(
                result.toUIMessageStream({
                    sendStart: false,
                })
            );
        },
        onError: (error) => {
            console.error("UI Stream Error:", error);

            return error instanceof Error
                ? error.message
                : String(error);
        },
    });

    return stream;
}
