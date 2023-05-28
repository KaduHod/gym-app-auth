import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { connectionFactory } from "../../database/conn";
import { TokenService } from "../../services/token.service";
import { AuthorizeController } from "./authorize.controller";

export const authrorizeModule = ( app: FastifyInstance, option?: FastifyPluginOptions ) => {
    const connectionDB = connectionFactory()
    const tokenService = TokenService()
    const authorizeController = new AuthorizeController()

    const preHandler = [
        authorizeController.authorizeBodyValidation.bind(authorizeController)
    ]

    app.post("/authorize", { preHandler }, authorizeController.authorize)
}

