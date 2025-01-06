import { Request, Response, NextFunction } from "express";
import ContestSubmissionService from "../services/contestSubmissionService";
import InputQueueService from "../services/inputQueueService";
import { queueConfig } from "../config/queueConfig";
import { CacheFactory } from "../services/redis-cache.service";
import { CacheStrategy, SubmissionStatus } from "../types/cache.types";

class ContestSubmissionController {
    private contestSubmissionService = new ContestSubmissionService();
    private inputQueueService = new InputQueueService();
    private submissionCache = CacheFactory.create<SubmissionStatus>(
        { host: "localhost", port: 6379 },
        "code-execution:",
        {
            strategy: CacheStrategy.TTL,
            maxEntries: 10000,
            ttl: 3600
        }
    );

    private getKeyPrefix(type: 'submit' | 'run' = 'submit'): string {
        return type === 'run' ? 'run:' : 'submit:';
    }

    async createSubmission(req: Request, res: Response, next: NextFunction) {
        try {
            const { contestId, problemId } = req.params;
            const submission = await this.contestSubmissionService.createSubmission(contestId, problemId, req.body, req.user?.id as string);

            await this.submissionCache.set(
                this.getKeyPrefix('submit') + submission.id,
                { status: 'PENDING' }
            );

            let input = 100000000;
            const job = {
                id: submission.id,
                language: submission.language,
                code: submission.code,
                input,
                timeout: 5000,
                submissionType: "submit",
            };
            await this.inputQueueService.getInputQueue().add(queueConfig.queues.input, job);
            res.status(201).json({
                ...submission,
                status: 'PENDING'
            });
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

    async runCode(req: Request, res: Response, next: NextFunction) {
        try {
            const submission_id = new Date().getTime().toString();

            await this.submissionCache.set(
                this.getKeyPrefix('run') + submission_id,
                { status: 'PENDING' }
            );

            const job = {
                id: submission_id,
                language: req.body.language,
                code: req.body.code,
                input: req.body.input,
                timeout: 5000,
                submissionType: "run",
            };
            await this.inputQueueService.getInputQueue().add(queueConfig.queues.input, job);
            res.status(201).json({
                submission_id,
                status: 'PENDING'
            });
        } catch (error) {
            next(error);
        }
    }

    // New method to get submission status
    async getSubmissionStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { submissionId, type = 'submit' } = req.params;
            const status = await this.submissionCache.get(
                this.getKeyPrefix(type as 'submit' | 'run') + submissionId
            );

            if (!status) {
                return res.status(404).json({ message: "Submission status not found" });
            }

            res.json(status);
        } catch (error) {
            next(error);
        }
    }

    // Method to update submission status (called by output queue consumer)
    async updateSubmissionStatus(
        submissionId: string,
        result: SubmissionStatus['result'],
        type: 'submit' | 'run' = 'submit'
    ): Promise<void> {
        await this.submissionCache.set(
            this.getKeyPrefix(type) + submissionId,
            {
                status: 'COMPLETED',
                result
            }
        );
    }
}

export default ContestSubmissionController;
