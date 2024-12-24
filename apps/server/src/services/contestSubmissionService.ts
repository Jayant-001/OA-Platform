import { ContestSubmissionRepository } from "../repositories/contestSubmissionRepository";
import { ContestRepository } from "../repositories/contestRepository";
import { ContestSubmissions } from "../models/contestSubmissions";
import { HttpException } from "../middleware/errorHandler";

class ContestSubmissionService {
    private contestSubmissionRepository = new ContestSubmissionRepository();
    private contestRepository = new ContestRepository();

    async createSubmission(
        contest_id: string,
        problem_id: string,
        submissionData: Omit<ContestSubmissions, "id" | "submitted_at" | "contest_id">,
        user_id: string
    ): Promise<ContestSubmissions> {
        const userId = user_id;
        const isActive = await this.isContestActiveForUser(contest_id, userId);
        if (!isActive) {
            throw new HttpException(400, "CONTEST_NOT_ACTIVE", "The contest is not active for the user");
        }
        return this.contestSubmissionRepository.create({ ...submissionData, contest_id, problem_id });
    }

    private async isContestActiveForUser(contest_id: string, user_id: string): Promise<boolean> {
        const contest = await this.contestRepository.findById(contest_id);
        if (!contest) {
            throw new HttpException(404, "CONTEST_NOT_FOUND", "Contest not found");
        }

        const userContest = await this.contestRepository.findUserContest(contest_id, user_id);
        if (!userContest) {
            throw new HttpException(404, "USER_NOT_IN_CONTEST", "User is not part of the contest");
        }

        const currentTime = new Date();
        if (contest.strict_time) {
            return currentTime < new Date(contest.start_time.getTime() + contest.duration * 1000);
        } else {
            return currentTime < new Date(userContest.joined_at.getTime() + contest.duration * 1000);
        }
    }
}

export default ContestSubmissionService;
