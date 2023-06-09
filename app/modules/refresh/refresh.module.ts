import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { APP_STAGE, connectionFactory } from "../../database/conn";
import { repositoryFactory } from "../../database/repository";
import { AuthorizeController } from "./refresh.controller";
import env from "../../config/env";
import { TABLES, User } from "../../database/entitys";
import PermissionRepository from "../../database/permission.repository";
import { TokenRepository } from "../../database/token.repository";
import { redisClientFactory } from "../../services/redisClient.service";

export const refreshModule = async ( app: FastifyInstance, option?: FastifyPluginOptions ) => {
    const connectionDB = connectionFactory(env.STAGE as APP_STAGE)
    const { getRepository } = repositoryFactory(connectionDB)
    const userRepository = getRepository<User>(TABLES.USER)
    const tokenRepository = new TokenRepository(await redisClientFactory())
    const permissionRepository = new PermissionRepository(connectionDB)
    const authorizeController = new AuthorizeController(
        userRepository, permissionRepository, tokenRepository
    )

    const preValidation = [
        authorizeController.authorizeBodyValidation.bind(authorizeController)
    ]

    app.post("/refresh", { preValidation }, authorizeController.authorize.bind(authorizeController))
}