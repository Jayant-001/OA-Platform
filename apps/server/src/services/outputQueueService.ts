import { Queue, Worker } from 'bullmq';
import { queueConfig } from '../config/queueConfig';
import { CacheFactory } from './redis-cache.service';
import { CacheStrategy, SubmissionStatus } from '../types/cache.types';
import ContestSubmissionService from './contestSubmissionService';
import { SUBMISSION_STATUS, SUBMISSION_TYPE, CACHE_PREFIX, CACHE_NAMESPACE } from "../types/constants";
import { config } from '../config/config';
import Redis from 'ioredis';

class OutputQueueService {
    private outputQueue: Queue;
    private contestSubmissionService: ContestSubmissionService;
    private cache = CacheFactory.create<any>(
        { host: config.redis.host, port: config.redis.port },
        CACHE_NAMESPACE,
        {
            strategy: CacheStrategy.TTL,
            maxEntries: 10000,
            ttl: 3600
        }
    );

    private getStatusKey(id: string, type: keyof typeof SUBMISSION_TYPE.SUBMIT | typeof SUBMISSION_TYPE.RUN = SUBMISSION_TYPE.SUBMIT): string {
        return `${String(type)}:${id}`;
    }

    private getOutputKey(id: string): string {
        return `${CACHE_PREFIX.OUTPUT}${id}`;
    }

    constructor() {
        this.outputQueue = new Queue(queueConfig.queues.output, {
            connection: new Redis(config.redis_prod_url, { maxRetriesPerRequest: null }),
        });
        this.contestSubmissionService = new ContestSubmissionService();
    }

    async start(): Promise<void> {
        console.log('Worker pools initialized');

        for (let i = 0; i < queueConfig.workers; i++) {
            const worker = new Worker(
                queueConfig.queues.output,
                async (job) => {
                    const result = await this.processJob(job.data);
                    return result;
                },
                {
                    connection: new Redis(config.redis_prod_url, { maxRetriesPerRequest: null }),
                    concurrency: 1,
                }
            );

            worker.on('completed', async (job, data) => {
                const { submissionType, jobId } = data;

                await this.cache.set(
                    this.getStatusKey(jobId, submissionType),
                    {
                        status: SUBMISSION_STATUS.COMPLETED,
                    }
                );
            });

            worker.on('failed', async (job, error) => {

            });
        }
    }

    private async processJob(data: any): Promise<any> {
        const { submissionType, jobId } = data;

        // Update submission status
        await this.cache.set(
            this.getStatusKey(jobId, submissionType),
            {
                status: SUBMISSION_STATUS.PROCESSING,
            }
        );

       
        if (submissionType === SUBMISSION_TYPE.RUN) {

            await this.cache.set(
                this.getOutputKey(jobId),
                {
                    result: data.result,
                    error: data.error || null // Include error if available
                }
            );
        } else {
            // Generate random verdict for now

            console.log("Result: ", data.result);
            console.log("Data: ", data);
          
            // Update cache with verdict
            await this.cache.set(
                this.getStatusKey(jobId, submissionType),
                {
                    result: data.result,
                    error: data.error || null // Include error if available
                }
            );

            // Update submission in database using jobId instead of id
            await this.contestSubmissionService.updateSubmission(jobId, {  // <-- Change this to use jobId
                verdict: data.result,
                execution_time: data.executionTime || 0,
                memory_used: data.memoryUsed || 0
            });
        }


        return {
            success: true,
            ...data
        };
    }
}

export default OutputQueueService;