import { Queue } from 'bullmq';
import { queueConfig } from '../config/queueConfig';

class InputQueueService {
    private inputQueue: Queue;

    constructor() {
        this.inputQueue = new Queue(queueConfig.queues.input, {
            connection: queueConfig.redis,
        });
    }

    public async addJob (job: any) {
        this.inputQueue.add(queueConfig.queues.input, job)
    }
}

export default InputQueueService;