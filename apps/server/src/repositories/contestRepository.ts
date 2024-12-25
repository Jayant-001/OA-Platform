import db from "../config/database";
import { Contest, ContestProblem } from "../models/contest";
import { Repository, getConnection, Connection } from "typeorm";

export class ContestRepository extends Repository<Contest> {
    async findAll(): Promise<Contest[]> {
        const contests = await db.any("SELECT * FROM contests");
        // for (const contest of contests) {
        //     const problems = await db.any("SELECT problem_id FROM contest_problems WHERE contest_id = $1", [contest.id]);
        //     const users = await db.any("SELECT user_id FROM contest_users WHERE contest_id = $1", [contest.id]);
        //     contest.problems = problems.map(p => p.problem_id);
        //     contest.users = users.map(u => u.user_id);
        // }
        return contests;
    }

    async findById(id: string): Promise<Contest | null> {
        const contest = await db.oneOrNone("SELECT * FROM contests WHERE id = $1", [id]);
        if (contest) {
            const problems = await db.any("SELECT problem_id, points FROM contest_problems WHERE contest_id = $1", [contest.id]);
            const users = await db.any("SELECT user_id FROM contest_users WHERE contest_id = $1", [contest.id]);
            contest.problems = problems.map(p => ({ problem_id: p.problem_id, points: p.points }));
            contest.users = users.map(u => u.user_id);
        }
        return contest;
    }

    async findByIdWithoutDetails(id: string): Promise<Contest | null> {
        return db.oneOrNone("SELECT * FROM contests WHERE id = $1", [id]);
    }

    async createContest(
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

    async updateContest(
        id: string,
        contest: Partial<Omit<Contest, "id" | "created_at" | "updated_at" | "created_by">>
    ): Promise<void> {
        const fields = Object.keys(contest)
            .filter(key => key !== "created_by") // Ensure created_by is omitted
            .map((key, index) => `${key} = $${index + 2}`)
            .join(", ");
        const values = Object.values(contest).filter((_, index) => {
            const key = Object.keys(contest)[index];
            return key !== "created_by";
        });
        await db.none(
            `UPDATE contests SET ${fields}, updated_at = NOW() WHERE id = $1`,
            [id, ...values]
        );
    }

    async deleteContest(id: string): Promise<void> {
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

    async deleteProblemsFromContest(contest_id: string): Promise<void> {
        await db.none(
            `DELETE FROM contest_problems WHERE contest_id = $1`,
            [contest_id]
        );
    }


    async addUsersToContest(contest_id: string, user_ids: string[]): Promise<void> {

        console.log(user_ids);
        // Begin the transaction
        await db.query('BEGIN');

        try {
            // Delete existing users from the contest
            await db.query(
                `DELETE FROM contest_users WHERE contest_id = $1`,
                [contest_id]
            );

            if (user_ids.length > 0) {
                // Add new users to the contest
                const values = user_ids
                    .map(user_id => `('${contest_id}', '${user_id}')`)
                    .join(", ");
                await db.query(
                    `INSERT INTO contest_users (contest_id, user_id) VALUES ${values}`
                );
            }

            // Commit the transaction
            await db.query('COMMIT');
        } catch (error) {
            // Rollback the transaction in case of an error
            await db.query('ROLLBACK');
            throw error;
        }
    }


    async isContestCodeUnique(contest_code: string): Promise<boolean> {
        const contest = await db.oneOrNone("SELECT 1 FROM contests WHERE contest_code = $1", [contest_code]);
        return contest === null;
    }

    async isContestCodeUniquewithId(contest_code: string, contestId: string): Promise<boolean> {
        const contest = await db.oneOrNone("SELECT 1 FROM contests WHERE contest_code = $1 AND id<>$2", [contest_code, contestId]);
        return contest === null;
    }

    async findUpcomingContestsByUserId(userId: string): Promise<Contest[]> {
        const query = `
            SELECT c.*
            FROM contests c
            JOIN contest_users cu ON c.id = cu.contest_id
            WHERE cu.user_id = $1
            AND (
                (c.strict_time = true AND c.start_time + INTERVAL '1 second' * c.duration > NOW())
                OR
                (c.strict_time = false AND cu.joined_at + INTERVAL '1 second' * c.duration > NOW())
            )
        `;
        const values = [userId];
        const result = await db.query(query, values);
        return result;
    }

    async findUserContest(contest_id: string, user_id: string): Promise<{ joined_at: Date } | null> {
        return db.oneOrNone(
            `SELECT joined_at FROM contest_users WHERE contest_id = $1 AND user_id = $2`,
            [contest_id, user_id]
        );
    }

    async addProblemsToContest(contest_id: string, problems: ContestProblem[] | []): Promise<void> {

        console.log(contest_id, problems);
        // Begin the transaction
        await db.query('BEGIN');

        try {
            // Delete existing problems from the contest
            await db.query(
                `DELETE FROM contest_problems WHERE contest_id = $1`,
                [contest_id]
            );

            if (problems.length > 0) {
                // Add new problems to the contest
                const values = problems
                    .map(({ problem_id, points }) => `('${contest_id}', '${problem_id}', ${points})`)
                    .join(", ");
                await db.query(
                    `INSERT INTO contest_problems (contest_id, problem_id, points) VALUES ${values}`
                );
            }

            // Commit the transaction
            await db.query('COMMIT');
        } catch (error) {
            // Rollback the transaction in case of an error
            await db.query('ROLLBACK');
            throw error;
        }
    }

    async findProblemsByContestId(contestId: string): Promise<{ problem_id: string, title: string, points: number }[]> {
        const query = `
            SELECT p.id as problem_id, p.title, cp.points
            FROM contest_problems cp
            JOIN problems p ON cp.problem_id = p.id
            WHERE cp.contest_id = $1
        `;
        return db.any(query, [contestId]);
    }

}
