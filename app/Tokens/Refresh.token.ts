import { sign } from "jsonwebtoken"
import env from "../config/env"
import { audience } from "./Access.token"

export type RefreshTokenI = {
    id:string
    userID: number,
    ip: string,
    userAgent:string,
    audience: audience
}

const algorithm = "HS256"

const header = {
    typ :"JWT", 
    alg: algorithm,
}

export default class RefreshToken implements RefreshTokenI {
    public id!: string
    public userID!: number
    public ip!: string
    public userAgent!: string
    public audience!: audience
    constructor(init: RefreshTokenI) {
        Object.assign(this, init)
    }
    
    sing() {
        const { REFRESH_TOKEN_SECRET_KEY } = env
        const {userID, audience, ...payload} = this
        return sign(
            { ...payload },
            REFRESH_TOKEN_SECRET_KEY,
            {
                header,
                expiresIn: '1h',
                subject: this.userID.toString(),
                audience
            }
        )
    }
}