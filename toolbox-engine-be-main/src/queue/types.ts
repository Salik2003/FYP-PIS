import { Job, Queue, Worker } from "bullmq";
import { BullMQClient } from "./bullmq.client";
import { Logger } from "@nestjs/common";

// !!! Important: This file is shared between engine and data source queues.
// !!! Any changes here should be reflected in the other project (engine or data source)

const logger = new Logger('QueueEvents');

// Consumers
export interface QueueConsumer {
    consume(job: Job): Promise<any>;
}

// Queues
export interface EngineQueue {
    createQueue(queueName: string): Queue;
    deleteQueue(queueName: string): Promise<void>;
    createWorker(queueName: string, queueConsumer: QueueConsumer): Worker;
    deleteWorker(queueName: string): Promise<void>;
    getQueue(queueName: string): Queue;
}

export abstract class AbstractEngineQueue implements EngineQueue {
    constructor(protected readonly bullmqClient: BullMQClient) {
    }

    createQueue(queueName: string): Queue {
        return this.bullmqClient.createQueue(queueName);
    }

    deleteQueue(queueName: string): Promise<void> {
        return this.bullmqClient.deleteQueue(queueName);
    }

    createWorker(queueName: string, queueConsumer: QueueConsumer): Worker {
        return this.bullmqClient.createWorker(queueName, queueConsumer);
    }

    deleteWorker(queueName: string): Promise<void> {
        return this.bullmqClient.deleteWorker(queueName);
    }

    getQueue(queueName: string): Queue {
        return this.bullmqClient.getQueue(queueName);
    }
}

// Events 
export const getEventFromJob = (job: Job): any | undefined => {
    console.log("job.name: " + job.name + ", data: " + JSON.stringify(job.data));
    switch (job.name) {
        case 'pull.datasource':
            return new PullDataSourceEvent(job.data.pullId, job.data.dataSourceId);
        case 'pull.table':
            return new PullTableEvent(job.data.pullId, job.data.dataSourceId, job.data.entityName);
        case 'pull.row':
            return new PullRowEvent(job.data.pullId, job.data.dataSourceId, job.data.entityName, job.data.rowIds);
        case 'pull.field':
            return new PullFieldEvent(job.data.pullId, job.data.dataSourceId, job.data.entityName, job.data.rowIds, job.data.fieldName);
        case 'push.count':
            return new PushCountEvent(job.data.pullId, job.data.dataSourceId, job.data.count);
        case 'push.entity':
            return new PushEntityEvent(job.data.pullId, job.data.dataSourceId, job.data.entity);
        case 'pull.completed':
            return new PullCompletedEvent(job.data.pullId, job.data.dataSourceId);
        default:
            logger.error(`Unknown event: ${job.name}`, job.data);
            return undefined;
    }
}

export class PullDataSourceEvent {
    public name = "pull.datasource";
    constructor(public readonly pullId: number, public readonly dataSourceId: number) { }
}
export class PullTableEvent extends PullDataSourceEvent {
    public name = "pull.table";
    constructor(public readonly pullId: number, public readonly dataSourceId: number, public readonly entityName: string) {
        super(pullId, dataSourceId);
    }
}
export class PullRowEvent extends PullTableEvent {
    public name = "pull.row";
    constructor(public readonly pullId: number, public readonly dataSourceId: number, public readonly entityName: string, public readonly rowIds: any) {
        super(pullId, dataSourceId, entityName);
    }
}
export class PullFieldEvent extends PullRowEvent {
    public name = "pull.field";
    constructor(public readonly pullId: number, public readonly dataSourceId: number, public readonly entityName: string, public readonly rowIds: any, public readonly fieldName: string) {
        super(pullId, dataSourceId, entityName, rowIds);
    }
}
export class PullCompletedEvent extends PullDataSourceEvent {
    public name = "pull.completed";
    constructor(public readonly pullId: number, public readonly dataSourceId: number) {
        super(pullId, dataSourceId);
    }
}
export class PushCountEvent extends PullDataSourceEvent {
    public name = "push.count";
    constructor(public readonly pullId: number, public readonly dataSourceId: number, public readonly count: number) {
        super(pullId, dataSourceId);
    }
}
export class PushEntityEvent extends PullDataSourceEvent {
    public name = "push.entity";
    constructor(public readonly pullId: number, public readonly dataSourceId: number, public readonly entity: any) {
        super(pullId, dataSourceId);
    }
}