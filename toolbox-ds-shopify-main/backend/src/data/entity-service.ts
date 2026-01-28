import { Data, Entity } from "./types";

type Constructor<T> = new () => T;

export abstract class EntityService<T extends Entity, D extends Data> {    
    constructor(private EntityClass: Constructor<T>) { }

    getName(): string {
        const instance = new this.EntityClass();
        return instance.name;
    }

    getSchema(): object {
        const instance = new this.EntityClass();
        return instance.toSchema();
    }

    abstract findAll(): Promise<D[]>;
    
    abstract findByPrimaryKey(entity: D): Promise<D>;
    
    abstract create(entity: D): Promise<D>;
    
    abstract update(entity: D): Promise<D>;

    abstract patch(entity: D): Promise<D>;
    
    abstract delete(entity: D): Promise<void>;
}
