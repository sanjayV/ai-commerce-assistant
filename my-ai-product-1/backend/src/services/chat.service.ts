import {
    streamText,
    convertToModelMessages,
    type UIMessage,
} from "ai";

import { model } from "../config/model";

export async function chatService(messages: UIMessage[]) {

    // Step 1: Convert frontend messages into model messages
    const modelMessages = await convertToModelMessages(messages);

    // Step 2: Send messages to LLM
    const result = streamText({
        model,
        messages: modelMessages,
    });

    // Step 3: Return streaming result
    return result;
}