import Redis, { RedisOptions } from 'ioredis';
import { CacheAdapter, CacheStrategy, CacheOptions } from '../types/cache.types';
import { config } from '../config/config';

class RedisCacheService<T> implements CacheAdapter<T> {
  private redis: Redis;
  private prefix: string;
  private maxEntries: number;
  private ttl: number;

  constructor(
    redisConfig: RedisOptions = {},
    prefix: string = 'app_cache:',
    options: CacheOptions = {}
  ) {
    this.redis = new Redis(config.redis_prod_url);
    this.prefix = prefix;
    this.maxEntries = options.maxEntries || 1000 // Default max entries
    this.ttl = options.ttl || 3600; // Default TTL for 1 hour
  }

  // Core Caching Methods
  async set(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const fullKey = this.prefix + key;
    const serializedValue = JSON.stringify(value);

    // Default strategy configurations
    const strategy = options.strategy || CacheStrategy.TTL;

    // Strategy-based caching
    switch (strategy) {
      case CacheStrategy.LRU:
        await this.setLRU(fullKey, serializedValue, this.maxEntries, this.ttl);
        break;
      case CacheStrategy.LFU:
        await this.setLFU(fullKey, serializedValue, this.maxEntries, this.ttl);
        break;
      case CacheStrategy.FIFO:
        await this.setFIFO(fullKey, serializedValue, this.maxEntries, this.ttl);
        break;
      case CacheStrategy.RANDOM:
        await this.setRandom(fullKey, serializedValue, this.maxEntries, this.ttl);
        break;
      default:
        // Standard TTL approach
        await this.redis.setex(fullKey, this.ttl, serializedValue);
    }
  }

  // LRU (Least Recently Used) Strategy
  private async setLRU(
    key: string,
    value: string,
    maxEntries: number,
    ttl: number
  ): Promise<void> {
    // Use sorted set for tracking access time
    await this.redis.multi()
      .zadd('lru_tracker', Date.now(), key)
      .setex(key, ttl, value)
      .zremrangebyrank('lru_tracker', 0, -(maxEntries + 1))
      .exec();
  }

  // LFU (Least Frequently Used) Strategy
  private async setLFU(
    key: string,
    value: string,
    maxEntries: number,
    ttl: number
  ): Promise<void> {
    // Increment frequency counter
    await this.redis.multi()
      .hincrby('lfu_frequency', key, 1)
      .setex(key, ttl, value)
      .zadd('lfu_tracker', 0, key)
      .zremrangebyrank('lfu_tracker', 0, -(maxEntries + 1))
      .exec();
  }

  // FIFO (First In First Out) Strategy
  private async setFIFO(
    key: string,
    value: string,
    maxEntries: number,
    ttl: number
  ): Promise<void> {
    await this.redis.multi()
      .zadd('fifo_tracker', Date.now(), key)
      .setex(key, ttl, value)
      .zremrangebyrank('fifo_tracker', 0, -(maxEntries + 1))
      .exec();
  }

  // Random Eviction Strategy
  private async setRandom(
    key: string,
    value: string,
    maxEntries: number,
    ttl: number
  ): Promise<void> {
    // Check current cache size
    const currentSize = await this.redis.dbsize();

    if (currentSize >= maxEntries) {
      // Randomly remove some keys
      const randomKeys = [];
      for (let i = 0; i < Math.floor(maxEntries * 0.1); i++) {
        const key = await this.redis.randomkey();
        if (key) {
          randomKeys.push(key);
        }
      }

      await Promise.all(
        randomKeys.map(k => this.redis.del(k))
      );
    }

    await this.redis.setex(key, ttl, value);
  }

  // Retrieve cached value
  async get(key: string): Promise<T | null> {
    const fullKey = this.prefix + key;
    const cachedValue = await this.redis.get(fullKey);

    if (cachedValue) {
      // Update access time for LRU
      await this.redis.zadd('lru_tracker', Date.now(), fullKey);
      return JSON.parse(cachedValue);
    }

    return null;
  }

  // Delete specific key
  async delete(key: string): Promise<void> {
    const fullKey = this.prefix + key;
    await this.redis.del(fullKey);
  }

  // Clear entire cache
  async clear(): Promise<void> {
    const keys = await this.redis.keys(`${this.prefix}*`);
    if (keys.length) {
      await this.redis.del(keys);
    }
  }

  // Advanced Caching Utilities
  async getKeys(pattern = '*'): Promise<string[]> {
    return this.redis.keys(`${this.prefix}${pattern}`);
  }

  // Cache Statistics
  async getCacheStats(): Promise<{
    totalKeys: number;
    memoryUsage: number;
  }> {
    const keys = await this.getKeys();
    const info = await this.redis.info('memory');

    return {
      totalKeys: keys.length,
      memoryUsage: parseFloat(
        info.match(/used_memory:(\d+)/)?.[1] || '0'
      )
    };
  }
}

// Factory for creating cache instances
export class CacheFactory {
  static create<T>(
    redisConfig: RedisOptions = {},
    prefix: string = 'app-cache:',
    options: Partial<CacheOptions> = {}
  ): RedisCacheService<T> {
    return new RedisCacheService<T>(
      redisConfig, prefix, options
    );
  }
}