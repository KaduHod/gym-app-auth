import fastify from "fastify";
import middlewarePlugin from '@fastify/middie'
import { authenticateRoutes } from "./controllers/authentica.controller";
import ENV from './config/env'
import { GlobalErrorHandler } from "./exceptions/globalErrorHandler";

const app = fastify({logger:false})

app
.register(middlewarePlugin)
.register(authenticateRoutes)
.setErrorHandler(GlobalErrorHandler)

/**
 * Run the server!
 */
const start = async () => {
    try {
      await app.listen({ port: Number(ENV.APP_PORT), host:"0.0.0.0" })
    } catch (err) {
        app.log.error(err)
      process.exit(1)
    }
}
start()