import { Request, Response } from "express";
import ProblemService from "../services/problemService";
import { CustomException } from "../errors/CustomException";

class ProblemController {
    private problemService = new ProblemService();

    async getAllProblems(req: Request, res: Response): Promise<void> {
        const problems = await this.problemService.getAllProblems();
        res.json(problems);
    }

    async getProblemById(req: Request, res: Response): Promise<void> {
        const problem = await this.problemService.getProblemById(req.params.problemId);
        if (!problem) {
            throw CustomException.notFound("Problem not found");
        }
        res.json(problem);
    }

    async createProblem(req: Request, res: Response): Promise<void> {
        const problem = await this.problemService.createProblem({
            ...req.body,
            created_by: req.user?.id, 
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

    async addTestCase(req: Request, res: Response) {
        const { problemId } = req.params;
        const testCase = await this.problemService.createTestCase(problemId, req.body);
        res.status(201).json(testCase);
    }

    async getTestCases(req: Request, res: Response) {
        const { problemId } = req.params;
        const testCases = await this.problemService.getTestCasesByProblemId(problemId);
        res.json(testCases);
    }

    async updateTestCase(req: Request, res: Response) {
        const { testCaseId } = req.params;
        const testCase = await this.problemService.updateTestCase(testCaseId, req.body);
        res.json(testCase);
    }

    async deleteTestCase(req: Request, res: Response) {
        const { testCaseId } = req.params;
        await this.problemService.deleteTestCase(testCaseId);
        res.status(204).send();
    }

    async addBulkTestCases(req: Request, res: Response) {
        const { problemId } = req.params;
        const testCases = await this.problemService.createBulkTestCases(problemId, req.body);
        res.status(201).json(testCases);
    }
}

export default ProblemController;
