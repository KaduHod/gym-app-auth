import { RedisClientType, SetOptions } from 'redis'
import { TOKEN_EXPIRATION_TIME } from '../helpers/token.helper'

export class TokenRepository {
    constructor(
        public readonly redis: RedisClientType<Record<string, never>, Record<string, never>, Record<string, never>>
    ){}

    getOptions():SetOptions{
        return {
            EX: TOKEN_EXPIRATION_TIME(2)
        }
    }

    async push(key:string,value:string){
        await this.redis.SET(key, value, this.getOptions())
    }

    async get(key:string) {
        return await this.redis.GET(key)
    }
}