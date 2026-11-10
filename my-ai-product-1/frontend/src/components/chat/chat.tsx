'use client';

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { DefaultChatTransport } from "ai";

export default function Chat() {
    const [input, setInput] = useState("");

    const {
        messages,
        sendMessage,
        status,
        error,
        stop,
        regenerate,
    } = useChat({
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
                        <strong>
                            {message.role === "user" ? "You" : "AI"}
                        </strong>

                        {message.parts.map((part, index) =>
                            part.type === "text" ? (
                                <p key={index}>{part.text}</p>
                            ) : null
                        )}
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

            <form onSubmit={handleSubmit}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                />

                <button type="submit" disabled={!input.trim() || isLoading}>
                    Send
                </button>

                {isLoading && (
                    <button type="button" onClick={stop}>
                        Stop
                    </button>
                )}
            </form>

        </div>
    );
}
