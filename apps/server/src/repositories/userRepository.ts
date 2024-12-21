import db from "../config/database";
import { User } from "../models/user";

export class UserRepository {
    async findAll(): Promise<User[]> {
        return db.any("SELECT * FROM users");
    }

    async findById(id: number): Promise<User | null> {
        return db.oneOrNone("SELECT * FROM users WHERE id = $1", [id]);
    }

    async create(user: Omit<User, "id">): Promise<User> {
        return db.one(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
            [user.name, user.email, user.password]
        );
    }

    async update(id: number, user: Partial<Omit<User, "id">>): Promise<void> {
        const fields = Object.keys(user)
            .map((key, index) => `${key} = $${index + 2}`)
            .join(", ");
        const values = Object.values(user);
        await db.none(`UPDATE users SET ${fields} WHERE id = $1`, [
            id,
            ...values,
        ]);
    }

    async delete(id: number): Promise<void> {
        await db.none("DELETE FROM users WHERE id = $1", [id]);
    }
}
