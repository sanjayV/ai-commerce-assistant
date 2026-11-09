import type { Request, Response } from "express";
import {
    pipeUIMessageStreamToResponse,
    toUIMessageStream,
    type UIMessage,
} from "ai";

import { chatService } from "../services/chat.service";

interface ChatRequestBody {
    messages: UIMessage[];
}

export async function chatController(
    req: Request<{}, {}, ChatRequestBody>,
    res: Response
) {
    try {
        const { messages } = req.body;

        // Basic validation
        if (!Array.isArray(messages) || messages.length === 0) {
            res.status(400).json({
                error: "Messages are required",
            });
            return;
        }

        // Call chat service
        const result = await chatService(messages);

        // Stream AI response to frontend
        pipeUIMessageStreamToResponse({
            response: res,
            stream: toUIMessageStream({
                stream: result.stream,
            }),
        });

    } catch (error) {
        console.error("Chat API error:", error);

        if (!res.headersSent) {
            res.status(500).json({
                error: "Failed to generate AI response",
            });
        }
    }
}