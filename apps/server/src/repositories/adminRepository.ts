import db from "../config/database";
import { Admin } from "../models/admin";

export class AdminRepository {
    async findAll(): Promise<Admin[]> {
        return db.any("SELECT * FROM admins");
    }

    async findById(id: string): Promise<Admin | null> {
        return db.oneOrNone("SELECT * FROM admins WHERE id = $1", [id]);
    }

    async create(admin: Omit<Admin, "id" | "created_at" | "updated_at">): Promise<Admin> {
        return db.one(
            `INSERT INTO admins (name, role, email, password, organization) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [
                admin.name,
                admin.role,
                admin.email,
                admin.password,
                admin.organization,
            ]
        );
    }

    async update(id: string, admin: Partial<Omit<Admin, "id" | "created_at" | "updated_at">>): Promise<void> {
        const fields = Object.keys(admin)
            .map((key, index) => `${key} = $${index + 2}`)
            .join(", ");
        const values = Object.values(admin);
        await db.none(`UPDATE admins SET ${fields} WHERE id = $1`, [id, ...values]);
    }

    async delete(id: string): Promise<void> {
        await db.none("DELETE FROM admins WHERE id = $1", [id]);
    }

    async findByEmail(email: string): Promise<Admin | null> {
        return db.oneOrNone("SELECT * FROM admins WHERE email = $1", [email]);
    }
}
