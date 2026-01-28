import { Injectable, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PullCompletedEvent, PushEntityEvent } from "../../queue/types";

export interface EntityService {
    getName(): string;
    getSingle(primaryId: Map<string, any>): Promise<any>;
    getCount(primaryId?: Map<string, any>): Promise<number>;
    getPage(cursor?: string): Promise<any>;
}

@Injectable()
export class EntityServiceRegistry {
    // register map of entity name and entity service
    private entityServices: Map<string, EntityService> = new Map();
    constructor(private readonly eventEmitter: EventEmitter2) { }

    register(entityService: EntityService): void {
        this.entityServices.set(entityService.getName(), entityService);
    }

    async getSingle(entityName: string, primaryId: Map<string, any>): Promise<any> {
        const entityService = this.getEntityService(entityName);
        return entityService.getSingle(primaryId);
    }
    async getCount(entityName: string, primaryId?: Map<string, any>): Promise<number> {
        const entityService = this.getEntityService(entityName);
        return entityService.getCount(primaryId);
    }

    async getPage(entityName: string, cursor?: string): Promise<any> {
        const entityService = this.getEntityService(entityName);
        return entityService.getPage(cursor);
    }

    async pullData(entityName: string, dataSourceId: number, pullId: number, cursor?: string): Promise<void> {
        const entityService = this.getEntityService(entityName);
        const page = await entityService.getPage(cursor);
        for(let item of page.items) {
            this.eventEmitter.emit('push.entity', new PushEntityEvent(pullId, dataSourceId, item));
        }
        if (page.hasNextPage) {
            return await this.pullData(entityName, dataSourceId, pullId, page.nextCursor);
        } else {
            this.eventEmitter.emit('pull.completed', new PullCompletedEvent(pullId, dataSourceId));
        }
    }

    private getEntityService(entityName: string): EntityService {
        const entityService = this.entityServices.get(entityName);
        if (!entityService) {
            throw new NotFoundException(`Entity service ${entityName} not found`);
        }
        return entityService;
    }
}