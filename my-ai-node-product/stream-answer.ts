import { ModelMessage, streamText } from 'ai';
import 'dotenv/config';

import * as readline from 'node:readline/promises';
//import { google } from "@ai-sdk/google";
import { ollama } from 'ai-sdk-ollama';

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const messages: ModelMessage[] = [];

async function main() {
    //const productQuestion = "Is the UltraFit Waterproof Smartwatch suitable for deep sea diving?";
    const userInput = await terminal.question('You: ');

    messages.push({ role: 'user', content: userInput });

    //console.log(`Question: ${productQuestion}\n`);
    //console.log("Streaming response...");

    const result = await streamText({
        model: ollama('llama3.2:1b'),
        instructions: "You are a helpful e-commerce product expert. Provide accurate, clear, and concise answers based on general product specifications.",
        messages
    });

    // Iterate over the stream as chunks arrive
    let fullResponse = '';
    process.stdout.write('\nAssistant: ');
    for await (const delta of result.textStream) {
      fullResponse += delta;
      process.stdout.write(delta);
    }
    process.stdout.write('\n\n');

    messages.push({ role: 'assistant', content: fullResponse });
}

main().catch(console.error);
