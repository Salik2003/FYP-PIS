export class Entity {
    constructor(
        public name: string,
        public fields: Field[] = [],
        public foreignKeys: ForeignKey[] = [],
        public order: number = 99999
    ) { }

    toSchema(): object {
        return {
            name: this.name,
            fields: this.fields.map(field => ({
                name: field.name,
                type: field.type,
                primary: field.primary
            })),
            foreignKeys: this.foreignKeys.map(fk => ({
                table: fk.table,
                fields: fk.fields
            })),
            order: this.order
        };
    }
}

export type FieldType = 'string' | 'number' | 'boolean';

export class Field {
    constructor(
        public name: string,
        public type: FieldType,
        public primary: boolean = false,
        public order: number = 99999
    ) { }
}

export class ForeignKey {
    constructor(
        public table: string,
        public fields: Record<string, string>,
        public order: number = 99999
    ) { }
}

export class Data {
    constructor() { }
}