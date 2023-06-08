import { Knex } from "knex";
import { Permission, TABLES } from "./entitys";
import { Repository, Select } from "./repository";

export default class PermissionRepository extends Repository<Permission> {
    constructor(
        client:Knex,
    ){
        super(client, TABLES.PERMISSIONS)
    }

    getByUser(userID: number, selectFields?:Select<Permission>) {
        const select = selectFields ? this.setSelect(selectFields) : [`${this.table}.*`]
        return this.client(TABLES.USER_PERMISSION)
            .innerJoin(this.table, `${this.table}.id`, `${TABLES.USER_PERMISSION}.permission_id`)
            .where(`${TABLES.USER_PERMISSION}.user_id`, userID)
            .select(...select)
    }
}