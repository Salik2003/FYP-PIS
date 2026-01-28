import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { DataSource } from "@prisma/client";
import { Job } from "bullmq";
import { BullMQClient } from "./bullmq.client";
import { AbstractEngineQueue, getEventFromJob, QueueConsumer, PullDataSourceEvent, PullTableEvent, PullRowEvent, PullFieldEvent, PullCompletedEvent, PushCountEvent, PushEntityEvent } from "./types";

@Injectable()
export default class DataSourceQueue extends AbstractEngineQueue implements QueueConsumer {
    private readonly logger = new Logger(DataSourceQueue.name);
    constructor(protected readonly bullmqClient: BullMQClient, private readonly eventEmitter: EventEmitter2) {
        super(bullmqClient);
    }

    async register(dataSource: DataSource) {
        this.createQueue(this.dataSourceQueueName(dataSource));
        this.createWorker(this.engineQueueName(dataSource), this);
    }

    async unregister(dataSource: DataSource) {
        this.deleteQueue(this.dataSourceQueueName(dataSource));
        this.deleteWorker(this.engineQueueName(dataSource));
    }

    async consume(job: Job): Promise<any> {
        this.logger.log(`Consuming job ${job.name} for data source ${job.data.dataSourceId}, data: ${JSON.stringify(job.data)}`);
        const event = getEventFromJob(job);
        if (event) {
            // Emit the event with the proper event name and payload
            const eventName = job.name.replace('.', '.');
            this.eventEmitter.emit(eventName, event);
        }
    }
    
    async pushEvent(dataSource: DataSource, event: any) {
        this.register(dataSource);
        // Map event class to job name and create proper payload
        let eventName: string;
        let eventPayload: any;
        const constructorName = event.constructor.name;
        
        if (constructorName === 'PullDataSourceEvent') {
            eventName = 'pull.datasource';
            eventPayload = { pullId: event.pullId, dataSourceId: event.dataSourceId };
        } else if (constructorName === 'PullTableEvent') {
            eventName = 'pull.table';
            eventPayload = { pullId: event.pullId, dataSourceId: event.dataSourceId, entityName: event.entityName };
        } else if (constructorName === 'PullRowEvent') {
            eventName = 'pull.row';
            eventPayload = { pullId: event.pullId, dataSourceId: event.dataSourceId, entityName: event.entityName, rowIds: event.rowIds };
        } else if (constructorName === 'PullFieldEvent') {
            eventName = 'pull.field';
            eventPayload = { pullId: event.pullId, dataSourceId: event.dataSourceId, entityName: event.entityName, rowIds: event.rowIds, fieldName: event.fieldName };
        } else if (constructorName === 'PullCompletedEvent') {
            eventName = 'pull.completed';
            eventPayload = { pullId: event.pullId, dataSourceId: event.dataSourceId };
        } else if (constructorName === 'PushCountEvent') {
            eventName = 'push.count';
            eventPayload = { pullId: event.pullId, dataSourceId: event.dataSourceId, count: event.count };
        } else if (constructorName === 'PushEntityEvent') {
            eventName = 'push.entity';
            eventPayload = { pullId: event.pullId, dataSourceId: event.dataSourceId, entity: event.entity };
        } else {
            throw new Error(`Unknown event type: ${event.constructor.name}`);
        }
        this.logger.log(`Pushing event ${eventName} for data source ${dataSource.id} to queue ${this.dataSourceQueueName(dataSource)} with payload ${JSON.stringify(eventPayload)}`);
        this.bullmqClient.getQueue(this.dataSourceQueueName(dataSource)).add(eventName, eventPayload);
    }

    private dataSourceQueueName(dataSource: DataSource) {
        return `data-source-${dataSource.apiKey}`;
    }

    private engineQueueName(dataSource: DataSource) {
        return `engine-${dataSource.apiKey}`;
    }
}