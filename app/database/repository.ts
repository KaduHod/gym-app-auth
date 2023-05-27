import { Knex } from "knex";
import { Models, TABLES } from "./entitys";

export type Select<Model extends Models> = Array<keyof Model> | keyof Model

export type Where<Model extends Models> = {
    [Property in keyof Model] : Model[Property] | Model[Property][]
}

export class Repository<Model extends Models> {
    constructor(
        public client:Knex, public table: TABLES
    ) {}

    getBy(where: Where<Model>, fields?:Select<Model>) {
        const builder = this.builder()
        const select = this.setSelect(fields);
        return this.setWhere(builder as any, where)
            .select(...select)
    }

    getFirstBy(where: Where<Model>, fields?:Select<Model>) {
        return this.getBy(where, fields).first()
    }

    setSelect(select?:Select<Model>) {
        if(!select) return [`${this.table}.*`];
        
        return Array.isArray(select) 
            ? select.map(key => `${this.table}.${key as string}`)
            : [`${this.table}.${select as string}`] 
    }

    setWhere(builder:Knex, where:Where<Model>) {
        for(const [key, value] of Object.entries(where))
        {
            Array.isArray(value)
                ? builder.whereIn(key, value)
                : builder.andWhere(key, value as any)
        }
        return builder
    }

    builder() {
        return this.client<Model>(this.table);
    }
}


export const repositoryFactory = (client:Knex) => {
    return {
        getRepository: <Model extends Models>(table: TABLES) => {
            return new Repository<Model>(client, table)
        }
    }
}
