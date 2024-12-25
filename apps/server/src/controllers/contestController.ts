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
            const filteredContests = upcomingContests.map(contest => {
                const { id, title, duration, start_time, join_duration, strict_time } = contest;
                return { id, title, duration, start_time, join_duration, strict_time };
            });
            res.status(200).json(filteredContests);
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

    async getUserContest(req: Request, res: Response, next: NextFunction) {
        try {
            const { contestId } = req.params;
            const contest = await this.contestService.getContestByIdWithoutDetails(contestId);
            if (!contest) {
                return res.status(404).json({ message: "Contest not found" });
            }
            
            const { contest_code, created_by, created_at, updated_at, ...contestDetails } = contest;
            res.json(contestDetails);
        } catch (error) {
            next(error);
        }
    }

    async getUserContestProblems(req: Request, res: Response, next: NextFunction) {
        try {
            const { contestId } = req.params;
            const problems = await this.contestService.getContestProblems(contestId);
            if (!problems) {
                return res.status(404).json({ message: "Problems not found for the contest" });
            }
            res.json(problems);
        } catch (error) {
            next(error);
        }
    }

    async getUserContestProblem(req: Request, res: Response, next: NextFunction) {
        try {
            const { problemId } = req.params;
            const problem = await this.contestService.getProblemById(problemId);
            if (!problem) {
                return res.status(404).json({ message: "Problem not found" });
            }
            res.json(problem);
        } catch (error) {
            next(error);
        }
    }
}

export default ContestController;