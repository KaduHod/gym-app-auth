import { FastifyInstance, FastifyPluginOptions } from "fastify";
import ValidateController from "./validate.controller";

export const validateModule = async (app: FastifyInstance, option?: FastifyPluginOptions) => {
    const validateController = new ValidateController()
    
    const preValidation = [
        validateController.validateBodyRequest.bind(validateController)
    ]

    app.post(
        '/check-token', 
        { preValidation }, 
        validateController.check.bind(validateController)
    )
}