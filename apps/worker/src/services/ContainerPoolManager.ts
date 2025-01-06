import { ContainerPool } from '../types';
import DockerContainerPool from './DockerContainerPool';
import { config } from '../config';

export class ContainerPoolManager {
    private pools: Map<string, ContainerPool> = new Map();

    async initialize(): Promise<void> {
        for (const [language, langConfig] of Object.entries(config.languages)) {
            const pool = new DockerContainerPool(
                langConfig.poolSize,
                langConfig.image,
                langConfig.command,
                langConfig.timeout,
                langConfig.fileExtension
            );
            await pool.initialize();
            this.pools.set(language, pool);
        }
    }

    getPool(language: string): ContainerPool | undefined {
        return this.pools.get(language);
    }

    async shutdown(): Promise<void> {
        for (const pool of this.pools.values()) {
            await pool.shutdown();
        }
    }
}
