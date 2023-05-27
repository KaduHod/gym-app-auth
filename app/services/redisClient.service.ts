import { createClient, RedisClientOptions } from 'redis'
import ENV from '../config/env'
export const redisClientFactory = () => {
    return createClient({
        url: `redis://@${ENV.REDIS_HOST}:${ENV.REDIS_PORT}`
    })
}