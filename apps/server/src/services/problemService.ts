import { ProblemRepository } from "../repositories/problemRepository";
import { Problem } from "../models/problem";
import { HttpException } from "../middleware/errorHandler";

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
        return this.problemRepository.create(problemData);
    }

    async updateProblem(
        id: string,
        problemData: Partial<Omit<Problem, "id" | "created_at" | "updated_at">>
    ): Promise<void> {
        const isExists = await this.problemRepository.findById(id);
        if (isExists === null) {
            throw new HttpException(
                404,
                "PROBLEM_NOT_FOUND",
                "Problem not found"
            );
        }

        return this.problemRepository.update(id, problemData);
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
        return this.problemRepository.delete(id);
    }
}

export default ProblemService;
