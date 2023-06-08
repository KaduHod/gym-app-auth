import { IsNotEmpty, IsString } from "class-validator"

export class ValidateRequest {
    @IsString()
    @IsNotEmpty()
    public accessToken!: string 
    constructor(init:{token:string}) {
        Object.assign(this, init)
    }
}