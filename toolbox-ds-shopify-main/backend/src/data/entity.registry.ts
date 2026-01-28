import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Data, Entity } from "./types";
import { EntityService } from "./entity-service";
import { ProductService } from "./shopify/product.service";

type Registry<T extends Entity = Entity, D extends Data = Data> = Map<string, EntityService<T, D>>;

@Injectable()
export class EntityRegistry {
    private registry: Registry = new Map();
    constructor(private readonly productService: ProductService) {
        this.registerEntity(productService);
    }
    getService<T extends Entity, D extends Data>(entityName: string): EntityService<T, D> {
        const service = this.registry.get(entityName) as EntityService<T, D>;
        if (!service) {
            throw new NotFoundException(`Entity type ${entityName} not found`);
        }
        return service
    }
    getAllServices(): Registry {
        return this.registry;
    }
    private registerEntity<T extends Entity, D extends Data>(service: EntityService<T, D>) {
        const entityName = service.getName();
        if (this.registry.has(entityName)) {
            throw new ConflictException(`Entity ${entityName} is already registered.`);
        }
        this.registry.set(entityName, service);
    }
}