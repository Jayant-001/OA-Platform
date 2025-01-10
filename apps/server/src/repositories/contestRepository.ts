import db from "../config/database";
import { CustomException } from "../errors/CustomException";
import { Contest, ContestProblem } from "../models/contest";
import { UserDetails } from "../models/user";

export class ContestRepository {
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
            const problems = await db.any("SELECT problem_id,problems.title AS problem_name, points FROM contest_problems JOIN problems On problem_id=problems.id WHERE contest_id = $1", [contest.id]);
            const users = await db.any("SELECT COUNT(*) FROM contest_users WHERE contest_id = $1", [contest.id]);
            contest.problems = problems.map(p => ({ problem_id: p.problem_id, points: p.points }));
            contest.registered_users = parseInt(users[0].count, 10);
        }
        return contest;
    }

    async findAllUsersOfContest(id: string): Promise<UserDetails[] | null> {

        const users = await db.any("SELECT * FROM contest_users JOIN user_details On contest_users.user_id=user_details.user_id JOIN users ON contest_users.user_id=users.id WHERE contest_id = $1", [id]);
        return users;
    }

    async findByIdWithoutDetails(id: string, userId: string): Promise<Contest | null> {
        const query = `
            SELECT c.*
            FROM contests c
            WHERE c.id = $1
        `;
        const values = [id];
        const contest = await db.oneOrNone(query, values);

        return contest;
    }

    async createContest(
        contest: Omit<Contest, "id" | "created_at" | "updated_at">
    ): Promise<Contest> {
        return db.one(
            `INSERT INTO contests (title, description, start_time,duration, contest_code, buffer_time, strict_time, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7,$8) RETURNING *`,
            [
                contest.title,
                contest.description,
                contest.start_time,
                contest.duration,
                contest.contest_code,
                contest.buffer_time,
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
                (c.strict_time = true AND c.start_time + INTERVAL '60 second' * c.duration > NOW())
                OR
                (c.strict_time = false AND cu.joined_at + INTERVAL '60 second' * c.duration > NOW())
            )
        `;
        const values = [userId];
        const result = await db.query(query, values);
        return result;
    }

    async findRegisteredUpcomingContestsByUserId(userId: string): Promise<Contest[]> {
        const query = `
            SELECT c.*
            FROM contests c
            JOIN contest_users cu ON c.id = cu.contest_id
            WHERE cu.user_id = $1
            AND (
                (c.strict_time = true AND c.start_time + INTERVAL '60 second' * c.duration > NOW())
                OR
                (c.strict_time = false AND c.start_time + INTERVAL '60 second' * (c.buffer_time + c.duration) > NOW())
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

    async findProblemsByContestId(contestId: string, userId: string): Promise<{ id: string, title: string, points: number }[]> {
        return db.tx(async t => {
            const query = `
                SELECT c.*
                FROM contests c
                JOIN contest_users cu ON c.id = cu.contest_id
                WHERE cu.user_id = $1 AND cu.contest_id = $2
                AND (
                    (c.strict_time = true AND c.start_time + INTERVAL '60 second' * c.duration > NOW())
                    OR
                    (c.strict_time = false AND c.start_time + INTERVAL '60 second' * (c.buffer_time + c.duration) > NOW())
                )
            `;
            const values = [userId, contestId];
            const result = await t.oneOrNone(query, values);
            if (result) {
                // Check if join_time is null and update it
                await t.none(
                    `UPDATE contest_users SET join_time = NOW() AT TIME ZONE 'UTC' WHERE contest_id = $1 AND user_id = $2 AND join_time IS NULL`,
                    [contestId, userId]
                );

                // Then fetch problems
                const problemsQuery = `
                    SELECT p.id as id, p.title, cp.points
                    FROM contest_problems cp
                    JOIN problems p ON cp.problem_id = p.id
                    WHERE cp.contest_id = $1
                `;
                return t.any(problemsQuery, [contestId]);
            } else {
                throw new CustomException(404, "CONTEST_NOT_FOUND", "Contest not accessible");
            }
        });
    }

    async findContestByCode(contest_code: string): Promise<Contest | null> {
        const contest = await db.oneOrNone("SELECT * FROM contests WHERE contest_code = $1 AND is_registration_open=true ", [contest_code]);
        return contest;
    }

    async registerUserForContest(contest_id: string, user_id: string): Promise<void> {
        await db.none(
            `INSERT INTO contest_users (contest_id, user_id) VALUES ($1, $2)`,
            [contest_id, user_id]
        );
    }

    async getUserAllContest(userId: string): Promise<Contest[]> {
        const query = `
            SELECT c.id, c.title, c.description, c.duration, c.start_time, c.contest_code, 
            c.buffer_time, c.strict_time, c.created_at, c.updated_at
            FROM contests c
            JOIN contest_users cu ON c.id = cu.contest_id
            WHERE cu.user_id = $1
        `;
        return await db.any(query, [userId]);
    }

    // returns true if userId is already registered in contestId
    async isUserRegistered(userId: string, contestId: string): Promise<boolean> {
        const result = await db.oneOrNone(
            `SELECT 1 FROM contest_users WHERE contest_id = $1 AND user_id = $2`,
            [contestId, userId]
        );

        return result !== null;
    }

    async getAllContestSubmissionsByUser(userId: string): Promise<any[]> {
        const query = `
            SELECT cs.*
            FROM contest_submissions cs
            WHERE cs.user_id = $1
        `;
        return await db.any(query, [userId]);
    }

    async getAllContestSubmissionsByUserAndContest(userId: string, contestId: string): Promise<any[]> {
        const query = `
            SELECT cs.*
            FROM contest_submissions cs
            WHERE cs.user_id = $1 AND cs.contest_id = $2
        `;
        return await db.any(query, [userId, contestId]);
    }
}
