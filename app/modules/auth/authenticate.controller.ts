import { checkHash } from "../../services/hash.service";
import { STATUS_CODES } from "../../helpers/types";
import { audience, TokenService } from "../../services/token.service";
import { TokenRepository } from "../../database/token.repository";
import { Repository, Where } from "../../database/repository";
import { filterUnusedProps } from "../../helpers/object.helper";
import { resolveWithoutThrow } from "../../helpers/promise.helper";
import { validationErrorMapper } from "../../helpers/errors.helper";
import { AuthenticateUserPayload } from "./validate";
import { validate, ValidationError } from "class-validator";
import { FastifyRequest, FastifyReply } from "fastify";
import { OmitCommon, Permission, User, UserPermissions } from "../../database/entitys";

export type validatedUserPayload = {
    user: OmitCommon<User>,
    permissions: OmitCommon<Permission> | OmitCommon<Permission>[],
    targetService: audience
} 

export class AuthenticateController {
    constructor(
        public readonly userRepository: Repository<User>,
        public readonly userPermissionRepository: Repository<UserPermissions>,
        public readonly permissionRepository: Repository<Permission>,
        public readonly tokenService: TokenService,
        public readonly tokenRepository: TokenRepository
    ){}

    async handleToken(request:FastifyRequest, reply:FastifyReply){     
        const {user, permissions, targetService} = request.body as validatedUserPayload;

        const tokenRedis = await this.tokenRepository.get({
            ...user, permissions 
        })

        if(tokenRedis && this.tokenService.verify(tokenRedis)) {
            return reply
                .code(STATUS_CODES.OK)
                .send({accessToken: tokenRedis})
        }

        const accessToken = this.tokenService.create(
            user, 
            permissions, 
            user.id.toString(), 
            targetService
        )

        const refreshToken = this.tokenService.createRefresh(
            user.id, request.ip, request.headers['user-agent'] as string
        )

        await this.tokenRepository.push({ ...user, permissions }, accessToken)
        
        return reply
            .code(STATUS_CODES.CREATED)
            .send({accessToken, refreshToken})
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

        const [userDB, permissionDB] = await Promise.all([
            this.userRepository.getFirstBy(where,["id","password","birthday","email","name","nickname"]) as Promise<OmitCommon<User>>,
            this.permissionRepository.getFirstBy({title: userPayload.permission}, ["title","id"]) as Promise<OmitCommon<Permission> | OmitCommon<Permission>[]>
        ]);

        if(!userDB) {
            throw {
                statusCode: STATUS_CODES.UNAUTHORIZED,
                message: "User not found!"
            }
        }

        if(!permissionDB) {
            throw {
                statusCode: STATUS_CODES.UNAUTHORIZED,
                message: "Permission not found!"
            }
            
        }

        const userHasPermission = await this.userPermissionRepository.getFirstBy({
            user_id: userDB.id, 
            permission_id: Array.isArray(permissionDB) 
                ? permissionDB.map(({id}) => id)  
                : permissionDB.id
        });

        if(!userHasPermission) {
            throw {
                statusCode: STATUS_CODES.UNAUTHORIZED,
                message: "User permission not found!"
            }
        }

        const validCredentials = checkHash(userPayload.password, userDB.password)

        if(!validCredentials) {
            throw {
                statusCode: STATUS_CODES.UNAUTHORIZED,
                message: "Invalid credentials!"
            }
            
        }

        request.body = {
            user: userDB,
            permissions: permissionDB,
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

