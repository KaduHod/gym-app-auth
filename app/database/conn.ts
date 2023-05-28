import knex from "knex"
import databaseConfig from "../config/database"
export type APP_STAGE = "dev" | "prod"
export const connectionFactory = (stage: APP_STAGE = "dev") => {
    return knex(databaseConfig[stage])
    .on("error", (err) => {
        console.log(err)
        throw {
            message: "Knex error"
        }
    });
}