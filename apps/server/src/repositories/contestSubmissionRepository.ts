import db from "../config/database";
import { ContestSubmissions } from "../models/contestSubmissions";

export class ContestSubmissionRepository {
    async create(
        submission: Omit<ContestSubmissions, "id" | "submitted_at">
    ): Promise<ContestSubmissions> {
        return db.one(
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
    }

 
}
