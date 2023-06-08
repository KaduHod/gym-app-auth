import { validate, ValidationError } from "class-validator";
import { FastifyReply, FastifyRequest } from "fastify";
import { Permission, User } from "../../database/entitys";
import PermissionRepository from "../../database/permission.repository";
import { Repository } from "../../database/repository";
import { TokenRepository } from "../../database/token.repository";
import { validationErrorMapper } from "../../helpers/errors.helper";
import { resolveWithoutThrow } from "../../helpers/promise.helper";
import { decodeToken, verifyRefreshToken } from "../../helpers/token.helper";
import { STATUS_CODES } from "../../helpers/types";
import AccessToken from "../../Tokens/Access.token";
import RefreshToken from "../../Tokens/Refresh.token";
import { RefreshTokenPayload } from "./validate";

export class AuthorizeController {
    constructor(
        public readonly userRepository: Repository<User>,
        public readonly permissionRepository: PermissionRepository,
        public readonly tokenRepository: TokenRepository
    ){}

    async authorize(request:FastifyRequest, reply:FastifyReply){
        const {refreshToken} = request.body as RefreshTokenPayload;
        const valid = verifyRefreshToken(refreshToken)

        if(!valid) {
            return reply
                    .code(STATUS_CODES.UNAUTHORIZED)
                    .send("Invalid token!")
        }

        const decoded = decodeToken<RefreshToken>(refreshToken)

        if(!decoded) {
            throw {
                statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
                cause: "Token parsing error!"
            }
        }

        const tokenRedis = await this.tokenRepository.get(decoded.id)

        if(!tokenRedis) {
            return reply 
                .code(STATUS_CODES.NOT_FOUND)
                .send("Entity not found!")
        }

        if(!decoded.exp) {
            return reply
                .code(STATUS_CODES.UNAUTHORIZED)
                .send("Invalid expiration time!")
        }

        if(Date.now() > decoded.exp) {
            return reply 
                .code(STATUS_CODES.UNAUTHORIZED)
                .send("Token expired!")
        }

        const userID = Number(decoded.sub);

        const userDB:User | undefined = await this.userRepository.getFirstBy(
            {id: userID},
            ['birthday',"cellphone", "email", "id", "name", "nickname", "password"]
        )

        if(!userDB) {
            return reply 
                .code(STATUS_CODES.NOT_FOUND)
                .send("Entity not found!")
        }

        const permissionDB:Permission[] | Permission = await this.permissionRepository.getByUser(userDB.id, ['id', 'title'])
    
        if(!permissionDB) {
            return reply 
                .code(STATUS_CODES.NOT_FOUND)
                .send("Entity not found!")
        }

        const accessToken = new AccessToken({
            user: userDB,
            permissions: permissionDB,
            audience: decoded.aud
        }).sign()

        return reply 
                .code(STATUS_CODES.OK)
                .send({accessToken});
    }

    async authorizeBodyValidation(request: FastifyRequest, _: FastifyReply, next: Function){
        const errors:ValidationError[] = await resolveWithoutThrow(
            validate, new RefreshTokenPayload(request.body as any)
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