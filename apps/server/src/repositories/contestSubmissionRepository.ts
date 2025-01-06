import db from "../config/database";
import { ContestSubmissions } from "../models/contestSubmissions";
import { HttpException } from "../middleware/errorHandler";

export class ContestSubmissionRepository {
    async create(
        submission: Omit<ContestSubmissions, "id" | "submitted_at">
    ): Promise<ContestSubmissions> {
        return db.tx(async t => {
            const contest = await t.oneOrNone(
                `SELECT c.start_time, c.duration, c.buffer_time, c.strict_time, cu.join_time
                 FROM contests c
                 JOIN contest_users cu ON c.id = cu.contest_id
                 WHERE c.id = $1 AND cu.user_id = $2`,
                [submission.contest_id, submission.user_id]
            );

            if (!contest) {
                throw new HttpException(404, "CONTEST_NOT_FOUND", "Contest not found or user not registered");
            }

            const currentTime = new Date(new Date().toISOString()); // Ensure current time is in UTC
            const startTime = new Date(contest.start_time);
            const endTime = contest.strict_time
                ? new Date(startTime.getTime() + contest.duration * 60000)
                : new Date(Math.min(
                    new Date(contest.join_time).getTime() + contest.duration * 60000,
                    startTime.getTime() + (contest.duration + contest.buffer_time) * 60000
                ));

            if (currentTime < startTime || currentTime > endTime) {
                throw new HttpException(400, "SUBMISSION_NOT_ALLOWED", "Submission not allowed at this time");
            }

            return t.one(
                `INSERT INTO contest_submissions (user_id, contest_id, problem_id, verdict, code, language, execution_time, memory_used) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
                [
                    submission.user_id,
                    submission.contest_id,
                    submission.problem_id,
                    submission.verdict,
                    submission.code,
                    submission.language,
                    submission.execution_time,
                    submission.memory_used
                ]
            );
        });
    }

    async getAllContestSubmissionsByUser(userId: string): Promise<any[]> {
        return db.any(
            `SELECT * FROM contest_submissions 
             WHERE user_id = $1
             ORDER BY submitted_at DESC`,
            [userId]
        );
    }

    async getAllContestSubmissionsByUserAndContest(userId: string, contestId: string): Promise<any[]> {
        return db.any(
            `SELECT * FROM contest_submissions 
             WHERE user_id = $1 AND contest_id = $2
             ORDER BY submitted_at DESC`,
            [userId, contestId]
        );
    }

    async findUserSubmissionsForProblem(contest_id: string, problem_id: string, user_id: string): Promise<ContestSubmissions[]> {
        return db.any(
            `SELECT * FROM contest_submissions 
             WHERE contest_id = $1 AND problem_id = $2 AND user_id = $3
             ORDER BY submitted_at DESC`,
            [contest_id, problem_id, user_id]
        );
    }

    async findById(submissionId: string): Promise<ContestSubmissions | null> {
        return db.oneOrNone(
            `SELECT * FROM contest_submissions WHERE id = $1`,
            [submissionId]
        );
    }

    async updateSubmission(id: string, data: {
        verdict: string;
        execution_time?: number;
        memory_used?: number;
    }): Promise<void> {
        await db.none(
            `UPDATE contest_submissions 
             SET verdict = $1, 
                 execution_time = $2, 
                 memory_used = $3, 
                 updated_at = NOW()
             WHERE id = $4`,
            [
                data.verdict,
                data.execution_time || 0,
                data.memory_used || 0,
                id
            ]
        );
    }
}
