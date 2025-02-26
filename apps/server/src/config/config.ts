import dotenv from 'dotenv';

dotenv.config();

export const config = {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
    redis_prod_url: process.env.REDIS_PROD_URL as string
};
