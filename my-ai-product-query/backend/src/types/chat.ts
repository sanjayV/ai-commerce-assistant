import type { UIMessage } from "ai";
import type { ProductSearchResult } from "./product-search";

export type ChatDataParts = {
    products: ProductSearchResult[];
};

export type ChatMessage = UIMessage<
    never,
    ChatDataParts
>;