import { Request, Response, NextFunction } from "express";
import ContestService from "../services/contestService";

class ContestController {
    private contestService = new ContestService();

    async getAllContests(req: Request, res: Response, next: NextFunction) {
        try {
            const contests = await this.contestService.getAllContests();
            res.json(contests);
        } catch (error) {
            next(error);
        }
    }

    async getContestById(req: Request, res: Response, next: NextFunction) {
        try {
            const contest = await this.contestService.getContestById(req.params.contestId);
            if (!contest) {
                res.status(404).json({ message: "Contest not found" });
            } else {
                res.json(contest);
            }
        } catch (error) {
            next(error);
        }
    }

    async createContest(req: Request, res: Response, next: NextFunction) {
        try {
            const contest = await this.contestService.createContest(req.body, req.user?.id as string);
            res.status(201).json(contest);
        } catch (error) {
            next(error);
        }
    }

    async updateContest(req: Request, res: Response, next: NextFunction) {
        try {
            await this.contestService.updateContest(req.params.contestId, req.body);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async deleteContest(req: Request, res: Response, next: NextFunction) {
        try {
            await this.contestService.deleteContest(req.params.contestId);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async addProblemToContest(req: Request, res: Response, next: NextFunction) {
        try {
            const contest_id = req.params.contestId;
            const problem_id = req.params.problemId;
            const { points } = req.body;
            await this.contestService.addProblemToContest(contest_id, problem_id, points);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async updateProblemInContest(req: Request, res: Response, next: NextFunction) {
        try {
            const contest_id = req.params.contestId;
            const problem_id = req.params.problemId;
            const { points } = req.body;
            await this.contestService.updateProblemInContest(contest_id, problem_id, points);
            res.status(200).send();
        } catch (error) {
            next(error);
        }
    }

    async deleteProblemFromContest(req: Request, res: Response, next: NextFunction) {
        try {
            const contest_id = req.params.contestId;
            const problem_id = req.params.problemId;
            await this.contestService.deleteProblemFromContest(contest_id, problem_id);
            res.status(200).send();
        } catch (error) {
            next(error);
        }
    }

    async addUsersToContest(req: Request, res: Response, next: NextFunction) {
        try {
            const contest_id = req.params.contestId;
            const { user_ids } = req.body;
            await this.contestService.addUsersToContest(contest_id, user_ids);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async getUpcomingContests(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id as string; // Assuming user ID is available in the request object
            const upcomingContests = await this.contestService.getUpcomingContests(userId);
            res.status(200).json(upcomingContests);
        } catch (error) {
            next(error);
        }
    }

    async addProblemsToContest(req: Request, res: Response, next: NextFunction) {
        try {
            const contest_id = req.params.contestId;
            const problems = req.body.problems; // Expecting an array of { problemId, points }
            await this.contestService.addProblemsToContest(contest_id, problems);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

export default ContestController;
