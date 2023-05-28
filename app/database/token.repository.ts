import { TOKEN_EXPIRATION_TIME } from '../services/token.service'
import { RedisClientType, SetOptions } from 'redis'
import { OmitCommon, Permission, User } from '../database/entitys'

export type TOKEN_KEY = OmitCommon<User> & {
    permissions: OmitCommon<Permission>[] | OmitCommon<Permission>
}

export class TokenRepository {
    constructor(
        public redis: RedisClientType<Record<string, never>, Record<string, never>, Record<string, never>>
    ){}

    getOptions():SetOptions{
        return {
            EX: TOKEN_EXPIRATION_TIME()
        }
    }

    async push(key:TOKEN_KEY,value:string){
        await this.redis.SET(JSON.stringify(key), value, this.getOptions())
    }

    async get(key:TOKEN_KEY) {
        return await this.redis.GET(JSON.stringify(key))
    }
}