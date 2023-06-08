import ENV from './config/env'
import fastify from "fastify";
import fastifyCors from '@fastify/cors';
import { GlobalErrorHandler } from "./exceptions/globalErrorHandler";
import { authenticateModule } from "./modules/auth/authenticate.module";
import { refreshModule } from './modules/refresh/refresh.module';
import { validateModule } from './modules/validate/validate.module';

const app = fastify({logger:true})

app
.register(authenticateModule)
.register(refreshModule)
.register(validateModule)
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