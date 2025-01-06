import express, { Application } from 'express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
import { config } from '../config';

export class DashboardService {
    private server: Application;
    private port: number;

    constructor(inputQueue: Queue, outputQueue: Queue, port = 3000) {
        this.server = express();
        this.port = port;
        this.setupBullBoard(inputQueue, outputQueue);
    }

    private setupBullBoard(inputQueue: Queue, outputQueue: Queue): void {
        const serverAdapter = new ExpressAdapter();
        serverAdapter.setBasePath('/admin/queues');

        createBullBoard({
            queues: [
                new BullMQAdapter(inputQueue),
                new BullMQAdapter(outputQueue)
            ],
            serverAdapter
        });

        this.server.use('/admin/queues', serverAdapter.getRouter());
    }

    async start(): Promise<void> {
        return new Promise((resolve) => {
            this.server.listen(this.port, () => {
                console.log(`Dashboard is running on http://localhost:${this.port}/admin/queues`);
                resolve();
            });
        });
    }

    async shutdown(): Promise<void> {
        // Implement if needed
    }
}
