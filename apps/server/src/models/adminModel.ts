// import { Pool } from "pg";
// import dotenv from "dotenv";
// dotenv.config();

// const pool = new Pool({
//     connectionString: process.env.DATABASE_URL,
// });

// export const getAdminByEmail = async (email: string) => {
//     const result = await pool.query("SELECT * FROM admin WHERE email = $1", [email]);
//     return result.rows[0];
// };

// export const createAdmin = async (adminData: any) => {
//     const { name, role, email, password, organization } = adminData;
//     const result = await pool.query(
//         "INSERT INTO admin (name, role, email, password, organization) VALUES ($1, $2, $3, $4, $5) RETURNING *",
//         [name, role, email, password, organization]
//     );
//     return result.rows[0];
// };
