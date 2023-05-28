import ENV from '../config/env'
import { createClient } from 'redis'
import { RedisClientType } from '@redis/client'

export const redisClientFactory = async (): Promise<RedisClientType> => {
    const client:RedisClientType = createClient({
        url: `redis://@${ENV.REDIS_HOST}:${ENV.REDIS_PORT}`
    })

    await client.connect();

    return client;
}