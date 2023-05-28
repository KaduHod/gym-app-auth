import { validate, ValidationError } from "class-validator";
import { FastifyReply, FastifyRequest } from "fastify";
import { JwtPayload } from "jsonwebtoken";
import { validationErrorMapper } from "../../helpers/errors.helper";
import { resolveWithoutThrow } from "../../helpers/promise.helper";
import { STATUS_CODES } from "../../helpers/types";
import { TokenService } from "../../services/token.service";
import { AuthorizeTokenPayload } from "./validate";

export class AuthorizeController {
    constructor(
        public tokenService: TokenService
    ){}

    async authorize(request:FastifyRequest, reply:FastifyReply){
        const {token} = request.body as AuthorizeTokenPayload;
        const valid = this.tokenService.verify(token)

        if(!valid) {
            return reply
                    .code(STATUS_CODES.UNAUTHORIZED)
                    .send({message: "Invalid token!"})
        }

        const tokenDecoded = this.tokenService.decode(token, {json: true})

        if(!tokenDecoded) {
            throw {
                statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
                cause: "Token parsing error!"
            }
        }

        if(!tokenDecoded.exp) {
            return reply
                .code(STATUS_CODES.UNAUTHORIZED)
                .send({message: "Invalid expiration time!"})
        }

        if(Date.now() > tokenDecoded.exp) {
            return reply 
                .code(STATUS_CODES.UNAUTHORIZED)
                .send({message: "Token expired!"})
        }

        return reply 
                .code(STATUS_CODES.OK)
                .send({message: "Valid!"})
    }

    async authorizeBodyValidation(request: FastifyRequest, _: FastifyReply, next: Function){
        const errors:ValidationError[] = await resolveWithoutThrow(
            validate, new AuthorizeTokenPayload(request.body as any)
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