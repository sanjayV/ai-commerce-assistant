import { readFile } from "node:fs/promises";
import path from "node:path";

import { ReviewRepository } from "../interfaces/review.repository";
import { Review } from "../../types/review";

export class JsonReviewRepository implements ReviewRepository {

    private async getReviews(): Promise<Review[]> {
        const filePath = path.resolve(process.cwd(), "src/data/reviews.json");

        const data = await readFile(filePath, "utf-8");

        return JSON.parse(data) as Review[];
    }

    async findAll(): Promise<Review[]> {
        return this.getReviews();
    }

    async findById(id: string): Promise<Review | null> {
        const reviews = await this.getReviews();

        return reviews.find(review => review.id === id) ?? null;
    }

    async findByProductId(id: string): Promise<Review[]> {
        const reviews = await this.getReviews();

        return reviews.filter(review => review.product_id === id);
    }
}