import env from "../config/env"
import { verify, decode } from "jsonwebtoken"
import AccessToken, { algorithm, audience } from "../Tokens/Access.token"
import RefreshToken from "../Tokens/Refresh.token";
const { REFRESH_TOKEN_SECRET_KEY, TOKEN_SECRET_KEY, ISSUER } = env;

export const verifyRefreshToken = (token:string) => {
    try {
        verify(
            token, REFRESH_TOKEN_SECRET_KEY as string, 
            {
                issuer: ISSUER, 
                algorithms:[algorithm]
            }
        )
        return true
    } catch (err:any) {
        if(err.constructor.name === "JsonWebTokenError") {
            console.error(err)
            return false
        }
        return false
    }
}

export const verifyAccessToken = (token:string) => {
    try {
        verify(
            token, TOKEN_SECRET_KEY as string, 
            {
                issuer: ISSUER, 
                algorithms:[algorithm]
            }
        )
        return true
    } catch (err:any) {
        if(err.constructor.name === "JsonWebTokenError") {
            console.error(err)
            return false
        }
        return false
    }
}

export const decodeToken = <T extends AccessToken | RefreshToken>(token:string) => {
   return decode(token, {json: true}) as T & {iat: number, exp: number, sub:string, aud:audience}
}

export const TOKEN_EXPIRATION_TIME = (hrs:number = 1) => {
    return Date.now() + (60 * 60 * hrs * 1000)
}