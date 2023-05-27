import fastify, {FastifyRequest, FastifyReply} from "fastify";
import { routes } from "./controllers/authentica.controller";
import ENV from './config/env'

const app = fastify({logger:false})

app.register(routes)

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