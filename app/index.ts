import ENV from './config/env'
import fastify from "fastify";
import fastifyCors from '@fastify/cors';
import { GlobalErrorHandler } from "./exceptions/globalErrorHandler";
import { authenticateModule } from "./modules/auth/authenticate.module";
import { authrorizeModule } from './modules/authorize/authorize.module';

const app = fastify({logger:true})

app
.register(authenticateModule)
.register(authrorizeModule)
.setErrorHandler(GlobalErrorHandler)
.register(fastifyCors)

const start = async () => {
    try {
      await app.listen({ port: Number(ENV.APP_PORT), host:"0.0.0.0" })
    } catch (err) {
        app.log.error(err)
        process.exit(1)
    }
}

start()