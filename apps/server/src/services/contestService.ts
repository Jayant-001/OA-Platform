import { ContestRepository } from "../repositories/contestRepository";
import { ProblemRepository } from "../repositories/problemRepository";
import { Contest, ContestProblem } from "../models/contest";
import { HttpException } from "../middleware/errorHandler";
import { getConnection } from "typeorm"; // Import getConnection for transaction management

class ContestService {
    private contestRepository = new ContestRepository();
    private problemRepository = new ProblemRepository();

    async getAllContests(): Promise<Contest[]> {
        return this.contestRepository.findAll();
    }

    async getContestById(id: string): Promise<Contest | null> {
        return this.contestRepository.findById(id);
    }

    async getContestByIdWithoutDetails(id: string,userId: string): Promise<Contest | null> {
        return this.contestRepository.findByIdWithoutDetails(id,userId);
    }

    async createContest(
        contestData: Omit<Contest, "id" | "created_at" | "updated_at">,
        userId: string
    ): Promise<Contest> {
        const isCodeUnique = await this.contestRepository.isContestCodeUnique(contestData.contest_code);
        if (!isCodeUnique) {
            throw new HttpException(
                400,
                "CONTEST_CODE_NOT_UNIQUE",
                "Contest code must be unique"
            );
        }
        contestData.created_by = userId
        return this.contestRepository.createContest(contestData);
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
            const isCodeUnique = await this.contestRepository.isContestCodeUniquewithId(contestData.contest_code,id);
            if (!isCodeUnique) {
                throw new HttpException(
                    400,
                    "CONTEST_CODE_NOT_UNIQUE",
                    "Contest code must be unique"
                );
            }
        }

        return this.contestRepository.updateContest(id, contestData);
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
        return this.contestRepository.deleteContest(id);
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

    async getUpcomingContests(userId: string): Promise<Contest[]> {
        try {
            return await this.contestRepository.findUpcomingContestsByUserId(userId);
        } catch (error) {
            throw new Error('Error fetching upcoming contests');
        }
    }

    async addProblemsToContest(contest_id: string, problems: ContestProblem[] | []): Promise<void> {
        const contestExists = await this.contestRepository.findById(contest_id);
        if (contestExists === null) {
            throw new HttpException(
                404,
                "CONTEST_NOT_FOUND",
                "Contest not found"
            );
        }

        // Call the repository method to handle the transaction
        await this.contestRepository.addProblemsToContest(contest_id, problems);
    }

    async getContestProblems(contestId: string,userId:string): Promise<{ problem_id: string, title: string, points: number }[]> {
        const contestExists = await this.contestRepository.findByIdWithoutDetails(contestId,userId);
        if (contestExists === null) {
            throw new HttpException(
                404,
                "CONTEST_NOT_FOUND",
                "Contest not found"
            );
        }
        return this.contestRepository.findProblemsByContestId(contestId,userId);
    }

    async getProblemById(problemId: string): Promise<any> { // Replace 'any' with the appropriate type if available
        const problem = await this.problemRepository.findById(problemId);
        if (!problem) {
            throw new HttpException(
                404,
                "PROBLEM_NOT_FOUND",
                "Problem not found"
            );
        }
        return problem;
    }

    async getContestByCode(contestCode: string): Promise<Contest | null> {
        return this.contestRepository.findContestByCode(contestCode);
    }

    async registerUserForContest(contestId: string, userId: string): Promise<void> {
        const contestExists = await this.contestRepository.findById(contestId);
        if (contestExists === null) {
            throw new HttpException(
                404,
                "CONTEST_NOT_FOUND",
                "Contest not found"
            );
        }

        const userAlreadyRegistered = await this.contestRepository.findUserContest(contestId, userId);
        if (userAlreadyRegistered) {
            throw new HttpException(
                400,
                "USER_ALREADY_REGISTERED",
                "User is already registered for the contest"
            );
        }

        await this.contestRepository.registerUserForContest(contestId, userId);
    }

    async getRegisteredUpcomingContests(userId: string): Promise<Contest[]> {
      
        return this.contestRepository.findRegisteredUpcomingContestsByUserId(userId);
    }
}

export default ContestService;
