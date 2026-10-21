'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export default function Chat() {
  const [input, setInput] = useState('');

  const {
    messages,
    sendMessage,
    status,
    error,
  } = useChat();

  const isLoading =
    status === 'submitted' || status === 'streaming';

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">
        My First AI Chat
      </h1>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className="p-3 rounded-lg bg-gray-100 dark:bg-zinc-900"
          >
            <strong>
              {message.role === 'user' ? 'You' : 'Gemini'}:
            </strong>

            {message.parts.map((part, i) =>
              part.type === 'text' ? (
                <div
                  key={`${message.id}-${i}`}
                  className="whitespace-pre-wrap mt-1"
                >
                  {part.text}
                </div>
              ) : null
            )}
          </div>
        ))}

        {isLoading && (
          <p className="text-sm text-gray-500">
            Gemini is thinking...
          </p>
        )}

        {error && (
          <p className="text-red-500">
            Error: {error.message}
          </p>
        )}
      </div>

      <form
        className="flex gap-2 border-t pt-4"
        onSubmit={(e) => {
          e.preventDefault();

          if (!input.trim() || isLoading) return;

          sendMessage({ text: input });
          setInput('');
        }}
      >
        <input
          className="flex-1 border rounded-lg p-3 dark:bg-zinc-900"
          value={input}
          placeholder="Ask Gemini anything..."
          onChange={(e) => setInput(e.currentTarget.value)}
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-blue-600 text-white rounded-lg px-5 py-2 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
