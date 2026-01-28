export class Entity {
    constructor(
        public name: string,
        public fields: Field[] = [],
        public foreignKeys: ForeignKey[] = []
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
            }))
        };
    }
}

export type FieldType = 'string' | 'number' | 'boolean';

export class Field {
    constructor(
        public name: string,
        public type: FieldType,
        public primary: boolean = false
    ) { }
}

export class ForeignKey {
    constructor(
        public table: string,
        public fields: Record<string, string>          // { localField: referencedField }
    ) { }
}

export class Data {
    constructor() { }
}

// types to be retrieved from the shopify
export class ProductEntity extends Entity {
    constructor(
        public fields: Field[] = [
            new Field('sku', 'string', true),
            new Field('productId', 'number'),
            new Field('title', 'string'),
            new Field('description', 'string'),
            new Field('variantTitle', 'string'),
            new Field('quantity', 'number'),
            new Field('price', 'number')
        ],
        public foreignKeys: ForeignKey[] = []
    ) {
        super("products", fields, foreignKeys);
    }
}
export class Product extends Data {
    constructor(
        public sku: string,
        public productId?: number, 
        public title?: string,
        public description?: string,
        public variantTitle?: string,
        public price?: string,
        public quantity?: number
    ) {
        super();
    }
}
