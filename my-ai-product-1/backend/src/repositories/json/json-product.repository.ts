import { readFile } from "node:fs/promises";
import path from "node:path";

import { ProductRepository } from "../interfaces/product.repository";
import { Product } from "../../types/product";

export class JsonProductRepository implements ProductRepository {

    private async getProducts(): Promise<Product[]> {
        const filePath = path.resolve(process.cwd(), "src/data/products.json");

        const data = await readFile(filePath, "utf-8");

        return JSON.parse(data) as Product[];
    }

    async findAll(): Promise<Product[]> {
        return this.getProducts();
    }

    async findById(id: string): Promise<Product | null> {
        const products = await this.getProducts();

        return products.find(product => product.id === id) ?? null;
    }
}