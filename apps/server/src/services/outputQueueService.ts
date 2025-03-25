import RabbitMQService from './rabbitmqService';
import { rabbitmqConfig } from '../config/rabbitmqConfig';
import { CacheFactory } from './redis-cache.service';
import { CacheStrategy, SubmissionStatus } from '../types/cache.types';
import ContestSubmissionService from './contestSubmissionService';
import { SUBMISSION_STATUS, SUBMISSION_TYPE, CACHE_PREFIX, CACHE_NAMESPACE } from "../types/constants";
import { config } from '../config/config';
import Redis from 'ioredis';

class OutputQueueService {

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
        // this.outputQueue = new Queue(rabbitmqConfig.queues.output, {
        //     connection: new Redis(config.redis_prod_url, { maxRetriesPerRequest: null }),
        // });
        this.contestSubmissionService = new ContestSubmissionService();
    }

    async start(): Promise<void> {
        try {
            await RabbitMQService.initialize();
            console.log('Output queue service initialized');

            // Consume messages from output queue
            await RabbitMQService.consumeQueue(rabbitmqConfig.queues.output, async (data) => {
                try {
                    const result = await this.processJob(data);
                    const { submissionType, jobId } = data;
                    console.log(submissionType, jobId);

                    await this.cache.set(
                        this.getStatusKey(jobId, submissionType),
                        {
                            status: SUBMISSION_STATUS.COMPLETED,
                        }
                    );

                    return result;
                } catch (error) {
                    console.error('Error processing output queue message:', error);
                    const { submissionType, jobId } = data;

                    await this.cache.set(
                        this.getStatusKey(jobId, submissionType),
                        {
                            status: SUBMISSION_STATUS.ERROR,
                            error: error instanceof Error ? error.message : String(error)
                        }
                    );
                    throw error;
                }
            });
        } catch (error) {
            console.error('Failed to start output queue service:', error);
            throw error;
        }
    }

    private async processJob(data: any): Promise<any> {
        const { submissionType, jobId } = data;
        console.log('Processing job:', data);

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
                    error: data.error || null
                }
            );
        } else {
            console.log("Result: ", data.result);
            console.log("Data: ", data);

            await this.cache.set(
                this.getStatusKey(jobId, submissionType),
                {
                    result: data.result,
                    error: data.error || null
                }
            );

            await this.contestSubmissionService.updateSubmission(jobId, {
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

    async shutdown(): Promise<void> {
        await RabbitMQService.close();
    }
}

export default OutputQueueService;