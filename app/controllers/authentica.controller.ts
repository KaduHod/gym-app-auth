import { validate, ValidationError } from "class-validator";
import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from "fastify";
import { validationErrorMapper } from "../helpers/errors.helper";
import { filterUnusedProps } from "../helpers/object.helper";
import { resolveWithoutThrow } from "../helpers/promise.helper";
import { STATUS_CODES } from "../helpers/types";
import { encrypt, checkHash } from "../services/hash.service";
import { AutheticateUser } from "./validate";

export class AuthenticateController {
    async index(request:FastifyRequest, reply:FastifyReply){
        reply.send("Hello")
    }

    async auth(request:FastifyRequest, reply:FastifyReply){
        return reply.code(STATUS_CODES.OK).send(request.body)
    }

    async authBodyValidation(request: FastifyRequest, _: FastifyReply, next: Function) {
        const errors:ValidationError[] = await resolveWithoutThrow(
            validate, new AutheticateUser(request.body as any)
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
        request.body = filterUnusedProps(AutheticateUser, request.body as {[key:string]:any})
        return next()
    }
}

export const authenticateRoutes = async ( app: FastifyInstance, option?: FastifyPluginOptions) => {
    const authenticateController = new AuthenticateController()
    const authPreHandlers = [ authenticateController.authBodyValidation,  authenticateController.authBodyParse ]
    app.post("/auth", { preHandler: authPreHandlers } , authenticateController.auth)
}