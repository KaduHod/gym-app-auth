import ENV from "../../config/env";
import { Permission, TABLES, User, UserPermissions } from "../../database/entitys";
import { repositoryFactory } from "../../database/repository";
import { AuthenticateController } from "./authenticate.controller";
import { APP_STAGE, connectionFactory } from "../../database/conn";
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { TokenService } from "../../services/token.service";

export const authenticateModule = async ( app: FastifyInstance, option?: FastifyPluginOptions) => {
    /**
     * Load dependencies
     */
    const connectionDB = connectionFactory(ENV.STAGE as APP_STAGE)
    const { getRepository } = repositoryFactory(connectionDB)
    const userRepository = getRepository<User>(TABLES.USER)
    const permissionRepository = getRepository<Permission>(TABLES.PERMISSIONS)
    const usersPermissionsRepository = getRepository<UserPermissions>(TABLES.USER_PERMISSION)
    const tokenService = TokenService()
    const authenticateController = new AuthenticateController(
        userRepository, usersPermissionsRepository, permissionRepository, tokenService
    )

    /**
     * Set middlewares
     */
    const authPreHandlers = [ 
        authenticateController.authBodyValidation.bind(authenticateController),  
        authenticateController.authBodyTransform.bind(authenticateController) 
    ]

    /**
     * Register routes
     */
    app.post(
        "/auth", 
        { preHandler: authPreHandlers } , 
        authenticateController.auth.bind(authenticateController)
    )
}