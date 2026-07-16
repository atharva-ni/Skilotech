import Redis from 'ioredis';

declare global {
  var redisClient: Redis | undefined;
}

class InMemoryCache {
  private store = new Map<string, { value: string; expiresAt: number }>();

  constructor() {
    if (typeof window === 'undefined') {
      const interval = setInterval(() => {
        const now = Date.now();
        for (const [key, item] of this.store.entries()) {
          if (now > item.expiresAt) {
            this.store.delete(key);
          }
        }
      }, 5 * 60 * 1000);
      if (interval && typeof interval.unref === 'function') {
        interval.unref();
      }
    }
  }

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
const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;
const redisPassword = process.env.REDIS_PASSWORD;

const hasRedisConfig = redisUrl || redisHost;

if (hasRedisConfig) {
  try {
    const redisOptions: any = {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
    };
    if (redisPassword) {
      redisOptions.password = redisPassword;
    }
    
    let redis: Redis;
    if (global.redisClient) {
      redis = global.redisClient;
    } else {
      console.log('Initializing Redis client connection...');
      redis = redisUrl
        ? new Redis(redisUrl, redisOptions)
        : new Redis({
            host: redisHost,
            port: redisPort ? parseInt(redisPort, 10) : 6379,
            ...redisOptions,
          });

      if (process.env.NODE_ENV !== 'production') {
        global.redisClient = redis;
      }
    }

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
          let cursor = '0';
          let totalDeleted = 0;
          do {
            const reply = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
            cursor = reply[0];
            const keys = reply[1];
            if (keys.length > 0) {
              const deleted = await redis.del(...keys);
              totalDeleted += deleted;
            }
          } while (cursor !== '0');
          return totalDeleted;
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
  console.log('No REDIS_URL or REDIS_HOST configured. Starting in-memory high performance cache.');
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
