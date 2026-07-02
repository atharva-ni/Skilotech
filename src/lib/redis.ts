import Redis from 'ioredis';

class InMemoryCache {
  private store = new Map<string, { value: string; expiresAt: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, ttlSeconds: number = 300): Promise<string> {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }

  async flushPattern(pattern: string): Promise<number> {
    let deletedCount = 0;
    const now = Date.now();
    // Escape regex characters except '*' which we translate to '.*'
    const regexPattern = new RegExp('^' + pattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, (m) => m === '*' ? '.*' : '\\' + m) + '$');
    
    for (const [key, item] of this.store.entries()) {
      if (now > item.expiresAt) {
        this.store.delete(key);
      } else if (regexPattern.test(key)) {
        this.store.delete(key);
        deletedCount++;
      }
    }
    return deletedCount;
  }
}

interface CacheClient {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, ttlSeconds?: number) => Promise<string>;
  del: (key: string) => Promise<number>;
  flushPattern: (pattern: string) => Promise<number>;
  isRedis: boolean;
}

let cache: CacheClient;

const redisUrl = process.env.REDIS_URL;

if (redisUrl) {
  try {
    console.log('Initializing Redis client connection...');
    const redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
    });

    redis.on('error', (err) => {
      console.warn('Redis Connection Error, bypassing to memory cache:', err.message);
    });

    cache = {
      get: async (key) => {
        try {
          return await redis.get(key);
        } catch {
          return null;
        }
      },
      set: async (key, value, ttlSeconds = 300) => {
        try {
          return await redis.set(key, value, 'EX', ttlSeconds);
        } catch {
          return 'FAILED';
        }
      },
      del: async (key) => {
        try {
          return await redis.del(key);
        } catch {
          return 0;
        }
      },
      flushPattern: async (pattern) => {
        try {
          const keys = await redis.keys(pattern);
          if (keys.length > 0) {
            return await redis.del(...keys);
          }
          return 0;
        } catch {
          return 0;
        }
      },
      isRedis: true,
    };
  } catch (err: any) {
    console.warn('Failed to construct Redis client, using in-memory cache:', err.message);
    cache = createInMemoryClient();
  }
} else {
  console.log('No REDIS_URL configured. Starting in-memory high performance cache.');
  cache = createInMemoryClient();
}

function createInMemoryClient(): CacheClient {
  const localCache = new InMemoryCache();
  return {
    get: (key) => localCache.get(key),
    set: (key, value, ttlSeconds) => localCache.set(key, value, ttlSeconds),
    del: (key) => localCache.del(key),
    flushPattern: (pattern) => localCache.flushPattern(pattern),
    isRedis: false,
  };
}

export default cache;
export { cache };
