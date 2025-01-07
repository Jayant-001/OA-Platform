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

    private getOutputKey(id: string): string {
        return `output:${id}`;
    }

    async createSubmission(req: Request, res: Response, next: NextFunction) {
        try {
            const { contestId, problemId } = req.params;
            const submission = await this.contestSubmissionService.createSubmission(contestId, problemId, req.body, req.user?.id as string);

            await this.submissionCache.set(
                this.getKeyPrefix('submit') + submission.id,
                { status: 'PENDING' }
            );

            let input = 10;
            const job = {
                id: submission.id,
                language: submission.language,
                code: submission.code,
                input,
                timeout: 5000,
                submissionType: "submit",
            };
            await this.inputQueueService.addJob(job);
            res.status(201).json({
                id: submission.id as string,
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
            await this.inputQueueService.addJob(job);
            res.status(201).json({
                submission_id
            });
        } catch (error) {
            next(error);
        }
    }

    async getRunCodeStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { submissionId } = req.params;
            const status = await this.submissionCache.get(
                this.getKeyPrefix('run') + submissionId
            );

            if (!status) {
                return res.status(404).json({ message: "Submission status not found" });
            }

            if (status.status !== 'COMPLETED') {
                return res.json({
                    status: 'PENDING',
                    output: null,
                    execution_time: null,
                    memory_used: null
                });
            }

            // If status is COMPLETED, get the output
            const output = await this.submissionCache.get(
                this.getOutputKey(submissionId)
            );

            return res.json({
                status: 'COMPLETED',
                output: output || null,
                execution_time: null,
                memory_used: null
            });
        } catch (error) {
            next(error);
        }
    }

    async getSubmitCodeStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { submissionId, type  } = req.params;
            const status = await this.submissionCache.get(
                this.getKeyPrefix('submit') + submissionId
            );

            if (!status) {
                return res.status(404).json({ message: "Submission status not found" });
            }

            if (status.status !== 'COMPLETED') {
                return res.json({
                    status: 'PENDING',
                    verdict: null,
                    submitted_at: null,
                    execution_time: null,
                    memory_used: null
                });
            }

            const submission = await this.contestSubmissionService.getSubmissionById(submissionId);


            return res.json({
                status: 'COMPLETED',
                verdict: submission?.verdict || null,
                submitted_at: submission?.submitted_at,
                execution_time: submission?.execution_time,
                memory_used: submission?.memory_used
            })
        } catch (error) {
            next(error);
        }
    }
}

export default ContestSubmissionController;
