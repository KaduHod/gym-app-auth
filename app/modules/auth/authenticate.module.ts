import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { APP_STAGE, connectionFactory } from "../../database/conn";
import ENV from "../../config/env";
import { repositoryFactory } from "../../database/repository";
import { TABLES, User } from "../../database/entitys";
import { AuthenticateController } from "./authenticate.controller";

export const authenticateModule = async ( app: FastifyInstance, option?: FastifyPluginOptions) => {
    /**
     * Load dependencies
     */
    const connectionDB = connectionFactory(ENV.STAGE as APP_STAGE)
    const { getRepository } = repositoryFactory(connectionDB)
    const userRepository = getRepository<User>(TABLES.USER)
    const authenticateController = new AuthenticateController(userRepository)

    /**
     * Set middlewares
     */
    const authPreHandlers = [ 
        authenticateController.authBodyValidation,  
        authenticateController.authBodyParse 
    ]

    /**
     * Register routes
     */

    app.post("/auth", { preHandler: authPreHandlers } , authenticateController.auth)
}