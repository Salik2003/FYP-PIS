import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Job } from "bullmq";
import { BullMQClient } from "./bullmq.client";
import { getEventFromJob, AbstractEngineQueue, QueueConsumer } from "./types";

@Injectable()
export default class EngineQueue extends AbstractEngineQueue implements QueueConsumer, OnModuleInit {
    private readonly logger = new Logger(EngineQueue.name);
    private readonly apiKey: string;

    constructor(protected readonly bullmqClient: BullMQClient,
        private readonly configService: ConfigService,
        private readonly eventEmitter: EventEmitter2) {
        super(bullmqClient);
        this.apiKey = this.configService.get<string>('API_KEY') ?? '';
        if (!this.apiKey) {
            this.logger.warn('API_KEY not found in environment variables');
        } else {
            this.logger.log(`API_KEY loaded successfully: ${this.apiKey.substring(0, 8)}...`);
        }
    }

    getApiKey(): string {
        return this.apiKey;
    }

    async onModuleInit() {
        this.logger.log('EngineQueue is getting initialized');
        await this.register();
        this.logger.log('EngineQueue initialized and bound to data-source queue');
    }


    async register() {
        this.createQueue(this.engineQueueName());
        this.createWorker(this.dataSourceQueueName(), this);
    }

    async unregister() {
        this.deleteQueue(this.dataSourceQueueName());
        this.deleteWorker(this.engineQueueName());
    }

    async consume(job: Job): Promise<any> {
        this.logger.log(`Consuming job ${job.name} for data source ${job.data.dataSourceId}, data: ${JSON.stringify(job.data)}`);
        const event = getEventFromJob(job);
        if (event) {
            this.eventEmitter.emit(event.name, event);
        }
    }

    async pushEvent(event: any) {
        this.bullmqClient.getQueue(this.engineQueueName()).add(event.name, event);
    }

    private dataSourceQueueName() {
        return `data-source-${this.apiKey}`;
    }

    private engineQueueName() {
        return `engine-${this.apiKey}`;
    }
}