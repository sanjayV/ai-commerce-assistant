import { generateText, Output } from "ai";
import { z } from "zod";
import 'dotenv/config';
// import { google } from "@ai-sdk/google";
import { ollama } from 'ai-sdk-ollama';
const model = ollama('llama3.2:1b');
//const model = google("gemini-3.8-flash");

// Define the expected output structure.
const productSchema = z.object({
  color: z.string().describe(
    "Product colour. Null if not available."
  ),

  material: z.string().describe(
    "Main material used in the product. Null if unknown."
  ),

  occasion: z.array(z.string()).describe(
    "Suitable occasions for using or wearing the product."
  ),
});

// const productSchema = z.object({
//   colour: z.string().describe("The primary or secondary colors mentioned."),
//   material: z.string().describe("The main fabric or construction material."),
//   occasion: z.array(z.string()).describe("List of ideal events or settings to wear or use this product."),
// });

// Sample product description.
const productDescription = `
  This elegant navy blue cotton dress is designed for women.

  Made from 100% breathable cotton fabric, this lightweight
  dress offers excellent comfort.

  Perfect for casual outings, summer vacations and beach parties.
`;

async function main() {

  const { output } = await generateText({
    model,

    output: Output.object({
      schema: productSchema,
    }),

    prompt: `
      Extract product attributes from the following description.

      Product description:
      ${productDescription}

      Rules:
      - Extract only information supported by the description.
      - Do not invent missing attributes.
      - Return colour and material as null if unknown.
      - Return occasions as an array.
    `,
  });

  console.log("\nExtracted product attributes:\n");

  console.log(JSON.stringify(output, null, 2));
}

main().catch(console.error);
