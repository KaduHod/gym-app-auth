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
import { audience } from "../../services/token.service";

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
    permission: string,
    targetService:audience
}

@EmailOrNickname()
export class AuthenticateUserPayload {
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
    @IsString()
    permission: string

    @IsNotEmpty()
    @IsEnum(audience)
    targetService:audience

    constructor(props:AutheticateUserType){
        this.password = props.password
        this.nickname = props.nickname
        this.email = props.email
        this.permission = props.permission
        this.targetService = props.targetService
    }
}