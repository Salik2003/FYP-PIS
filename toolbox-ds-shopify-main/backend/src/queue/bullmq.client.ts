import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Queue, Worker } from 'bullmq';
import { QueueConsumer } from './types';

export interface JobProcessor {
    process(job: Job): Promise<any>;
}

@Injectable()
export class BullMQClient {
    private readonly logger = new Logger(BullMQClient.name);
    private readonly queues = new Map<string, Queue>();
    private readonly workers = new Map<string, Worker>();

    constructor(private readonly configService: ConfigService) { }

    getQueue(queueName: string): Queue {
        if (!this.queues.has(queueName)) {
            this.createQueue(queueName);
        }
        return this.queues.get(queueName)!;
    }

    createQueue(queueName: string): Queue {
        if (!this.queues.has(queueName)) {
            this.queues.set(queueName, new Queue(queueName, { connection: this.getConnection() }));
            this.logger.log(`Queue ${queueName} created`);
        } else {
            this.logger.log(`Queue ${queueName} already exists`);
        }
        return this.queues.get(queueName)!;
    }

    async deleteQueue(queueName: string): Promise<void> {
        const queue = this.queues.get(queueName);
        if (!queue) {
            this.logger.log(`Queue ${queueName} not found, skipping deletion`);
            return;
        }

        // 1. Remove all jobs and related data
        await queue.drain(true); // removes all jobs including delayed
        await queue.clean(0, 0, 'completed');
        await queue.clean(0, 0, 'failed');
        await queue.clean(0, 0, 'wait');
        await queue.clean(0, 0, 'active');
        await queue.clean(0, 0, 'delayed');

        // 2. Obliterate the queue (⚠ irreversible, deletes everything)
        await queue.obliterate({ force: true });

        // 3. Close connection
        await queue.close();
        this.queues.delete(queueName);
    }

    createWorker(queueName: string, queueConsumer: QueueConsumer): Worker {
        if (!this.workers.has(queueName)) {
            this.workers.set(queueName, new Worker(queueName, async (job: Job) => {
                await queueConsumer.consume(job);
            }, { connection: this.getConnection() }));
            this.logger.log(`Worker ${queueName} created`);
        } else {
            this.logger.log(`Worker ${queueName} already exists`);
        }
        return this.workers.get(queueName)!;
    }

    async deleteWorker(queueName: string): Promise<void> {
        const worker = this.workers.get(queueName);
        if (!worker) {
            this.logger.log(`Worker ${queueName} not found, skipping deletion`);
            return;
        }
        await worker.close();
        this.workers.delete(queueName);
    }

    private getConnection() {
        return {
            host: this.configService.get<string>('BULLMQ_REDIS_HOST', 'localhost'),
            port: this.configService.get<number>('BULLMQ_REDIS_PORT', 6379),
        };
    }
}
