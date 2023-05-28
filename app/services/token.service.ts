import ENV from "../config/env";
import jwt, { JwtPayload } from 'jsonwebtoken'
import { Permission, User } from "../database/entitys";

const {TOKEN_SECRET_KEY, TOKEN_ISSUER} = ENV

const TOKEN_EXPIRATION_TIME = () => {
    return  Date.now() + (60 * 60 * 3 * 1000)
}

const algorithm = "HS256"
const header = {
    typ :"JWT", 
    alg: algorithm,
    signature: TOKEN_SECRET_KEY
}

export type TOKEN = {

}

export type TOKEN_PAYLOAD = JwtPayload & {
    permissions: string | string[],
    user: User
}

export type TokenService = {
    create: (user: User, permissions: Permission[] | Permission, subject:string, audience:string) => string,
    verify: (token:string) => boolean
}

export const TokenService = ():TokenService => {
    const create = (
        {password, ...user}: User, 
        permissions: Permission[] | Permission, 
        subject:string, 
        audience:string
    ): string => {
        console.log({TOKEN_SECRET_KEY})
        return jwt.sign(
            JSON.stringify({
                iss: TOKEN_ISSUER,
                sub: subject,
                aud: audience,
                exp: TOKEN_EXPIRATION_TIME(),
                iat: Date.now(),
                user: {
                    ...user,
                    permissions
                },
            }),
            TOKEN_SECRET_KEY as string,
            { header }
        )
    }

    const verify = (token: TOKEN) => {
        return true
    }

    return {create, verify}
}