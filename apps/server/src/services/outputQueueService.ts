import { Queue, Worker, Job, QueueEvents } from "bullmq";
import { queueConfig } from "../config/queueConfig";
import { CacheFactory } from "./redis-cache.service";
import { CacheStrategy } from "../types/cache.types";
import ContestSubmissionService from "./contestSubmissionService";

interface JobData {
    submissionType: "run" | "submit";
    jobId: string;
    code: string;
    language: string;
    input?: string;
}

interface JobResult {
    success: boolean;
    output?: string;
    error?: string;
    execution_time?: number;
    memory_used?: number;
    verdict?:
        | "accepted"
        | "wrong_answer"
        | "time_limit_exceeded"
        | "runtime_error";
}

interface JobError extends Error {
    message: string;
}

class OutputQueueService {
    private queue: Queue;
    private worker!: Worker;
    private queueEvents!: QueueEvents;
    private contestSubmissionService: ContestSubmissionService;
    private cache = CacheFactory.create<any>(
        { host: "localhost", port: 6379 },
        "code-execution:",
        {
            strategy: CacheStrategy.TTL,
            maxEntries: 10000,
            ttl: 3600,
        }
    );

    constructor() {
        // Initialize queue with proper settings
        this.queue = new Queue(queueConfig.queues.output, {
            connection: queueConfig.redis,
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 1000,
                },
                removeOnComplete: 100,
                removeOnFail: 50,
                priority: 1,
            },
        });
        this.contestSubmissionService = new ContestSubmissionService();
    }

    private getStatusKey(id: string, type: "run" | "submit"): string {
        return `${type}:${id}`;
    }

    private getOutputKey(id: string): string {
        return `output:${id}`;
    }

    async start(): Promise<void> {
        // Initialize queue events listener
        this.queueEvents = new QueueEvents(queueConfig.queues.output, {
            connection: queueConfig.redis,
        });

        // Create worker with proper settings
        this.worker = new Worker<JobData, JobResult>(
            queueConfig.queues.output,
            async (job) => {
                return await this.processJob(job);
            },
            {
                connection: queueConfig.redis,
                concurrency: 1, // Process one job at a time
                lockDuration: 30000, // 30 seconds lock to prevent job duplication
                stalledInterval: 5000, // Check for stalled jobs every 5 seconds
                maxStalledCount: 2, // Consider job stalled after 2 checks
            }
        );

        // Monitor queue events
        this.queueEvents.on("waiting", ({ jobId }) => {
            console.log(`Job ${jobId} is waiting to be processed`);
        });

        this.queueEvents.on("active", ({ jobId, prev }) => {
            console.log(`Job ${jobId} is now active. Previous state: ${prev}`);
        });

        // Monitor worker events
        this.worker.on("active", (job) => {
            console.log(`Processing job ${job.id}`);
        });

        // Log completion events
        this.worker.on("completed", async (job, result) => {
            try {
                console.log(`Job ${job.id} completed successfully`);
                await this.handleJobCompletion(job.data, result);
            } catch (error) {
                console.error("Error in completion handler:", error);
            }
        });

        // Handle failures
        this.worker.on("failed", async (job, error) => {
            try {
                console.error(`Job ${job?.id} failed:`, error);
                await this.handleJobFailure(job?.data, error);
            } catch (err) {
                console.error("Error in failure handler:", err);
            }
        });

        this.worker.on("error", (error) => {
            console.error("Worker error:", error);
        });

        this.worker.on("stalled", (jobId) => {
            console.warn(`Job ${jobId} has stalled`);
        });

        console.log("Output queue worker started with enhanced monitoring");
    }

    private async processJob(job: Job<JobData>): Promise<JobResult> {
        const { submissionType, code, language, input } = job.data;
        console.log("----------->>>>>>>>>>>>>", job.data.jobId);

        // Update status to processing
        await this.cache.set(
            this.getStatusKey(job.data.jobId, submissionType),
            { status: "PROCESSING" }
        );

        try {
            // Here you would implement the actual code execution logic
            // This is just a placeholder for demonstration
            const executionResult = await this.executeCode(
                code,
                language,
                input
            );

            if (submissionType === "submit") {
                // For submissions, evaluate against test cases
                const verdict = await this.evaluateSubmission(executionResult);
                return {
                    success: true,
                    execution_time: executionResult.execution_time,
                    memory_used: executionResult.memory_used,
                    verdict,
                };
            }

            // For run requests, just return the output
            return {
                success: true,
                output: executionResult.output,
                execution_time: executionResult.execution_time,
                memory_used: executionResult.memory_used,
            };
        } catch (err) {
            const error = err as JobError;
            return {
                success: false,
                error: error.message || "Unknown error occurred",
                verdict: "runtime_error",
            };
        }
    }

    private async handleJobCompletion(
        jobData: JobData,
        result: JobResult
    ): Promise<void> {
        const { submissionType, jobId } = jobData;

        if (submissionType === "run") {
            await this.cache.set(this.getOutputKey(jobId), result.output);
        } else {
            await this.contestSubmissionService.updateSubmission(jobId, {
                verdict: result.verdict as string,
                execution_time: result.execution_time || 0,
                memory_used: result.memory_used || 0,
            });
        }

        await this.cache.set(this.getStatusKey(jobId, submissionType), {
            status: "COMPLETED",
        });
    }

    private async handleJobFailure(
        jobData: JobData,
        error: Error
    ): Promise<void> {
        const { submissionType, jobId } = jobData;

        await this.cache.set(this.getStatusKey(jobId, submissionType), {
            status: "FAILED",
            error: error.message,
        });
    }

    // Placeholder methods - implement these based on your requirements
    private async executeCode(code: string, language: string, input?: string) {
        // Implement actual code execution logic
        return {
            output: "Sample output",
            execution_time: Math.random() * 1000,
            memory_used: Math.random() * 100,
        };
    }

    private async evaluateSubmission(executionResult: any) {
        // Implement actual submission evaluation logic
        return Math.random() > 0.5 ? "accepted" : "wrong_answer";
    }

    async addJob(data: JobData): Promise<string> {
        const job = await this.queue.add("process", data, {
            priority: 1,
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 1000,
            },
        });
        return job.id as string;
    }

    async shutdown(): Promise<void> {
        await this.worker.close();
        await this.queue.close();
        await this.queueEvents.close();
        console.log("Output queue service shut down");
    }
}

export default OutputQueueService;
