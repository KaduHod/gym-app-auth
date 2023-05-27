import ENV from './env'
import {Knex} from 'knex'

const pool:Knex.PoolConfig = { min: 2, max: 10 }

const acquireConnectionTimeout =  10000

const client = 'mysql2'

const dev:Knex.Config = {
    connection: {
        host: ENV.DB_HOST,
        password: ENV.DB_PWD,
        user: ENV.DB_USER,
        database: ENV.DB_DATABASE,
        port: Number(ENV.DB_PORT) ?? 3306
    },
    client,
    pool,
    acquireConnectionTimeout
}

const prod:Knex.Config = {
    connection: {
        host: ENV.DB_HOST,
        password: ENV.DB_PWD,
        user: ENV.DB_USER,
        database: ENV.DB_DATABASE,
        port: Number(ENV.DB_PORT) ?? 3306
    },
    client,
    pool,
    acquireConnectionTimeout
}

export default { dev, prod }