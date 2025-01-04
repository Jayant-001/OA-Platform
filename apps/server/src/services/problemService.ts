import { ProblemRepository } from "../repositories/problemRepository";
import { Problem } from "../models/problem";
import { HttpException } from "../middleware/errorHandler";
import { ProblemSubmissions } from "../models/problemSubmissions";
import { CacheFactory } from "./redis-cache.service";
import { CacheStrategy } from "../types/cache.types";

class ProblemService {
    private problemRepository = new ProblemRepository();
    private problemCache = CacheFactory.create<Problem>(
        { host: "localhost", port: 6379 },
        "problem_cache:",
        {
            strategy: CacheStrategy.LRU,
            maxEntries: 1000,
            ttl: 3600 // 1 hour
        }
    );
    private problemListCache = CacheFactory.create<Problem[]>(
        { host: "localhost", port: 6379 },
        "problem_list_cache:",
        {
            strategy: CacheStrategy.LRU,
            maxEntries: 100,
            ttl: 1800 // 30 minutes
        }
    );

    async getAllProblems(): Promise<Problem[]> {
        const cacheKey = "all_problems";
        const cachedProblems = await this.problemListCache.get(cacheKey);

        if (cachedProblems) {
            return cachedProblems;
        }

        const problems = await this.problemRepository.findAll();
        await this.problemListCache.set(cacheKey, problems);
        return problems;
    }

    async getProblemById(id: string): Promise<Problem | null> {
        const cacheKey = `problem:${id}`;
        const cachedProblem = await this.problemCache.get(cacheKey);

        if (cachedProblem) {
            return cachedProblem;
        }

        const problem = await this.problemRepository.findById(id);
        if (problem) {
            await this.problemCache.set(cacheKey, problem);
        }
        return problem;
    }

    async createProblem(
        problemData: Omit<Problem, "id" | "created_at" | "updated_at">
    ): Promise<Problem> {
        const problem = await this.problemRepository.createProblem(problemData);
        await this.invalidateCache();
        return problem;
    }

    async updateProblem(
        id: string,
        problemData: Partial<Omit<Problem, "id" | "created_at" | "updated_at" | "created_by"> & { tags?: string[] }>
    ): Promise<void> {
        const isExists = await this.getProblemById(id);
        if (!isExists) {
            throw new HttpException(404, "PROBLEM_NOT_FOUND", "Problem not found");
        }

        await this.problemRepository.updateProblem(id, problemData);
        await this.invalidateCache(id);
    }

    async deleteProblem(id: string): Promise<void> {
        const isExists = await this.getProblemById(id);
        if (!isExists) {
            throw new HttpException(404, "PROBLEM_NOT_FOUND", "Problem not found");
        }

        await this.problemRepository.deleteProblem(id);
        await this.invalidateCache(id);
    }

    private async invalidateCache(id?: string): Promise<void> {
        // Clear the problem list cache
        await this.problemListCache.clear();

        // If an ID is provided, also clear that specific problem's cache
        if (id) {
            await this.problemCache.delete(`problem:${id}`);
        }
    }

    // Submissions don't need caching as they're write-heavy operations
    async createSubmission(submissionData: Omit<ProblemSubmissions, "id" | "submitted_at">): Promise<ProblemSubmissions> {
        return await this.problemRepository.createSubmission(submissionData);
    }
}

export default ProblemService;
