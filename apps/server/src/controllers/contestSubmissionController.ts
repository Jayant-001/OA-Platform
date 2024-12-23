import { Request, Response, NextFunction } from "express";
import ContestSubmissionService from "../services/contestSubmissionService";

class ContestSubmissionController {
    private contestSubmissionService = new ContestSubmissionService();

    async createSubmission(req: Request, res: Response, next: NextFunction) {
        try {
            const { contestId, problemId } = req.params;
            const submission = await this.contestSubmissionService.createSubmission(contestId,problemId, req.body);
            res.status(201).json(submission);
        } catch (error) {
            next(error);
        }
    }

    
}

export default ContestSubmissionController;
