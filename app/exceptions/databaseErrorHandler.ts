import {FastifyRequest, FastifyReply} from 'fastify'
import { STATUS_CODES } from '../helpers/types'

export const DatabaseErrorHandler = (error:Error, request:FastifyRequest, reply:FastifyReply) => {
    reply.code(STATUS_CODES.INTERNAL_SERVER_ERROR)
}