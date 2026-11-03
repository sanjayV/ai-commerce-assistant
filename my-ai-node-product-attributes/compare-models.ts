import { streamText } from "ai";
import { ollama } from 'ai-sdk-ollama';
const model = ollama('llama3.2:3b');
const MODEL_NAME = 'llama3.2:3b';

const prompt = `
  You are an ecommerce product assistant.

  Product:
  Premium Cotton T-Shirt
  Material: 100% Cotton
  Colour: Navy Blue
  Price: 799 INR

  Customer question:
  Is this product suitable for summer?
  Explain why and provide a recommendation.
`;

async function main() {
  const startTime = performance.now();
  let firstTokenTime: number | undefined;
  let response = "";

  const result = streamText({
    model,
    prompt,
  });

  for await (const chunk of result.textStream) {
    if (firstTokenTime === undefined) {
      firstTokenTime = performance.now();
    }

    response += chunk;
  }

  const endTime = performance.now();

  console.log("Response:");
  console.log(response);

  console.log("\nBenchmark Results:");
  console.log("----------------------------");

  console.table({
    Model: MODEL_NAME,
    "First Token (ms)": firstTokenTime
      ? Math.round(firstTokenTime - startTime)
      : "N/A",

    "Total Time (ms)": Math.round(endTime - startTime),

    "Response Length": response.length,
  });
}

main().catch(console.error);