import db from "../config/database";
import { HttpException } from "../middleware/errorHandler";
import { Problem } from "../models/problem";
import {  ProblemSubmissions } from '../models/problemSubmissions';

export class ProblemRepository {
    async findAll(): Promise<Problem[]> {
        return db.any("SELECT * FROM problems");
    }

    async findById(id: string): Promise<Problem | null> {
        return db.oneOrNone("SELECT * FROM problems WHERE id = $1", [id]);
    }

    async create(
        problem: Omit<Problem, "id" | "created_at" | "updated_at">
    ): Promise<Problem> {
        return db.one(
            `INSERT INTO problems (title, problem_statement, example, constraints, level, input_format, output_format, time_limit, memory_limit, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [
                problem.title,
                problem.problem_statement,
                problem.example,
                problem.constraints,
                problem.level,
                problem.input_format,
                problem.output_format,
                problem.time_limit,
                problem.memory_limit,
                problem.created_by,
            ]
        );
    }

    async update(
        id: string,
        problem: Partial<Omit<Problem, "id" | "created_at" | "updated_at" | "created_by">>
    ): Promise<void> {
        const fields = Object.keys(problem)
            .map((key, index) => `${key} = $${index + 2}`)
            .join(", ");
        const values = Object.values(problem);
        await db.none(
            `UPDATE problems SET ${fields}, updated_at = NOW() WHERE id = $1`,
            [id, ...values]
        );
    }

    async delete(id: string): Promise<void> {
        await db.none("DELETE FROM problems WHERE id = $1", [id]);
    }

    async createSubmission(submission: Omit<ProblemSubmissions, "id" | "submitted_at">): Promise<ProblemSubmissions> {
        return db.one(
            `INSERT INTO problem_submissions (problem_id, verdict, code, language, execution_time, memory_used, submitted_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [
                submission.problem_id,
                submission.verdict,
                submission.code,
                submission.language,
                submission.execution_time,
                submission.memory_used,
                submission.submitted_by
            ]
        );
    }

    
}
