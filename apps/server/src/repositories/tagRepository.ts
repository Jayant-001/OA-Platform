import db from "../config/database";
import { Tag } from "../models/tag";

export class TagRepository {
    async findAll(): Promise<Tag[]> {
        return db.any("SELECT * FROM tags");
    }

    async findById(id: string): Promise<Tag | null> {
        return db.oneOrNone("SELECT * FROM tags WHERE id = $1", [id]);
    }

    async create(tagName: string, tagCode: string): Promise<Tag> {
        return db.one(
            `INSERT INTO tags (name, code) 
             VALUES ($1, $2) RETURNING *`,
            [tagName, tagCode]
        );
    }

    async update(id: string, tag: Partial<Omit<Tag, "id" | "created_at" | "updated_at">>): Promise<void> {
        const fields = Object.keys(tag)
            .map((key, index) => `${key} = $${index + 2}`)
            .join(", ");
        const values = Object.values(tag);
        await db.none(
            `UPDATE tags SET ${fields}, updated_at = NOW() WHERE id = $1`,
            [id, ...values]
        );
    }

    async delete(id: string): Promise<void> {
        await db.none("DELETE FROM tags WHERE id = $1", [id]);
    }
}
