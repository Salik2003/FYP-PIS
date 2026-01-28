import { Module } from '@nestjs/common';
import { BullMQClient } from './bullmq.client';
import DataSourceQueue from './data-source.queue';

@Module({
  providers: [BullMQClient, DataSourceQueue],
  exports: [BullMQClient, DataSourceQueue],
})
export class QueueModule { }
