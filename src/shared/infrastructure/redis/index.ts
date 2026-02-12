import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6383';

export const redis = createClient({ url: redisUrl });

redis.on('error', (err) => console.error('Redis Client Error', err));

// Connect once at module initialization
let isConnected = false;

export async function getRedis() {
  if (!isConnected) {
    await redis.connect();
    isConnected = true;
  }
  return redis;
}
