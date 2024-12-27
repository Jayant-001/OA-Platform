export const config = {
    redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || 6379,
    },
    queue: {
        sourceQueueName: "source-queue",
        destinationQueueName: "destination-queue",
        // Number of concurrent workers
        concurrency: process.env.WORKER_CONCURRENCY || 5,
        // Maximum number of jobs a worker will process before gracefully shutting down
        maxJobsPerWorker: process.env.MAX_JOBS_PER_WORKER || 1000,
        // Timeout for job processing in milliseconds
        jobTimeout: process.env.JOB_TIMEOUT || 30000,
    },
    worker: {
        // Enable worker health checks
        enableHealthCheck: true,
        healthCheckInterval: 30000,
    },
};