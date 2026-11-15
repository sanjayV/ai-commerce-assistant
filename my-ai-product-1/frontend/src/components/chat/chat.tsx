
'use client';

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import type { ChatMessage } from "../../types/chat";
import ProductCard from "../productCard/produtCard";
import { DefaultChatTransport } from "ai";
import './chat.css';

export default function Chat() {
    const [input, setInput] = useState("");

    const {
        messages,
        sendMessage,
        status,
        error,
        stop,
        regenerate,
    } = useChat<ChatMessage>({
        transport: new DefaultChatTransport({
            api: "http://localhost:3001/api/chat",
        }),
        onError: (error) => {
            console.error("Chat error:", error);
        },
    });

    const isLoading =
        status === "submitted" || status === "streaming";

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!input.trim() || isLoading) return;

        sendMessage({ text: input });
        setInput("");
    };

    return (
        <div className="chat-container">

            <div className="chat-messages">

                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`message ${message.role}`}
                    >
                        {message.parts
                        .filter((part) => part.type === "text")
                        .map((part, index) => (
                            <p key={index}>
                                {part.text}
                            </p>
                        ))}

                        {/* 2. Render product cards second */}
                        {message.parts
                            .filter((part) => part.type === "data-products")
                            .map((part, index) => (
                                <div key={index} className="product-list">
                                    {part.data.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                        />
                                    ))}
                                </div>
                            ))}
                    </div>
                ))}

                {status === "submitted" && (
                    <div className="loading">
                        AI is thinking...
                    </div>
                )}

                {error && (
                    <div className="error">
                        Something went wrong. Please try again.

                        <button onClick={() => regenerate()}>
                            Retry
                        </button>
                    </div>
                )}

            </div>

            <form
                className="chat-input-form"
                onSubmit={handleSubmit}
            >
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about products or reviews..."
                    disabled={isLoading}
                />

                {isLoading ? (
                    <button
                        type="button"
                        className="stop-button"
                        onClick={stop}
                    >
                        Stop
                    </button>
                ) : (
                    <button
                        type="submit"
                        disabled={!input.trim()}
                    >
                        Send
                    </button>
                )}
            </form>

        </div>
    );
}
