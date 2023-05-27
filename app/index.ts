import fastify from "fastify";
import middlewarePlugin from '@fastify/middie'
import { authenticateModule } from "./modules/auth/authenticate.module";
import ENV from './config/env'
import { GlobalErrorHandler } from "./exceptions/globalErrorHandler";

const app = fastify({logger:false})

app
.register(middlewarePlugin)
.register(authenticateModule)
.setErrorHandler(GlobalErrorHandler)

const start = async () => {
    try {
      await app.listen({ port: Number(ENV.APP_PORT), host:"0.0.0.0" })
    } catch (err) {
        app.log.error(err)
        process.exit(1)
    }
}

start()