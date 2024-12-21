// import { Pool } from "pg";
// import {db} from "../config/database";
// import dotenv from "dotenv";
// dotenv.config();

// const pool = new Pool({
//     connectionString: process.env.DATABASE_URL,
// });

// export const getUserByEmail = async (email: string) => {
//     const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
//     return result.rows[0];
// };

// export const createUser = async (userData: any) => {
//     const { name, email, password, college, batch, branch } = userData;
//     const result = await pool.query(
//         "INSERT INTO users (name, email, password, college, batch, branch) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
//         [name, email, password, college, batch, branch]
//     );
//     return result.rows[0];
// };
