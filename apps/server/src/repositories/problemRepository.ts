import db from "../config/database";
import { HttpException } from "../middleware/errorHandler";
import { Problem } from "../models/problem";
import { ProblemSubmissions } from '../models/problemSubmissions';
import { Repository } from "typeorm";

export class ProblemRepository extends Repository<Problem> {
    async findAll(): Promise<Problem[]> {
        const problems = await db.any("SELECT * FROM problems");
        const problemsWithTags = await Promise.all(problems.map(async problem => {
            const tags = await db.any(
                `SELECT t.* FROM tags t
                 JOIN problem_tags pt ON t.id = pt.tag_id
                 WHERE pt.problem_id = $1`,
                [problem.id]
            );
            return { ...problem, tags };
        }));
        return problemsWithTags;
    }

    async findById(id: string): Promise<Problem | null> {
        return db.oneOrNone("SELECT * FROM problems WHERE id = $1", [id]);
    }

    async createProblem(
        problem: Omit<Problem, "id" | "created_at" | "updated_at">
    ): Promise<Problem> {
        const { tags, ...problemDetails } = problem;

        // Start a transaction
        return db.tx(async t => {
            const createdProblem = await t.one(
                `INSERT INTO problems (title, problem_statement, example, constraints, level, input_format, output_format, time_limit, memory_limit, created_by) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
                [
                    problemDetails.title,
                    problemDetails.problem_statement,
                    problemDetails.example,
                    problemDetails.constraints,
                    problemDetails.level,
                    problemDetails.input_format,
                    problemDetails.output_format,
                    problemDetails.time_limit,
                    problemDetails.memory_limit,
                    problemDetails.created_by,
                ]
            );

            if (tags && tags.length > 0) {
                const problemTags = tags.map(tagId => ({
                    problem_id: createdProblem.id,
                    tag_id: tagId
                }));
                const insertQueries = problemTags.map(tag =>
                    t.none(
                        `INSERT INTO problem_tags (problem_id, tag_id) VALUES ($1, $2)`,
                        [tag.problem_id, tag.tag_id]
                    )
                );
                await t.batch(insertQueries);
            }
            return createdProblem;
        });
    }

    async updateProblem(
        id: string,
        problem: Partial<Omit<Problem, "id" | "created_at" | "updated_at" | "created_by"> & { tags?: string[] }>
    ): Promise<void> {
        const { tags, ...problemDetails } = problem;

        // Start a transaction
        await db.tx(async t => {
            // Update problem details
            const fields = Object.keys(problemDetails)
                .filter(key => key !== "created_by") // Ensure created_by is omitted
                .map((key, index) => `${key} = $${index + 2}`)
                .join(", ");
            const values = Object.values(problemDetails).filter((_, index) => {
                const key = Object.keys(problemDetails)[index];
                return key !== "created_by";
            });
            await t.none(
                `UPDATE problems SET ${fields}, updated_at = NOW() WHERE id = $1`,
                [id, ...values]
            );

            // Delete existing tags
            await t.none(
                `DELETE FROM problem_tags WHERE problem_id = $1`,
                [id]
            );

            // Add new tags
            if (tags && tags.length > 0) {
                const problemTags = tags.map(tagId => ({
                    problem_id: id,
                    tag_id: tagId
                }));
                const insertQueries = problemTags.map(tag =>
                    t.none(
                        `INSERT INTO problem_tags (problem_id, tag_id) VALUES ($1, $2)`,
                        [tag.problem_id, tag.tag_id]
                    )
                );
                await t.batch(insertQueries);
            }
        });
    }

    async deleteProblem(id: string): Promise<void> {
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
