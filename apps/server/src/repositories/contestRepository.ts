import db from "../config/database";
import { Contest } from "../models/contest";

export class ContestRepository {
    async findAll(): Promise<Contest[]> {
        return db.any("SELECT * FROM contests");
    }

    async findById(id: string): Promise<Contest | null> {
        return db.oneOrNone("SELECT * FROM contests WHERE id = $1", [id]);
    }

    async create(
        contest: Omit<Contest, "id" | "created_at" | "updated_at">
    ): Promise<Contest> {
        return db.one(
            `INSERT INTO contests (title, description, start_time,duration, contest_code, join_duration, strict_time, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7,$8) RETURNING *`,
            [
                contest.title,
                contest.description,
                contest.start_time,
                contest.duration,
                contest.contest_code,
                contest.join_duration,
                contest.strict_time,
                contest.created_by,
            ]
        );
    }

    async update(
        id: string,
        contest: Partial<Omit<Contest, "id" | "created_at" | "updated_at">>
    ): Promise<void> {
        const fields = Object.keys(contest)
            .map((key, index) => `${key} = $${index + 2}`)
            .join(", ");
        const values = Object.values(contest);
        await db.none(
            `UPDATE contests SET ${fields}, updated_at = NOW() WHERE id = $1`,
            [id, ...values]
        );
    }

    async delete(id: string): Promise<void> {
        await db.none("DELETE FROM contests WHERE id = $1", [id]);
    }

    async problemExistsInContest(contest_id: string, problem_id: string): Promise<boolean> {
        const result = await db.oneOrNone(
            `SELECT 1 FROM contest_problems WHERE contest_id = $1 AND problem_id = $2`,
            [contest_id, problem_id]
        );
        return result !== null;
    }

    async addProblemToContest(contest_id: string, problem_id: string, points: number): Promise<void> {
        await db.none(
            `INSERT INTO contest_problems (contest_id, problem_id, points) 
             VALUES ($1, $2, $3)`,
            [contest_id, problem_id, points]
        );
    }

    async updateProblemInContest(contest_id: string, problem_id: string, points: number): Promise<void> {
        await db.none(
            `UPDATE contest_problems SET points = $3 
             WHERE contest_id = $1 AND problem_id = $2`,
            [contest_id, problem_id, points]
        );
    }

    async deleteProblemFromContest(contest_id: string, problem_id: string): Promise<void> {
        await db.none(
            `DELETE FROM contest_problems
             WHERE contest_id = $1 AND problem_id = $2`,
            [contest_id, problem_id]
        );
    }

    async addUsersToContest(contest_id: string, user_ids: string[]): Promise<void> {
        const values = user_ids.map(user_id => `('${contest_id}', '${user_id}')`).join(", ");
        await db.none(
            `INSERT INTO contest_users (contest_id, user_id) 
             VALUES ${values}`
        );
    }

    async isContestCodeUnique(contest_code: string): Promise<boolean> {
        const contest = await db.oneOrNone("SELECT 1 FROM contests WHERE contest_code = $1", [contest_code]);
        return contest === null;
    }
}
