import { sign } from "jsonwebtoken"
import { OmitCommon, Permission, User } from "../database/entitys"
import env from "../config/env"

export type AccessTokenI = {
    user:OmitCommon<User>,
    permissions: Permission | Permission[],
    audience: audience
}

export type audience =  "mobile app" | "web app" | "web service" 

export const algorithm = "HS256"

const header = {
    typ :"JWT", 
    alg: algorithm,
}

export default class AccessToken implements AccessTokenI {
    public user!: User
    public permissions!: Permission | Permission[]
    public audience!: audience
    constructor(init: AccessTokenI) {
        Object.assign(this, init)
    }

    sign(){
        const { TOKEN_SECRET_KEY } = env
        return sign(
            {
                ...this.user,
                permissions: this.permissions
            },
            TOKEN_SECRET_KEY,
            {
                header,
                expiresIn: "30m",
                audience: this.audience,
                subject: this.user.id.toString()
            }
        )
    }
}