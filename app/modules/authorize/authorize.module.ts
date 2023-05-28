import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { connectionFactory } from "../../database/conn";
import { TokenService } from "../../services/token.service";
import { AuthorizeController } from "./authorize.controller";

export const authrorizeModule = async ( app: FastifyInstance, option?: FastifyPluginOptions ) => {
    const tokenService = TokenService()
    const authorizeController = new AuthorizeController(tokenService)

    const preValidation = [
        authorizeController.authorizeBodyValidation.bind(authorizeController)
    ]

    app.post("/authorize", { preValidation }, authorizeController.authorize.bind(authorizeController))
}

