import { Request, Response } from "express";
import ProblemService from "../services/problemService";
import { HttpException } from "../middleware/errorHandler";

class ProblemController {
    private problemService = new ProblemService();

    async getAllProblems(req: Request, res: Response): Promise<void> {
        const problems = await this.problemService.getAllProblems();
        res.json(problems);
    }

    async getProblemById(req: Request, res: Response): Promise<void> {
        const problem = await this.problemService.getProblemById(req.params.problemId);
        if (problem) {
            res.json(problem);
        } else {
            throw new HttpException(404, "PROBLEM_NOT_FOUND", "Problem not found");
        }
    }

    async createProblem(req: Request, res: Response): Promise<void> {
        const problem = await this.problemService.createProblem({
            ...req.body,
            created_by: req.user?.id, // Access req.user here
        });
        res.status(201).json(problem);
    }

    async updateProblem(req: Request, res: Response): Promise<void> {
        await this.problemService.updateProblem(req.params.problemId, req.body);
        res.status(204).send();
    }

    async deleteProblem(req: Request, res: Response): Promise<void> {
        await this.problemService.deleteProblem(req.params.problemId);
        res.status(204).send();
    }

    async createSubmission(req: Request, res: Response) {
        const submissionData = req.body;
        submissionData.submitted_by = req.user?.id; 
        submissionData.problem_id = req.params.problemId;
        const submission = await this.problemService.createSubmission(submissionData);
        res.status(201).json(submission);
    }
}

export default ProblemController;
