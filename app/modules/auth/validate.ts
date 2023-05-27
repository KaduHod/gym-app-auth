import {  
    IsEmail, 
    IsNotEmpty, 
    IsNumber, 
    IsOptional, 
    IsString, 
    Length, 
    registerDecorator, 
    ValidationArguments, 
    ValidationOptions, 
    ValidatorConstraint, 
    ValidatorConstraintInterface 
} from "class-validator"

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
    id:number,
    password:string, 
    nickname:string,
    email:string,
}

@EmailOrNickname()
export class AuthenticateUserPayload {
    @IsNumber()
    @IsNotEmpty()
    id:number

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

    constructor(props:AutheticateUserType){
        this.id = props.id
        this.password = props.password
        this.nickname = props.nickname
        this.email = props.email
    }
}