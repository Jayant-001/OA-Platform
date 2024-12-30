// worker.js
import pkg from 'bullmq';
const { Queue, Worker, QueueScheduler } = pkg;
import { config } from './config.js';

class MessageProcessor {
  constructor() {
    // Initialize source queue
    this.sourceQueue = new Queue(config.queue.sourceQueueName, {
      connection: config.redis
    });

    // Initialize destination queue
    this.destinationQueue = new Queue(config.queue.destinationQueueName, {
      connection: config.redis
    });

    // Initialize queue scheduler for delayed jobs and retries
    this.scheduler = new QueueScheduler(config.queue.sourceQueueName, {
      connection: config.redis
    });

    // Track active workers
    this.workers = new Set();
  }

  async start() {
    console.log(`Starting ${config.queue.concurrency} workers...`);

    for (let i = 0; i < config.queue.concurrency; i++) {
      const worker = new Worker(
        config.queue.sourceQueueName,
        async (job) => {
          console.log(`Worker ${i + 1} processing job ${job.id}`);
          
          try {
            // Process the message (your business logic here)
            const result = await this.processMessage(job.data);
            
            // Add to destination queue
            await this.destinationQueue.add('processed', result, {
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 1000
              }
            });

            return { success: true, jobId: job.id };
          } catch (error) {
            console.error(`Error processing job ${job.id}:`, error);
            throw error; // This will trigger the job retry mechanism
          }
        },
        {
          connection: config.redis,
          concurrency: 1, // Each worker processes one job at a time
          maxJobsPerWorker: config.queue.maxJobsPerWorker,
          timeout: config.queue.jobTimeout,
        }
      );

      // Handle worker events
      worker.on('completed', (job) => {
        console.log(`Job ${job.id} completed successfully`);
      });

      worker.on('failed', (job, error) => {
        console.error(`Job ${job.id} failed:`, error);
      });

      this.workers.add(worker);
    }

    if (config.worker.enableHealthCheck) {
      this.startHealthCheck();
    }
  }

  async processMessage(message) {
    // Simulate processing time (replace with your actual processing logic)
    await new Promise(resolve => setTimeout(resolve, 5000));
    return {
      ...message,
      processedAt: new Date().toISOString()
    };
  }

  startHealthCheck() {
    setInterval(async () => {
      try {
        const metrics = await Promise.all(
          Array.from(this.workers).map(worker => worker.getMetrics())
        );
        
        console.log('Worker metrics:', metrics);
        
        // Check for stuck jobs
        const active = await this.sourceQueue.getActive();
        for (const job of active) {
          const jobAge = Date.now() - job.timestamp;
          if (jobAge > config.queue.jobTimeout * 1.5) {
            console.warn(`Job ${job.id} appears stuck, may need intervention`);
          }
        }
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, config.worker.healthCheckInterval);
  }

  async shutdown() {
    console.log('Shutting down workers...');
    await Promise.all(
      Array.from(this.workers).map(worker => worker.close())
    );
    await this.scheduler.close();
    await this.sourceQueue.close();
    await this.destinationQueue.close();
  }
}

export default MessageProcessor;