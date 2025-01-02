import { Request, Response, NextFunction } from "express";
import ContestSubmissionService from "../services/contestSubmissionService";

class ContestSubmissionController {
    private contestSubmissionService = new ContestSubmissionService();

    async createSubmission(req: Request, res: Response, next: NextFunction) {
        try {
            const { contestId, problemId } = req.params;
            const submission = await this.contestSubmissionService.createSubmission(contestId,problemId, req.body, req.user?.id as string);
            res.status(201).json(submission);
        } catch (error) {
            next(error);
        }
    }

    async getUserSubmissionsForContest(req: Request, res: Response, next: NextFunction) {
        try {
            const { contestId, problemId } = req.params;
            const userId = req.user?.id as string;
            const submissions = await this.contestSubmissionService.getUserSubmissionsForProblem(contestId, problemId, userId);
            const filteredSubmissions = submissions.map(submission => {
                const { code, execution_time, memory_used, ...rest } = submission;
                return rest;
            });
            res.json(filteredSubmissions);
        } catch (error) {
            next(error);
        }
    }

    async getSubmissionById(req: Request, res: Response, next: NextFunction) {
        try {
            const { submissionId } = req.params;
            const submission = await this.contestSubmissionService.getSubmissionById(submissionId);
            if (!submission) {
                return res.status(404).json({ message: "Submission not found" });
            }
            const { code, execution_time, memory_used } = submission;
            res.json({ code, execution_time, memory_used });
        } catch (error) {
            next(error);
        }
    }
}

export default ContestSubmissionController;
