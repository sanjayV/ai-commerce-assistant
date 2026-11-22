import { Review } from "../../types/review";

export interface ReviewRepository {
    findAll(): Promise<Review[]>;
    findById(id: string): Promise<Review | null>;
}