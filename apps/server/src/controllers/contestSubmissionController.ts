import { Request, Response, NextFunction } from "express";
import ContestSubmissionService from "../services/contestSubmissionService";
import InputQueueService from "../services/inputQueueService";
import { queueConfig } from "../config/queueConfig";
import { CacheFactory } from "../services/redis-cache.service";
import { CacheStrategy, SubmissionStatus } from "../types/cache.types";
import TestCaseService from "../services/testCaseService";
import { v4 as uuidv4 } from 'uuid';
import RabbitMQService from "../services/rabbitmqService";
import { rabbitmqConfig } from "../config/rabbitmqConfig";
import { CustomException } from "../errors/CustomException";
import { config } from "../config/config";
import { SUBMISSION_STATUS, SUBMISSION_TYPE, CACHE_PREFIX, CACHE_NAMESPACE, VERDICT } from "../types/constants";

class ContestSubmissionController {
    private testCaseService = new TestCaseService();
    private contestSubmissionService = new ContestSubmissionService();
    private inputQueueService = new InputQueueService();
    private submissionCache = CacheFactory.create<SubmissionStatus>(
        { host: config.redis.host, port: config.redis.port },
        CACHE_NAMESPACE,
        {
            strategy: CacheStrategy.TTL,
            maxEntries: 10000,
            ttl: 3600
        }
    );

    private getKeyPrefix(type: keyof typeof SUBMISSION_TYPE.SUBMIT | typeof SUBMISSION_TYPE.RUN = SUBMISSION_TYPE.SUBMIT): string {
        return type === SUBMISSION_TYPE.RUN ? CACHE_PREFIX.RUN : CACHE_PREFIX.SUBMIT;
    }

    private getOutputKey(id: string): string {
        return `${CACHE_PREFIX.OUTPUT}${id}`;
    }

    async createSubmission(req: Request, res: Response) {
        const { contestId, problemId } = req.params;
        const testCases = await this.testCaseService.findAllByProblemId(problemId);

        if (testCases == null) {
            throw new CustomException(422, 'Unprocessable_Code', "Code could not be processed, as no test cases were there");
        }
            const submission = await this.contestSubmissionService.createSubmission(contestId, problemId, req.body, req.user?.id as string);

            await this.submissionCache.set(
                this.getKeyPrefix(SUBMISSION_TYPE.SUBMIT) + submission.id,
                { status:  SUBMISSION_STATUS.PENDING }
            );

          
        


            const job = {
                id: submission.id,
                language: submission.language,
                code: submission.code,
                timeout: 5000,
                submissionType: SUBMISSION_TYPE.SUBMIT,
                testCases
            };
        //  await this.inputQueueService.addJob(job);
            await RabbitMQService.publishToQueue(rabbitmqConfig.queues.input, job);


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
        const { contestId, problemId, userId } = req.params;

        const submissions = await this.contestSubmissionService.getUserSubmissionsForProblem(contestId, problemId, userId);

        if (!submissions || submissions.length === 0) {
            return res.json({});
        }

        submissions.sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime());

        const firstAccepted = submissions.find(submission => submission.verdict === VERDICT.ACCEPTED);

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
                this.getKeyPrefix(SUBMISSION_TYPE.RUN) + submission_id,
                { status: SUBMISSION_STATUS.PENDING }
            );

            const job = {
                id: submission_id,
                language: req.body.language,
                code: req.body.code,
                input: req.body.input,
                timeout: 5000,
                submissionType: SUBMISSION_TYPE.RUN,
            };
      //  await this.inputQueueService.addJob(job);
        await RabbitMQService.publishToQueue(rabbitmqConfig.queues.input, job);

            res.status(201).json({
                submission_id
            });
     
    }

    async getRunCodeStatus(req: Request, res: Response) {
            const { submissionId } = req.params;
            const status = await this.submissionCache.get(
                this.getKeyPrefix(SUBMISSION_TYPE.RUN) + submissionId
            );

            if (!status) {
                return res.status(404).json({ message: "Submission status not found" });
            }

            if (status.status !== SUBMISSION_STATUS.COMPLETED) {
                return res.json({
                    status: SUBMISSION_STATUS.PENDING,
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
                status: SUBMISSION_STATUS.COMPLETED,
                result: output?.result || null,
                execution_time: null,
                memory_used: null,
                error: output?.error || null
        
            });
       
    }

    async getSubmitCodeStatus(req: Request, res: Response) {
            const { submissionId } = req.params;
            const status = await this.submissionCache.get(
                this.getKeyPrefix(SUBMISSION_TYPE.SUBMIT) + submissionId
            );

            if (!status) {
                return res.status(404).json({ message: "Submission status not found" });
            }

            if (status.status !== SUBMISSION_STATUS.COMPLETED) {
                return res.json({
                    id: submissionId,
                    status: SUBMISSION_STATUS.PENDING,
                    verdict: null,
                    submitted_at: null,
                    execution_time: null,
                    memory_used: null
                });
            }

            const submission = await this.contestSubmissionService.getSubmissionById(submissionId);


            return res.json({
                id: submission?.id,
                status: SUBMISSION_STATUS.COMPLETED,
                verdict: submission?.verdict || null,
                language: submission?.language,
                submitted_at: submission?.submitted_at,
                execution_time: submission?.execution_time,
                memory_used: submission?.memory_used,
            })
    }
}

export default ContestSubmissionController;
