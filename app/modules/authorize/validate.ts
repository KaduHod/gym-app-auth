import { IsNotEmpty, IsString } from "class-validator"

export class AuthorizeTokenPayload {
    @IsNotEmpty()
    @IsString()
    public token:string

    constructor(props:{token:string}) {
        this.token = props.token
    }
}