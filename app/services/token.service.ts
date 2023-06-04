import ENV from "../config/env";
import jwt, { DecodeOptions, JwtPayload } from 'jsonwebtoken'
import { OmitCommon, Permission, User } from "../database/entitys";

const {TOKEN_SECRET_KEY, TOKEN_ISSUER, REFRESH_TOKEN_SECRET_KEY} = ENV

export const TOKEN_EXPIRATION_TIME = () => {
    return Date.now() + (60 * 60 * 3 * 1000)
}

const algorithm = "HS256"

const header = {
    typ :"JWT", 
    alg: algorithm,
    expiresIn: '1h'
}

export enum audience { 
    MOBILE_APP = "mobile app", 
    WEB_APP = "web app", 
    WEB_SERVICE = "web service" 
}

export type TOKEN_PAYLOAD = JwtPayload & {
    permissions: string | string[],
    user: User
}

export type TokenService = {
    create: (user: OmitCommon<User>, permissions: OmitCommon<Permission>[] | OmitCommon<Permission>, subject:string, audience:audience) => string,
    verify: (token:string) => boolean,
    createRefresh: (userID: number, ipAdress: string, userAgent: string) => string
    decode: (token: string, options: DecodeOptions & { json: true }) => null | JwtPayload;
}

export const TokenService = ():TokenService => {
    const create = (
        {password, ...user}: OmitCommon<User>, 
        permissions: OmitCommon<Permission>[] | OmitCommon<Permission>, 
        subject:string, 
        audience:string,
        refresh:boolean = false
    ): string => {
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

    const createRefresh = (userID: number, ipAdress: string, userAgent: string) => {
        return jwt.sign(
            {userID, ipAdress, userAgent},
            REFRESH_TOKEN_SECRET_KEY as string,
            { header }
        )
    }

    const verify = (token: string) => {
        try {
            jwt.verify(
                token, TOKEN_SECRET_KEY as string, 
                {
                    issuer: ENV.ISSUER, 
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

    return {create, verify, decode: jwt.decode, createRefresh}
}