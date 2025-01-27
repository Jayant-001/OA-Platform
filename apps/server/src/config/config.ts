import dotenv from 'dotenv';

dotenv.config();

export const config = {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
       
    },
};
