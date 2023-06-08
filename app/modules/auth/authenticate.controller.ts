import { checkHash, encrypt } from "../../services/hash.service";
import { STATUS_CODES } from "../../helpers/types";
import { TokenRepository } from "../../database/token.repository";
import { Repository, Where } from "../../database/repository";
import { filterUnusedProps } from "../../helpers/object.helper";
import { resolveWithoutThrow } from "../../helpers/promise.helper";
import { validationErrorMapper } from "../../helpers/errors.helper";
import { AuthenticateUserPayload } from "./validate";
import { validate, ValidationError } from "class-validator";
import { FastifyRequest, FastifyReply } from "fastify";
import { OmitCommon, Permission, User, UserPermissions } from "../../database/entitys";
import PermissionRepository from "../../database/permission.repository";
import AccessToken, { audience } from "../../Tokens/Access.token";
import RefreshToken from "../../Tokens/Refresh.token";

export type validatedUserPayload = {
    user: OmitCommon<User>,
    permissions: OmitCommon<Permission> | OmitCommon<Permission>[],
    targetService: audience
} 

export class AuthenticateController {
    constructor(
        public readonly userRepository: Repository<User>,
        public readonly permissionRepository: PermissionRepository,
        public readonly tokenRepository: TokenRepository
    ){}

    async handleToken(request:FastifyRequest, reply:FastifyReply){     
        const {user, targetService} = request.body as validatedUserPayload;

        const permissionDB: Permission[] = await this.permissionRepository.getByUser(user.id, ['title', "id"]);

        const accessToken = new AccessToken({
            user, 
            permissions: permissionDB, 
            audience: targetService
        }).sign()

        const refreshTokenId = encrypt(`${user.id}.${request.ip}`)

        const refreshToken = new RefreshToken({
            id: refreshTokenId,
            userID: user.id,
            ip: request.ip,
            userAgent: request.headers['user-agent'] as string,
            audience: targetService
        })

        await this.tokenRepository.push(refreshTokenId, JSON.stringify(refreshToken))
        
        return reply
            .code(STATUS_CODES.CREATED)
            .send({accessToken, refreshToken: refreshToken.sing()})

    }

    async checkUserCrendentials(request:FastifyRequest, reply:FastifyReply, next: Function) {
        const userPayload:AuthenticateUserPayload = request.body as AuthenticateUserPayload;
        
        const where:Where<User> = {}

        if(userPayload.email) {
            where.email = userPayload.email 
        }

        if(userPayload.nickname) {
            where.nickname = userPayload.nickname
        }

        const userDB = await this.userRepository.getFirstBy(where,["id","password","birthday","email","name","nickname"]) as OmitCommon<User>

        if(!userDB) {
            throw {
                statusCode: STATUS_CODES.UNAUTHORIZED,
                message: "User not found!"
            }
        }

        const validCredentials = checkHash(userPayload.password, userDB.password);

        if(!validCredentials) {
            throw {
                statusCode: STATUS_CODES.UNAUTHORIZED,
                message: "Invalid credentials!"
            }
        }

        request.body = {
            user: userDB,
            targetService: userPayload.targetService
        } as validatedUserPayload

        return next()
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

    authBodyTransform( request: FastifyRequest, _: FastifyReply, next: Function ){
        request.body = new AuthenticateUserPayload(
            filterUnusedProps(AuthenticateUserPayload, request.body as {[key:string]:any})
        )
        return next()
    }
}

