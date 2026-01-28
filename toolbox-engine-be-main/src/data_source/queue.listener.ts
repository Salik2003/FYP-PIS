import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PullService } from "src/data_source/pull/pull.service";
import { PullCompletedEvent, PushCountEvent, PushEntityEvent } from "../queue/types";

@Injectable()
export class QueueListener {
    private readonly logger = new Logger(QueueListener.name);
    constructor(private readonly pullService: PullService) {}

    @OnEvent('push.count')
    async handlePushCount(payload: PushCountEvent) {
        this.logger.log(`Received push count event: ${JSON.stringify(payload)}`);
        const pull = await this.pullService.findById(payload.pullId);
        pull.count = payload.count;
        await this.pullService.update(pull);
        this.logger.log(`Pull updated: ${pull.id} - ${pull.count}`);
    }

    @OnEvent('push.entity')
    async handlePushEntity(payload: PushEntityEvent) {
        this.logger.log(`Received push entity event: ${JSON.stringify(payload)}`);
        await this.pullService.addDataToPull(payload.pullId, payload.entity);
    }

    @OnEvent('pull.completed')
    async handlePullCompleted(payload: PullCompletedEvent) {
        this.logger.log(`Received pull completed event: ${JSON.stringify(payload)}`);
        const pull = await this.pullService.findById(payload.pullId);
        pull.status = "PULL_COMPLETED";
        await this.pullService.update(pull);
        await this.pullService.submitPull(pull);
    }
}