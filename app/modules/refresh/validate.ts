import { IsNotEmpty, IsString } from "class-validator"

export class RefreshTokenPayload {
    @IsNotEmpty()
    @IsString()
    public refreshToken:string

    constructor(props:{refreshToken:string}) {
        this.refreshToken = props.refreshToken
    }
}