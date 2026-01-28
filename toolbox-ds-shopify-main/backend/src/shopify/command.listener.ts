import { Injectable, Logger, NotImplementedException } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import EngineQueue from "../queue/engine.queue";
import { PullCompletedEvent, PullDataSourceEvent, PullTableEvent, PushCountEvent, PushEntityEvent } from "../queue/types";
import { EntityServiceRegistry } from "./pull/entity.service";

@Injectable()
export class CommandListener {
    private readonly logger = new Logger(CommandListener.name);
    constructor(private readonly engineQueue: EngineQueue, private readonly entityServiceRegistry: EntityServiceRegistry) { }

    @OnEvent('pull.datasource')
    async handlePullDataSource(event: PullDataSourceEvent) {
        throw new NotImplementedException("PullDataSource is not implemented")
    }

    @OnEvent('pull.table')
    async handlePullTable(event: PullTableEvent) {
        this.logger.log(`Pull request received for pull #${event.pullId}`);
        if (!event.entityName) {
            throw new NotImplementedException('Entity name is required');
        }
        const count = await this.entityServiceRegistry.getCount(event.entityName);
        this.logger.log(`Pushing count ${count} for pull id ${event.pullId}`);
        this.engineQueue.pushEvent(new PushCountEvent(event.pullId, event.dataSourceId, count));
        await this.entityServiceRegistry.pullData(event.entityName, event.dataSourceId, event.pullId);
    }

    @OnEvent('push.entity')
    async handlePushEntity(event: PushEntityEvent) {
        this.logger.log(`Push entity received for the pull ${event.pullId} and data source ${event.dataSourceId}, entity: ${JSON.stringify(event.entity)}`);
        this.engineQueue.pushEvent(new PushEntityEvent(event.pullId, event.dataSourceId, event.entity));
    }

    @OnEvent('pull.completed')
    async handlePullCompleted(event: PullCompletedEvent) {
        this.logger.log(`Pull completed for the pull ${event.pullId} and data source ${event.dataSourceId}`);
        this.engineQueue.pushEvent(new PullCompletedEvent(event.pullId, event.dataSourceId));
    }
}