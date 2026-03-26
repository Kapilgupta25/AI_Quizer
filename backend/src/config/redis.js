import Redis from 'ioredis';
import logger from '../utils/logger.js';

let redisClient;

export const getRedisClient = () => {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    return null;
  }

  if (!/^rediss?:\/\//i.test(redisUrl)) {
    logger.warn('REDIS_URL must start with redis:// or rediss:// - skipping Redis connection');
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 100, 3000),
      lazyConnect: true,
    });

    redisClient.on('connect', () => logger.info('Redis connected'));
    redisClient.on('error', (err) => logger.error(`Redis error: ${err.message || err}`));
    redisClient.on('reconnecting', () => logger.warn('Redis reconnecting...'));
  }
  return redisClient;
};

export default getRedisClient;
