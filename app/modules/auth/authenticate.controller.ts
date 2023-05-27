import { validate, ValidationError } from "class-validator";
import { FastifyRequest, FastifyReply } from "fastify";
import { User } from "../../database/entitys";
import { Repository } from "../../database/repository";
import { validationErrorMapper } from "../../helpers/errors.helper";
import { filterUnusedProps } from "../../helpers/object.helper";
import { resolveWithoutThrow } from "../../helpers/promise.helper";
import { STATUS_CODES } from "../../helpers/types";
import { encrypt, checkHash } from "../../services/hash.service";
import { AuthenticateUserPayload } from "./validate";

export class AuthenticateController {
    constructor(
        public userRepository: Repository<User>
    ){}
    async index(request:FastifyRequest, reply:FastifyReply){
        reply.send("Hello")
    }

    async auth(request:FastifyRequest, reply:FastifyReply){
        console.log(request.body)
        return reply.code(STATUS_CODES.OK).send(request.body)
    }

    async authBodyValidation(request: FastifyRequest, _: FastifyReply, next: Function) {
        const errors:ValidationError[] = await resolveWithoutThrow(
            validate, new AuthenticateUserPayload(request.body as any)
        )
        
        if(!errors.length) {
            return next();
        }

        throw {
            statusCode: STATUS_CODES.BAD_REQUEST,
            cause: validationErrorMapper(errors)
        }
    }

    authBodyParse( request: FastifyRequest, _: FastifyReply, next: Function ){
        request.body = new AuthenticateUserPayload(
            filterUnusedProps(AuthenticateUserPayload, request.body as {[key:string]:any})
        )
        return next()
    }
}

