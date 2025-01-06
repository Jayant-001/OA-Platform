import { Queue, Worker } from 'bullmq';
import { queueConfig } from '../config/queueConfig';

class InputQueueService {
    private inputQueue: Queue;
    private outputQueue: Queue;

    constructor() {
        this.inputQueue = new Queue(queueConfig.queues.input, {
            connection: queueConfig.redis,
        });

        this.outputQueue = new Queue(queueConfig.queues.output, {
            connection: queueConfig.redis,
        });

        this.setupListeners();
    }

    private setupListeners() {
        const worker = new Worker(queueConfig.queues.output, async job => {
            console.log(`Job completed: ${job.id}`);
            // Handle job completion
        }, {
            connection: queueConfig.redis,
        });

        worker.on('completed', (job) => {
            console.log(`Job with id ${job.id} has been completed`);
        });

        worker.on('failed', (job, err) => {
            if (job) {
                console.error(`Job with id ${job.id} has failed with error ${err.message}`);
            } else {
                console.error(`Job has failed with error ${err.message}`);
            }
        });
    }

    public getInputQueue() {
        return this.inputQueue;
    }

    public getOutputQueue() {
        return this.outputQueue;
    }
}

export default InputQueueService;