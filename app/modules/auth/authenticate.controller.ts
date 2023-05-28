import { validate, ValidationError } from "class-validator";
import { FastifyRequest, FastifyReply } from "fastify";
import { Permission, User, UserPermissions } from "../../database/entitys";
import { Repository, Where } from "../../database/repository";
import { validationErrorMapper } from "../../helpers/errors.helper";
import { filterUnusedProps } from "../../helpers/object.helper";
import { resolveWithoutThrow } from "../../helpers/promise.helper";
import { STATUS_CODES } from "../../helpers/types";
import { encrypt, checkHash } from "../../services/hash.service";
import { TokenService } from "../../services/token.service";
import { AuthenticateUserPayload } from "./validate";

export class AuthenticateController {
    constructor(
        public userRepository: Repository<User>,
        public userPermissionRepository: Repository<UserPermissions>,
        public permissionRepository: Repository<Permission>,
        public tokenService: TokenService
    ){}

    async auth(request:FastifyRequest, reply:FastifyReply){
        console.log("***** CALLED TWICE *****")
        const userPayload:AuthenticateUserPayload = request.body as AuthenticateUserPayload;

        console.log({userPayload})

        const where:Where<User> = {}

        if(userPayload.email) {
            where.email = userPayload.email 
        }

        if(userPayload.nickname) {
            where.nickname = userPayload.nickname
        }

        const [userDB, permissionDB] = await Promise.all([
            this.userRepository.getFirstBy(where, ["id","password"]),
            this.permissionRepository.getFirstBy({title: userPayload.permission}, "id")
        ]);

        if(!userDB) {
            return reply
                .code(STATUS_CODES.NOT_FOUND)
                .send({message: "User not found!"});
        }

        if(!permissionDB) {
            return reply
                .code(STATUS_CODES.NOT_FOUND)
                .send({message: "Permission not found!"});
        }

        const userHasPermission = await this.userPermissionRepository.getFirstBy({
            user_id: userDB.id, permission_id: permissionDB.id
        });

        if(!userHasPermission) {
            return reply
                .code(STATUS_CODES.UNAUTHORIZED)
                .send({message: "User permission not found!"});
        }

        const validCredentials = checkHash(userPayload.password, userDB.password)

        if(!validCredentials) {
            return reply
                .code(STATUS_CODES.UNAUTHORIZED)
                .send({message: "Invalid credentials!"})
        }

        const token = this.tokenService.create(
            userDB, 
            permissionDB, 
            userDB.id.toString(), 
            userPayload.targetService
        )
        
        return reply
            .code(STATUS_CODES.OK)
            .send({token})
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

