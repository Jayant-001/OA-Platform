import { ContestSubmissionRepository } from "../repositories/contestSubmissionRepository";
import { ContestRepository } from "../repositories/contestRepository";
import { ContestSubmissions } from "../models/contestSubmissions";
import { CustomException } from "../errors/CustomException";
import { CacheFactory } from "./redis-cache.service";
import { CacheStrategy } from "../types/cache.types";

class ContestSubmissionService {
    private contestSubmissionRepository = new ContestSubmissionRepository();
    private contestRepository = new ContestRepository();

    // Cache for contest status (active/inactive) for users
    private contestStatusCache = CacheFactory.create<boolean>(
        { host: "localhost", port: 6379 },
        "contest_status_cache:",
        {
            strategy: CacheStrategy.LRU,
            maxEntries: 1000,
            ttl: 300 // 5 minutes
        }
    );

    // Cache for user contest details
    private userContestCache = CacheFactory.create<any>(
        { host: "localhost", port: 6379 },
        "user_contest_cache:",
        {
            strategy: CacheStrategy.LRU,
            maxEntries: 500,
            ttl: 600 // 10 minutes
        }
    );

    async createSubmission(
        contest_id: string,
        problem_id: string,
        submissionData: Omit<ContestSubmissions, "id" | "submitted_at" | "contest_id">,
        user_id: string
    ): Promise<ContestSubmissions> {
        const userId = user_id;
        const isActive = await this.isContestActiveForUser(contest_id, userId);

        if (!isActive) {
            throw new CustomException(400, "The contest is not active for the user", "CONTEST_NOT_ACTIVE");
        }

        const submission = await this.contestSubmissionRepository.create({
            ...submissionData,
            contest_id,
            problem_id,
            user_id: userId,
        });

        // Invalidate relevant caches after submission
        await this.invalidateUserContestCache(contest_id, user_id);

        return submission;
    }

    async getUserSubmissionsForProblem(contest_id: string, problem_id: string, user_id: string): Promise<ContestSubmissions[]> {
        return this.contestSubmissionRepository.findUserSubmissionsForProblem(contest_id, problem_id, user_id);
    }

    async getAllContestSubmissionsByUser(userId: string): Promise<any[]> {
        return this.contestSubmissionRepository.getAllContestSubmissionsByUser(userId);
    }

    async getAllContestSubmissionsByUserAndContest(userId: string, contestId: string): Promise<any[]> {
        return this.contestSubmissionRepository.getAllContestSubmissionsByUserAndContest(userId, contestId);
    }

    async getSubmissionById(submissionId: string) {
        return await this.contestSubmissionRepository.findById(submissionId);
    }

    async updateSubmission(id: string, data: {
        verdict: string;
        execution_time?: number;
        memory_used?: number;
    }): Promise<void> {
        try {
            await this.contestSubmissionRepository.updateSubmission(id, {
                verdict: data.verdict,
                execution_time: data.execution_time,
                memory_used: data.memory_used
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to update submission: ${error.message}`);
            } else {
                throw new Error('Failed to update submission due to an unknown error');
            }
        }
    }

    private async isContestActiveForUser(contest_id: string, user_id: string): Promise<boolean> {
        const cacheKey = `contest:${contest_id}:user:${user_id}:status`;
        const cachedStatus = await this.contestStatusCache.get(cacheKey);

        // if (cachedStatus !== null) {
        //     return cachedStatus;
        // }

        const contest = await this.getContestDetails(contest_id);
        const userContest = await this.getUserContest(contest_id, user_id);

        const currentTime = new Date();
        let isActive = false;

        const contestStartTime = new Date(contest.start_time); // Ensure contest.start_time is a Date object

        if (contest.strict_time) {
            isActive = currentTime < new Date(contestStartTime.getTime() + contest.duration * 60000); // 60,000 ms in a minute
        } else {
            isActive = currentTime < new Date(userContest.joined_at.getTime() + contest.duration * 60000); // 60,000 ms in a minute
        }

        // Cache the result
        await this.contestStatusCache.set(cacheKey, isActive);
        return isActive;
    }

    private async getContestDetails(contest_id: string) {
        const cacheKey = `contest:${contest_id}`;
        const cachedContest = await this.userContestCache.get(cacheKey);

        // if (cachedContest) {
        //     return cachedContest;
        // }

        const contest = await this.contestRepository.findById(contest_id);
        if (!contest) {
            throw new CustomException(404, "Contest not found", "CONTEST_NOT_FOUND");
        }

        await this.userContestCache.set(cacheKey, contest);
        return contest;
    }

    private async getUserContest(contest_id: string, user_id: string) {
        const cacheKey = `contest:${contest_id}:user:${user_id}`;
        const cachedUserContest = await this.userContestCache.get(cacheKey);

        if (cachedUserContest) {
            return cachedUserContest;
        }

        const userContest = await this.contestRepository.findUserContest(contest_id, user_id);
        if (!userContest) {
            throw new CustomException(404, "User is not part of the contest", "USER_NOT_IN_CONTEST");
        }

        await this.userContestCache.set(cacheKey, userContest);
        return userContest;
    }

    private async invalidateUserContestCache(contest_id: string, user_id: string): Promise<void> {
        await Promise.all([
            this.contestStatusCache.delete(`contest:${contest_id}:user:${user_id}:status`),
            this.userContestCache.delete(`contest:${contest_id}:user:${user_id}`),
            this.userContestCache.delete(`contest:${contest_id}`)
        ]);
    }
}

export default ContestSubmissionService;
