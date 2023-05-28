import {FastifyRequest, FastifyReply} from 'fastify'
import { STATUS_CODES } from '../helpers/types'

export type AppError = Error & {statusCode?:number, cause: any}

export const GlobalErrorHandler = (error:AppError, _:FastifyRequest, reply:FastifyReply) => {
    console.log({error})
    return reply
        .code(error.statusCode ?? STATUS_CODES.INTERNAL_SERVER_ERROR)
        .send(error.cause ?? error.message)
}