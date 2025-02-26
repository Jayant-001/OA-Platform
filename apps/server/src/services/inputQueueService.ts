import { Queue } from 'bullmq';
import { queueConfig } from '../config/queueConfig';
import Redis from 'ioredis';

class InputQueueService {
    private inputQueue: Queue;

    constructor() {
        this.inputQueue = new Queue(queueConfig.queues.input, {
            connection: new Redis(queueConfig.redis_prod_url, { maxRetriesPerRequest: null }),
        });
    }

    public async addJob (job: any) {
        this.inputQueue.add(queueConfig.queues.input, job)
    }
}

export default InputQueueService;