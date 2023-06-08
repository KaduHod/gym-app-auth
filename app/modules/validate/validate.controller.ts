import { validate, ValidationError } from "class-validator";
import { FastifyReply, FastifyRequest } from "fastify";
import { validationErrorMapper } from "../../helpers/errors.helper";
import { resolveWithoutThrow } from "../../helpers/promise.helper";
import { verifyAccessToken } from "../../helpers/token.helper";
import { STATUS_CODES } from "../../helpers/types";
import { ValidateRequest } from "./validate";

export default class ValidateController {
    constructor(){}
    async check(request: FastifyRequest, reply: FastifyReply){
        const {accessToken} = request.body as ValidateRequest

        const valid = verifyAccessToken(accessToken);

        if(!valid) {
            return reply.code(STATUS_CODES.UNAUTHORIZED).send('Invalid!')
        }

        return reply.code(STATUS_CODES.OK).send("Valid!")
    }

    async validateBodyRequest(request: FastifyRequest, _: FastifyReply, next: Function) {
        const errors:ValidationError[] = await resolveWithoutThrow(
            validate, new ValidateRequest(request.body as any)
        )
        
        if(!errors.length) {
            return next();
        }

        throw {
            statusCode: STATUS_CODES.BAD_REQUEST,
            cause: validationErrorMapper(errors)
        }
    }
}