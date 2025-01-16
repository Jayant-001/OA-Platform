import { Request, Response, NextFunction } from "express";
import ContestSubmissionService from "../services/contestSubmissionService";
import InputQueueService from "../services/inputQueueService";
import { queueConfig } from "../config/queueConfig";
import { CacheFactory } from "../services/redis-cache.service";
import { CacheStrategy, SubmissionStatus } from "../types/cache.types";
import TestCaseService from "../services/testCaseService";
import { v4 as uuidv4 } from 'uuid';


class ContestSubmissionController {
    private testCaseService = new TestCaseService();
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

    async createSubmission(req: Request, res: Response) {
            const { contestId, problemId } = req.params;
            const submission = await this.contestSubmissionService.createSubmission(contestId, problemId, req.body, req.user?.id as string);

            await this.submissionCache.set(
                this.getKeyPrefix('submit') + submission.id,
                { status: 'PENDING' }
            );

            const testCases = await this.testCaseService.findAllByProblemId(problemId);

            const job = {
                id: submission.id,
                language: submission.language,
                code: submission.code,
                timeout: 5000,
                submissionType: "submit",
                testCases
            };
            await this.inputQueueService.addJob(job);

            const {contest_id, problem_id, user_id, code, updated_at, score, ...data} = submission;
            res.status(201).json(data);
  
    }

    async getUserSubmissionsForContest(req: Request, res: Response) {
            const { contestId, problemId } = req.params;
            const userId = req.user?.id as string;
            const submissions = await this.contestSubmissionService.getUserSubmissionsForProblem(contestId, problemId, userId);
            // console.log(submissions)
            const filteredSubmissions = submissions.map(submission => {
                const {contest_id, problem_id, user_id, code, updated_at, score, ...rest} = submission;
                return rest;
            });
            res.json(filteredSubmissions);
     
    }


    async getLeaderboardSubmissions(req: Request, res: Response) {
        const { contestId, problemId,userId } = req.params;

        const submissions = await this.contestSubmissionService.getUserSubmissionsForProblem(contestId, problemId, userId);

        if (!submissions || submissions.length === 0) {
            return res.json([]);
        }

        submissions.sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime());

        const firstAccepted = submissions.find(submission => submission.verdict === 'accepted');

        let selectedSubmission;

        if (firstAccepted) {
            selectedSubmission = firstAccepted;
        } else {
            selectedSubmission = submissions[submissions.length - 1];
        }

        const { contest_id, problem_id, user_id, updated_at, score, ...rest } = selectedSubmission;

        res.json(rest);
    }


    async getSubmissionById(req: Request, res: Response) {
            const { submissionId } = req.params;
            const submission = await this.contestSubmissionService.getSubmissionById(submissionId);
            if (!submission) {
                return res.status(404).json({ message: "Submission not found" });
            }
            const { verdict, submitted_at, language,code, execution_time, memory_used, } = submission;
            res.json({ verdict, submitted_at, language,code, execution_time, memory_used });
   
    }

    async runCode(req: Request, res: Response) {
            const submission_id = uuidv4();

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
     
    }

    async getRunCodeStatus(req: Request, res: Response) {
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
            
        console.log("Output: ", output);

            return res.json({
                status: 'COMPLETED',
                result: output?.result || null,
                execution_time: null,
                memory_used: null,
                error: output?.error || null
        
            });
       
    }

    async getSubmitCodeStatus(req: Request, res: Response) {
            const { submissionId } = req.params;
            const status = await this.submissionCache.get(
                this.getKeyPrefix('submit') + submissionId
            );

            if (!status) {
                return res.status(404).json({ message: "Submission status not found" });
            }

            if (status.status !== 'COMPLETED') {
                return res.json({
                    id: submissionId,
                    status: 'PENDING',
                    verdict: null,
                    submitted_at: null,
                    execution_time: null,
                    memory_used: null
                });
            }

            const submission = await this.contestSubmissionService.getSubmissionById(submissionId);


            return res.json({
                id: submission?.id,
                status: 'COMPLETED',
                verdict: submission?.verdict || null,
                language: submission?.language,
                submitted_at: submission?.submitted_at,
                execution_time: submission?.execution_time,
                memory_used: submission?.memory_used,
            })
    }
}

export default ContestSubmissionController;
