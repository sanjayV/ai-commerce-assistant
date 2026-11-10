import type { UIMessage } from "ai";
import type { Product } from "./product";

export type ChatDataParts = {
    products: Product[];
};

export type ChatMessage = UIMessage<
    never,
    ChatDataParts
>;