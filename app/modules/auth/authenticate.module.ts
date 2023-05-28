import ENV from "../../config/env";
import { TokenService } from "../../services/token.service";
import { TokenRepository } from "../../database/token.repository";
import { repositoryFactory } from "../../database/repository";
import { redisClientFactory } from "../../services/redisClient.service";
import { AuthenticateController, validatedUserPayload } from "./authenticate.controller";
import { APP_STAGE, connectionFactory } from "../../database/conn";
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { Permission, TABLES, User, UserPermissions } from "../../database/entitys";

export const authenticateModule = async ( app: FastifyInstance, option?: FastifyPluginOptions ) => {
    /**
     * Load dependencies
     */
    const connectionDB = connectionFactory(ENV.STAGE as APP_STAGE)
    const { getRepository } = repositoryFactory(connectionDB)
    const authenticateController = new AuthenticateController(
        getRepository<User>(TABLES.USER), 
        getRepository<UserPermissions>(TABLES.USER_PERMISSION), 
        getRepository<Permission>(TABLES.PERMISSIONS), 
        TokenService(),
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