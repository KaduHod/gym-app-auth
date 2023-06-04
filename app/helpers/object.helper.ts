export const filterUnusedProps = <T>(constructor:any, args: {[key:string]:any}) => {
    const validProps = Object.getOwnPropertyNames(new constructor({}))
    const filteredValue = {} as {[key:string]:any}
    for(const [key, value] of Object.entries(args as {})) {
        if(validProps.includes(key) && value) {
            filteredValue[key as keyof {}] = value
        }
    }
    return filteredValue as T;
}