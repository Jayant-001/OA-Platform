import dotenv from 'dotenv';

dotenv.config();

export const queueConfig = {
    queues: {
        input: process.env.INPUT_QUEUE || 'code-execution',
        output: process.env.OUTPUT_QUEUE || 'execution-result',
    },
    redis: {
        host: 'localhost',
        port: 6379,
    },
    workers: parseInt(process.env.WORKERS || '1'),
    redis_prod_url: process.env.REDIS_PROD_URL as string
};