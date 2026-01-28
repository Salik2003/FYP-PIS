import { Module } from '@nestjs/common';
import { BullMQClient } from './bullmq.client';
import EngineQueue from './engine.queue';

@Module({
  providers: [BullMQClient, EngineQueue],
  exports: [BullMQClient, EngineQueue],
})
export class QueueModule { }
