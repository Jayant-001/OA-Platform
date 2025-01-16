import dotenv from 'dotenv';

dotenv.config();

interface LanguageConfig {
    image: string;
    poolSize: number;
    command: string;
    timeout?: number;
    fileExtension: string;
}

interface Config {
    redis: {
        host: string;
        port: number;
    };
    queues: {
        input: string;
        output: string;
    };
    workers: number;
    languages: {
        [key: string]: LanguageConfig;
    };
}

export const config: Config = {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
    },
    queues: {
        input: 'code-execution',
        output: 'execution-result'
    },
    workers: parseInt(process.env.WORKERS || '5'),
    languages: {
        cpp: {
            image: process.env.CPP_IMAGE || 'gcc:latest',
            poolSize: parseInt(process.env.CPP_POOL_SIZE || '5'),
            command: 'g++ /app/main.cpp -o /app/main && /app/main < /app/input.txt',
            timeout: parseInt(process.env.CPP_TIMEOUT || '10000'),
            fileExtension: '.cpp'
        },
        python: {
            image: process.env.PYTHON_IMAGE || 'python:3.9', // Updated image
            poolSize: parseInt(process.env.PYTHON_POOL_SIZE || '5'),
            command: 'python3 /app/main.py < /app/input.txt',
            timeout: parseInt(process.env.PYTHON_TIMEOUT || '10000'),
            fileExtension: '.py'
        },
        java: {
            image: process.env.JAVA_IMAGE || 'openjdk:11',
            poolSize: parseInt(process.env.JAVA_POOL_SIZE || '5'),
            command: 'cd /app && javac Main.java && java Main < input.txt',
            timeout: parseInt(process.env.JAVA_TIMEOUT || '15000'),
            fileExtension: '.java'
        },
        javascript: {
            image: process.env.NODE_IMAGE || 'node:22',
            poolSize: parseInt(process.env.NODE_POOL_SIZE || '5'),
            command: 'node /app/main.js < /app/input.txt',
            timeout: parseInt(process.env.NODE_TIMEOUT || '10000'),
            fileExtension: '.js'
        }
    }
};