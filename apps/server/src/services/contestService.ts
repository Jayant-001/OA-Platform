import { ContestRepository } from "../repositories/contestRepository";
import { ProblemRepository } from "../repositories/problemRepository";
import { Contest } from "../models/contest";
import { HttpException } from "../middleware/errorHandler";

class ContestService {
    private contestRepository = new ContestRepository();
    private problemRepository = new ProblemRepository();

    async getAllContests(): Promise<Contest[]> {
        return this.contestRepository.findAll();
    }

    async getContestById(id: string): Promise<Contest | null> {
        return this.contestRepository.findById(id);
    }

    async createContest(
        contestData: Omit<Contest, "id" | "created_at" | "updated_at">
    ): Promise<Contest> {
        const isCodeUnique = await this.contestRepository.isContestCodeUnique(contestData.contest_code);
        if (!isCodeUnique) {
            throw new HttpException(
                400,
                "CONTEST_CODE_NOT_UNIQUE",
                "Contest code must be unique"
            );
        }
        return this.contestRepository.create(contestData);
    }

    async updateContest(
        id: string,
        contestData: Partial<Omit<Contest, "id" | "created_at" | "updated_at">>
    ): Promise<void> {
        const isExists = await this.contestRepository.findById(id);
        if (isExists === null) {
            throw new HttpException(
                404,
                "CONTEST_NOT_FOUND",
                "Contest not found"
            );
        }

        if (contestData.contest_code) {
            const isCodeUnique = await this.contestRepository.isContestCodeUnique(contestData.contest_code);
            if (!isCodeUnique) {
                throw new HttpException(
                    400,
                    "CONTEST_CODE_NOT_UNIQUE",
                    "Contest code must be unique"
                );
            }
        }

        return this.contestRepository.update(id, contestData);
    }

    async deleteContest(id: string): Promise<void> {
        const isExists = await this.contestRepository.findById(id);
        if (isExists === null) {
            throw new HttpException(
                404,
                "CONTEST_NOT_FOUND",
                "Contest not found"
            );
        }
        return this.contestRepository.delete(id);
    }

    async addProblemToContest(contest_id: string, problem_id: string, points: number): Promise<void> {
        const contestExists = await this.contestRepository.findById(contest_id);
        if (contestExists === null) {
            throw new HttpException(
                404,
                "CONTEST_NOT_FOUND",
                "Contest not found"
            );
        }
        const problemExists = await this.problemRepository.findById(problem_id);
        if (problemExists === null) {
            throw new HttpException(
                404,
                "PROBLEM_NOT_FOUND",
                "Problem not found"
            );
        }
        const problemAlreadyInContest = await this.contestRepository.problemExistsInContest(contest_id, problem_id);
        if (problemAlreadyInContest) {
            throw new HttpException(
                400,
                "PROBLEM_ALREADY_EXISTS",
                "Problem already exists in the contest"
            );
        }
        return this.contestRepository.addProblemToContest(contest_id, problem_id, points);
    }

    async updateProblemInContest(contest_id: string, problem_id: string, points: number): Promise<void> {
        const contestExists = await this.contestRepository.findById(contest_id);
        if (contestExists === null) {
            throw new HttpException(
                404,
                "CONTEST_NOT_FOUND",
                "Contest not found"
            );
        }
        const problemExists = await this.problemRepository.findById(problem_id);
        if (problemExists === null) {
            throw new HttpException(
                404,
                "PROBLEM_NOT_FOUND",
                "Problem not found"
            );
        }
        return this.contestRepository.updateProblemInContest(contest_id, problem_id, points);
    }

    async deleteProblemFromContest(contest_id: string, problem_id: string): Promise<void> {
        const contestExists = await this.contestRepository.findById(contest_id);
        if (contestExists === null) {
            throw new HttpException(
                404,
                "CONTEST_NOT_FOUND",
                "Contest not found"
            );
        }
        const problemExists = await this.problemRepository.findById(problem_id);
        if (problemExists === null) {
            throw new HttpException(
                404,
                "PROBLEM_NOT_FOUND",
                "Problem not found"
            );
        }
        return this.contestRepository.deleteProblemFromContest(contest_id, problem_id);
    }

    async addUsersToContest(contest_id: string, user_ids: string[]): Promise<void> {
        const isExists = await this.contestRepository.findById(contest_id);
        if (isExists === null) {
            throw new HttpException(
                404,
                "CONTEST_NOT_FOUND",
                "Contest not found"
            );
        }
        return this.contestRepository.addUsersToContest(contest_id, user_ids);
    }
}

export default ContestService;
