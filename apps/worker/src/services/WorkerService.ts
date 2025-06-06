


import { ContainerPoolManager } from './ContainerPoolManager';
import { config } from '../config';
import { CodeExecutionJob, ExecutionResult } from '../types';
import RabbitMQService from './rabbitmqService';
import { rabbitmqConfig } from '../config/rabbitmqConfig';

export class WorkerService {
    private poolManager: ContainerPoolManager;

    constructor() {
        this.poolManager = new ContainerPoolManager();
    }

    async start(): Promise<void> {
        try {
            await this.poolManager.initialize();
            console.log('Worker pools initialized');

            await RabbitMQService.consumeQueue(rabbitmqConfig.queues.input, async (job) => {
                console.log(`Processing job ${job.id}:`);
                console.log(`  Language: ${job.language}`);
                console.log(`  Code length: ${job.code.length} characters`);
                const startTime = Date.now();

                try {
                    const result = await this.processJob(job);

                    console.log(`Job ${job.id} completed in ${Date.now() - startTime}ms`);
                    console.log(`  Success: ${result.success}`);
                    if (!result.success) {
                        console.log(`  Error: ${result.error}`);
                    }

                    // Publish result to output queue
                    await RabbitMQService.publishToQueue(rabbitmqConfig.queues.output, result);
                } catch (error) {
                    console.error(`Job ${job.id} failed:`, error);
                    // Publish error result to output queue
                    await RabbitMQService.publishToQueue(rabbitmqConfig.queues.output, {
                        jobId: job.id,
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error',
                        executionTime: Date.now() - startTime,
                        submissionType: job.submissionType
                    });
                }
            });

            console.log('Worker service started');
        } catch (error) {
            console.error('Failed to start worker service:', error);
            throw error;
        }
    }

    private async processJob(job: any): Promise<ExecutionResult> {
        const startTime = Date.now();
        try {
            const pool = this.poolManager.getPool(job.language);
            if (!pool) {
                throw new Error(`Unsupported language: ${job.language}`);
            }

            let output;
            if (job.submissionType === 'run') {
                output = await pool.processRunCode(job.code, job.input);
            } else {
                output = await pool.processSubmitCode(job.code, job.testCases);
            }

            console.log("Output: ", output);

            return {
                jobId: job.id,
                success: true,
                result: output.result,
                executionTime: output.executionTimeMs,
                submissionType: job.submissionType,
                error: output?.error !== undefined ? output.error : null
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'An unknown error occurred';

            return {
                jobId: job.id,
                success: false,
                error: errorMessage,
                executionTime: Date.now() - startTime,
                submissionType: job.submissionType
            };
        }
    }

    async shutdown(): Promise<void> {
        await this.poolManager.shutdown();
        await RabbitMQService.close();
    }
}

// export class WorkerService {
//     private poolManager: ContainerPoolManager;
//     private inputQueue: Queue;
//     private outputQueue: Queue;
//     private workers: Worker[];

//     constructor() {
//         this.poolManager = new ContainerPoolManager();
//         this.workers = [];
//         this.inputQueue = new Queue(config.queues.input, {
//             connection: new Redis(config.redis_prod_url, {maxRetriesPerRequest: null})
//         });
//         this.outputQueue = new Queue(config.queues.output, {
//             connection: new Redis(config.redis_prod_url, {maxRetriesPerRequest: null})
//         });
//     }

//     async start(): Promise<void> {
//         await this.poolManager.initialize();
//         console.log('Worker pools initialized');

//         for (let i = 0; i < config.workers; i++) {
//             const worker = new Worker(
//                 config.queues.input,
//                 async (job) => {
//                     console.log(`Processing job ${job.data.id}:`);
//                     console.log(`  Language: ${job.data.language}`);
//                     console.log(`  Code length: ${job.data.code.length} characters`);
//                     const startTime = Date.now();
                    
//                     const result = await this.processJob(job.data);
                    
//                     console.log(`Job ${job.data.id} completed in ${Date.now() - startTime}ms`);
//                     console.log(`  Success: ${result.success}`);
//                     if (!result.success) {
//                         console.log(`  Error: ${result.error}`);
//                     }
//                     return result;
//                 },
//                 { connection: new Redis(config.redis_prod_url, {maxRetriesPerRequest: null}) }
//             );

//             worker.on('completed', async (job, result) => {
//                 await this.outputQueue.add('result', result);
//             });

//             worker.on('failed', (job, err) => {
//                 console.error(`Job ${job?.data.id} failed:`, err);
//             });

//             worker.on('error', (err) => {
//                 console.error('Worker error:', err);
//             });

//             this.workers.push(worker);
//             console.log(`Worker ${i + 1} started`);
//         }

//         console.log(`Started ${config.workers} workers`);
//     }

//     private async processJob(job: any): Promise<ExecutionResult> {
//         const startTime = Date.now();
//         try {
//             const pool = this.poolManager.getPool(job.language);
//             if (!pool) {
//                 throw new Error(`Unsupported language: ${job.language}`);
//             }

//             let output;
//             if (job.submissionType == 'run') {
//                 output = await pool.processRunCode(job.code, job.input);
//             } else {
//                 output = await pool.processSubmitCode(job.code, job.testCases);
//             }

//             console.log("Output: ", output);

//             return {
//                 jobId: job.id,
//                 success: true,
//                 result: output.result,
//                 executionTime: output.executionTimeMs,
//                 submissionType: job.submissionType,
//                 error: output?.error !== undefined ? output.error : null
//             };
//         } catch (error: unknown) {
//             const errorMessage = error instanceof Error 
//                 ? error.message 
//                 : 'An unknown error occurred';
            
//             return {
//                 jobId: job.id,
//                 success: false,
//                 error: errorMessage,
//                 executionTime: Date.now() - startTime
//             };
//         }
//     }

//     getInputQueue(): Queue {
//         return this.inputQueue;
//     }

//     getOutputQueue(): Queue {
//         return this.outputQueue;
//     }

//     async shutdown(): Promise<void> {
//         await Promise.all(this.workers.map(worker => worker.close()));
//         await this.poolManager.shutdown();
//         await this.inputQueue.close();
//         await this.outputQueue.close();
//     }
// }
