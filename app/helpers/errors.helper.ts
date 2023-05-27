import { ValidationError } from "class-validator";

const arrayErrorMapper = (errors:ValidationError[]) => {
    const mapped = errors.reduce( (acc,error) => {
        Object.values(error.constraints as {}).forEach(value => acc.add(value as string))
        return acc
    }, new Set<string>())

    return [...mapped]
}

export const errorResponse = (errors:string | string[]) => {
    return { message: "Request validation failed!", errors }
}

export const validationErrorMapper = (errors: ValidationError | ValidationError[]) => {
    const mapped:string[] = Array.isArray(errors)
        ? arrayErrorMapper(errors)
        : Object.values(errors.constraints as {})
    return errorResponse(mapped)
}