import { Module } from '@nestjs/common';
import { DataSourceService } from './data_source/data_source.service';
import { DataSourceController } from './data_source/data_source.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EntityService } from './entity/entity.service';
import { EntityController } from './entity/entity.controller';
import { DataController } from './data/data.controller';
import { DataService } from './data/data.service';
import { QueueModule } from 'src/queue/queue.module';
import { PullService } from './pull/pull.service';
import { PullController } from './pull/pull.controller';
import { QueueListener } from './queue.listener';

@Module({
    imports: [PrismaModule, QueueModule],
    providers: [DataSourceService, EntityService, DataService, PullService, QueueListener],
    controllers: [DataSourceController, EntityController, DataController, PullController],
    exports: [DataSourceService, EntityService, DataService]

})
export class DataSourceModule { }
