export enum CacheStrategy {
    LRU = "LRU",
    LFU = "LFU",
    FIFO = "FIFO",
    TTL = "TTL",
    RANDOM = "RANDOM",
}

export interface CacheOptions {
    strategy?: CacheStrategy;
    maxEntries?: number;
    ttl?: number; // in seconds
}

export interface CacheAdapter<T> {
    set(key: string, value: T, options?: CacheOptions): Promise<void>;
    get(key: string): Promise<T | null>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
}
