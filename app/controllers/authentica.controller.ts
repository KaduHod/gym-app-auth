import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from "fastify";

export class AuthenticateController {
    async index(request:FastifyRequest, reply:FastifyReply){
        reply.send("Hello")
    }
}

export const routes = async (
    app: FastifyInstance, 
    option?: FastifyPluginOptions
) => {
    const authenticateController = new AuthenticateController();

    app.get("/", authenticateController.index)
}