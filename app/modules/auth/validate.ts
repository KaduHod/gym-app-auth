import {  
    IsEmail, 
    IsEnum, 
    IsNotEmpty,  
    IsOptional, 
    IsString, 
    Length, 
    registerDecorator, 
    ValidationArguments, 
    ValidationOptions, 
    ValidatorConstraint, 
    ValidatorConstraintInterface 
} from "class-validator"
import { audience } from "../../Tokens/Access.token";


@ValidatorConstraint({name:"Email or password required", async: false})
export class EmailOrNicknameRule implements ValidatorConstraintInterface {
    validate(value: any, validationArguments?: ValidationArguments | undefined):boolean {
        const values = validationArguments?.object as any
        return values['email'] || values['nickname'];
    }
    defaultMessage?(validationArguments?: ValidationArguments | undefined): string {
        return "email or nickname required"
    }

}

export const EmailOrNickname = (options?:ValidationOptions):ClassDecorator => {
    return (target:Function) => {
        registerDecorator({
            name: "Email or password required",
            validator: EmailOrNicknameRule,
            async: false,
            target,
            propertyName: "id",
            
        })
    }
}

export type AutheticateUserType = {
    password:string, 
    nickname?:string,
    email?:string,
    targetService:audience
}

@EmailOrNickname()
export class AuthenticateUserPayload {
    constructor(init:AutheticateUserType){
        this.password = init.password
        this.nickname = init.nickname
        this.email = init.email
        this.targetService = init.targetService
    }

    @Length(5, 20)
    @IsOptional()
    @IsString()
    nickname?: string

    @Length(8, 20)
    @IsNotEmpty()
    @IsString()
    password: string

    @IsEmail()
    @IsOptional()
    @IsString()
    email?: string

    @IsNotEmpty()
    @IsEnum({
        "web app": "web app",
        "mobile app": "mobile app",
        "web service": "web service",
    })
    targetService: audience
}