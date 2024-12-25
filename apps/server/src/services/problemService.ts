import { ProblemRepository } from "../repositories/problemRepository";
import { Problem } from "../models/problem";
import { HttpException } from "../middleware/errorHandler";
import { ProblemSubmissions } from "../models/problemSubmissions";

class ProblemService {
    private problemRepository = new ProblemRepository();

    async getAllProblems(): Promise<Problem[]> {
        return this.problemRepository.findAll();
    }

    async getProblemById(id: string): Promise<Problem | null> {
        return this.problemRepository.findById(id);
    }

    async createProblem(
        problemData: Omit<Problem, "id" | "created_at" | "updated_at">
    ): Promise<Problem> {
        return this.problemRepository.createProblem(problemData);
    }

    async updateProblem(
        id: string,
        problemData: Partial<Omit<Problem, "id" | "created_at" | "updated_at" | "created_by"> & { tags?: string[] }>
    ): Promise<void> {
        const isExists = await this.problemRepository.findById(id);
        if (isExists === null) {
            throw new HttpException(
                404,
                "PROBLEM_NOT_FOUND",
                "Problem not found"
            );
        }

        return this.problemRepository.updateProblem(id, problemData);
    }

    async deleteProblem(id: string): Promise<void> {
        const isExists = await this.problemRepository.findById(id);
        if (isExists === null) {
            throw new HttpException(
                404,
                "PROBLEM_NOT_FOUND",
                "Problem not found"
            );
        }
        return this.problemRepository.deleteProblem(id);
    }

    async createSubmission(submissionData: Omit<ProblemSubmissions, "id" | "submitted_at">): Promise<ProblemSubmissions> {
        return await this.problemRepository.createSubmission(submissionData);
    }
}

export default ProblemService;
