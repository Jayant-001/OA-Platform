import db from "../config/database";
import { User, UserDetails } from "../models/user";
import { UserRequest } from "../models/user";

export class UserRepository {
    async findAllUsers(): Promise<UserDetails[]> {
        return db.any(
            "SELECT * FROM user_details JOIN users On user_id=users.id where role='user'"
        );
    }

    async findAllAdmins(): Promise<User[]> {
        return db.any("SELECT * FROM users  where role='admin'");
    }

    async findUserById(userId: string): Promise<UserRequest | null> {
        return db.oneOrNone(
            "SELECT * FROM user_details JOIN users On user_id=users.id where user_id=$1",
            [userId]
        );
    }

    async findAdminById(userId: string): Promise<User | null> {
        return db.oneOrNone("SELECT * FROM users where id=$1", [userId]);
    }

    async createUser(user: Omit<UserRequest, "id">): Promise<void> {
        await db.tx(async (t) => {
            const userId = await t.one(
                `INSERT INTO users (name, email, role, password)
                 VALUES ($1, $2, $3, $4) RETURNING id`,
                [user.name, user.email, user.role, user.password]
            );

            if (user.role === "user") {
                await t.none(
                    `INSERT INTO user_details (college, batch, branch, user_id)
                     VALUES ($1, $2, $3, $4)`,
                    [user.college, user.batch, user.branch, userId.id]
                );
            }
        });
    }

    async update(userId: string, user: Partial<User>): Promise<void> {
        const fields = Object.keys(user)
            .map((key, index) => `${key} = $${index + 2}`)
            .join(", ");
        const values = Object.values(user);
        await db.none(
            `UPDATE users SET ${fields}, updated_at = NOW() WHERE id = $1`,
            [userId, ...values]
        );
    }

    async findByEmail(email: string): Promise<User | null> {
        return db.oneOrNone("SELECT * FROM users WHERE email = $1", [email]);
    }

    async userExists(userId: string): Promise<boolean> {
        const result = await db.oneOrNone("SELECT 1 FROM users WHERE id = $1", [
            userId,
        ]);
        return result !== null;
    }

    async getUsersEmailAndNameByUserIds(userIds: string[]) {
        const userDetailsQuery = `
            SELECT id, name, email
            FROM users
            WHERE id = ANY($1::uuid[]);
        `;
        return await db.any(userDetailsQuery, [userIds]);
    }
}
