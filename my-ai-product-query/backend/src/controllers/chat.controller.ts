
import type { Request, Response } from "express";
import {
    pipeUIMessageStreamToResponse,
} from "ai";

import { chatService } from "../services/chat.service";
import type { ChatMessage } from "../types/chat";

export async function chatController(
    req: Request,
    res: Response
) {
    try {
        const { messages } = req.body as {
            messages: ChatMessage[];
        };

        if (!Array.isArray(messages) || messages.length === 0) {
            res.status(400).json({
                error: "Messages are required",
            });
            return;
        }

        const stream = await chatService(messages);

        pipeUIMessageStreamToResponse({
            response: res,
            stream,
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
