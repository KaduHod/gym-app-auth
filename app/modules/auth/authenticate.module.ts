import ENV from "../../config/env";
import { TokenRepository } from "../../database/token.repository";
import { repositoryFactory } from "../../database/repository";
import { redisClientFactory } from "../../services/redisClient.service";
import { AuthenticateController } from "./authenticate.controller";
import { APP_STAGE, connectionFactory } from "../../database/conn";
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { TABLES, User } from "../../database/entitys";
import PermissionRepository from "../../database/permission.repository";

export const authenticateModule = async ( app: FastifyInstance, option?: FastifyPluginOptions ) => {
    /**
     * Load dependencies
     */
    const connectionDB = connectionFactory(ENV.STAGE as APP_STAGE)
    const { getRepository } = repositoryFactory(connectionDB)
    const permissionRepository = new PermissionRepository(connectionDB)
    const authenticateController = new AuthenticateController(
        getRepository<User>(TABLES.USER), 
        permissionRepository, 
        new TokenRepository(await redisClientFactory())
    )

    /**
     * Load middlewares
     */
    const middlewares = {
        preValidation: [
            authenticateController.authBodyValidation.bind(authenticateController),
            authenticateController.authBodyTransform.bind(authenticateController)
        ],
        preHandler: authenticateController.checkUserCrendentials.bind(authenticateController)
    }

    /**
     * Register routes
     */
    app.post(
        "/auth",  
        middlewares,
        authenticateController.handleToken.bind(authenticateController)
    )
}