import { Request, Response } from "express";
import { ProblemRepository } from "../repositories/problemRepository";
import { HttpException } from "../middleware/errorHandler";

class ProblemController {
    private problemRepository = new ProblemRepository();

    async getAllProblems(req: Request, res: Response): Promise<void> {
        try {
            const problems = await this.problemRepository.findAll();
            res.json(problems);
        } catch (error: any) {
            throw new HttpException(
                500,
                "FETCH_PROBLEMS_FAILED",
                error.message
            );
        }
    }

    async getProblemById(req: Request, res: Response): Promise<void> {
        try {
            const problem = await this.problemRepository.findById(
                req.params.id
            );
            if (problem) {
                res.json(problem);
            } else {
                throw new HttpException(
                    404,
                    "PROBLEM_NOT_FOUND",
                    "Problem not found"
                );
            }
        } catch (error: any) {
            throw new HttpException(500, "FETCH_PROBLEM_FAILED", error.message);
        }
    }

    async createProblem(req: Request, res: Response): Promise<void> {
        try {
            // res.send("Create problem");
            const problem = await this.problemRepository.create({
                ...req.body,
                created_by: req.user?.id, // Access req.user here
            });
            res.status(201).json(problem);
        } catch (error: any) {
            throw new HttpException(
                400,
                "PROBLEM_CREATION_FAILED",
                error.message
            );
        }
    }

    async updateProblem(req: Request, res: Response): Promise<void> {
        try {
            await this.problemRepository.update(req.params.id, req.body);
            res.status(204).send();
        } catch (error: any) {
            throw new HttpException(
                400,
                "PROBLEM_UPDATE_FAILED",
                error.message
            );
        }
    }

    async deleteProblem(req: Request, res: Response): Promise<void> {
        try {
            await this.problemRepository.delete(req.params.id);
            res.status(204).send();
        } catch (error: any) {
            throw new HttpException(
                400,
                "PROBLEM_DELETION_FAILED",
                error.message
            );
        }
    }
}

export default ProblemController;
