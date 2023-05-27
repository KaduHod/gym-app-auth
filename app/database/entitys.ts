export enum TABLES {
    USER = "users",
    PERSONAL = "personais",
    ALUNO = "alunos",
    PERMISSIONS = "permissions",
    USER_PERMISSION = "users_permission"
}

export type User = {
    id: number
    name: string
    nickname: string
    email: string
    password: string
    cellphone: string
    createdAt: Date
    updatedAt: Date
    birthday: Date
}

export type Aluno = {
    id: number
    user_id: number
    personal_id: number
}

export type Personal = {
    id: number
    user_id: number
}

export type Permission = {
    id: number
    title:string
    createdAt:Date
    updatedAt:Date
}

export type UserPermissions = {
    permission_id: number
    user_id: number
}

export type Models = User | Aluno | Personal | UserPermissions | Permission;