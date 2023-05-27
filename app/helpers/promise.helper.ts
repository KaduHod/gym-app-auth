export const resolveWithoutThrow = <ReturnType extends any>(
    asyncFunction:Function, 
    args:any[] | any
) => {
    args = Array.isArray(args) ? args : [args]

    return new Promise((resolve) => asyncFunction(...args)
                                        .then(resolve)
                                        .catch(resolve)
    ) as ReturnType;
}