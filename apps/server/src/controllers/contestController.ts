import { Request, Response, NextFunction } from "express";
import ContestService from "../services/contestService";
import ContestSubmissionService from "../services/contestSubmissionService";
import LeaderboardService from "../services/leaderboardService";
import { CustomException } from "../errors/CustomException";

class ContestController {
    private contestService = new ContestService();
    private contestSubmissionService = new ContestSubmissionService();
    private leaderboardService = new LeaderboardService();

    async getAllContests(req: Request, res: Response) {
        const contests = await this.contestService.getAllContests();
        res.json(contests);
    }

    async getContestById(req: Request, res: Response) {
        const contest = await this.contestService.getContestById(
            req.params.contestId
        );
        if (!contest) {
            res.status(404).json({ message: "Contest not found" });
        } else {
            res.json(contest);
        }
    }

    async createContest(req: Request, res: Response) {
        const contest = await this.contestService.createContest(
            req.body,
            req.user?.id as string
        );
        res.status(201).json(contest);
    }

    async updateContest(req: Request, res: Response) {
        await this.contestService.updateContest(req.params.contestId, req.body);
        res.status(204).send();
    }

    async deleteContest(req: Request, res: Response) {
        await this.contestService.deleteContest(req.params.contestId);
        res.status(204).send();
    }

    async addProblemToContest(req: Request, res: Response) {
        const contest_id = req.params.contestId;
        const problem_id = req.params.problemId;
        const { points } = req.body;
        await this.contestService.addProblemToContest(
            contest_id,
            problem_id,
            points
        );
        res.status(204).send();
    }

    async updateProblemInContest(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const contest_id = req.params.contestId;
        const problem_id = req.params.problemId;
        const { points } = req.body;
        await this.contestService.updateProblemInContest(
            contest_id,
            problem_id,
            points
        );
        res.status(200).send();
    }

    async deleteProblemFromContest(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const contest_id = req.params.contestId;
        const problem_id = req.params.problemId;
        await this.contestService.deleteProblemFromContest(
            contest_id,
            problem_id
        );
        res.status(200).send();
    }

    async addUsersToContest(req: Request, res: Response, next: NextFunction) {
        const contest_id = req.params.contestId;
        const { user_ids } = req.body;
        await this.contestService.addUsersToContest(contest_id, user_ids);
        res.status(204).send();
    }

    async getUpcomingContests(req: Request, res: Response, next: NextFunction) {
        const userId = req.user?.id as string; // Assuming user ID is available in the request object
        const upcomingContests = await this.contestService.getUpcomingContests(
            userId
        );
        const filteredContests = upcomingContests.map((contest) => {
            const {
                id,
                title,
                duration,
                start_time,
                buffer_time,
                strict_time,
            } = contest;
            return {
                id,
                title,
                duration,
                start_time,
                buffer_time,
                strict_time,
            };
        });
        res.status(200).json(filteredContests);
    }

    async addProblemsToContest(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const contest_id = req.params.contestId;
        const problems = req.body.problems; // Expecting an array of { problemId, points }
        await this.contestService.addProblemsToContest(contest_id, problems);
        res.status(204).send();
    }

    async getUserContest(req: Request, res: Response, next: NextFunction) {
        const { contestId } = req.params;
        const contest = await this.contestService.getContestByIdWithoutDetails(
            contestId,
            req.user?.id as string
        );
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }

        // to check if user is already registered in the contest or not
        const is_registered = await this.contestService.isUserRegistered(
            req.user?.id as string,
            contestId
        );

        const {
            contest_code,
            created_by,
            created_at,
            updated_at,
            ...contestDetails
        } = contest;
        res.json({ ...contestDetails, is_registered });
    }

    async getUserContestProblems(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const { contestId } = req.params;
        const userId = req.user?.id as string;
        const problems = await this.contestService.getContestProblems(
            contestId,
            userId
        );

        if (!problems) {
            return res
                .status(404)
                .json({ message: "Problems not found for the contest" });
        }

        const submissions =
            await this.contestSubmissionService.getAllContestSubmissionsByUserAndContest(
                userId,
                contestId
            );
        const problemStatus = problems.map((problem) => {
            const problemSubmissions = submissions.filter(
                (submission) => submission.problem_id === problem.id
            );
            const acceptedSubmission = problemSubmissions.find(
                (submission) => submission.verdict === "accepted"
            );
            if (acceptedSubmission) {
                return { ...problem, status: "Solved" };
            } else if (problemSubmissions.length > 0) {
                return { ...problem, status: "Attempted" };
            } else {
                return { ...problem, status: "Not Attempted" };
            }
        });

        res.json(problemStatus);
    }

    async getUserContestProblem(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const { contestId, problemId } = req.params;
        const userId = req.user?.id as string;
        const problem = await this.contestService.getProblemById(problemId);
        if (!problem) {
            throw CustomException.notFound("Problem not found");
        }
        res.json(problem);
    }

    async getContestByCode(req: Request, res: Response, next: NextFunction) {
        const contestCode = req.query.contestCode as string;
        const contest = await this.contestService.getContestByCode(contestCode);
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }
        const {
            description,
            created_by,
            created_at,
            updated_at,
            ...contestDetails
        } = contest;
        res.json(contestDetails);
    }

    async registerUserForContest(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const { contestId } = req.params;
        await this.contestService.registerUserForContest(
            contestId,
            req.user?.id as string
        );
        res.status(204).send();
    }

    async getRegisteredUpcomingContests(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const userId = req.user?.id as string; // Assuming user ID is available in the request object
        const contests =
            await this.contestService.getRegisteredUpcomingContests(userId);
        const filteredContests = contests.map((contest) => {
            const {
                description,
                created_by,
                created_at,
                updated_at,
                ...contestDetails
            } = contest;
            return contestDetails;
        });
        res.status(200).json(filteredContests);
    }

    // Return all the contests in which user is registered
    async getUserAllContest(req: Request, res: Response) {
        const userId = req.user?.id as string; // Assuming user ID is available in the request object
        const contests = await this.contestService.getUserAllContest(userId);
        const filteredContests = contests.map((contest) => {
            const {
                description,
                created_by,
                created_at,
                updated_at,
                ...contestDetails
            } = contest;
            return contestDetails;
        });
        res.status(200).json(filteredContests);
    }

    async getLeaderboard(req: Request, res: Response, next: NextFunction) {
        const { contestId } = req.params;
        const leaderboard = await this.leaderboardService.fetchLeaderboardData(
            contestId
        );
        // console.log(JSON.stringify(leaderboard));
        res.status(200).json(leaderboard);
    }


    async getContestProblemsById(req: Request, res: Response) {
        const { contestId } = req.params;
        const problems = await this.contestService.getContestProblemsForAdmin(
            contestId
        );
        res.json(problems);
    }
}

export default ContestController;
