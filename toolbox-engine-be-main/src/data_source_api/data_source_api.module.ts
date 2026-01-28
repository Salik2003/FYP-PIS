import { Module } from '@nestjs/common';
import { DataSourceApiService } from './data_source_api/data_source_api.service';
import { DataSourceApiController } from './data_source_api/data_source_api.controller';
import { DataSourceModule } from '../data_source/data_source.module';

@Module({
    imports: [DataSourceModule],
    providers: [DataSourceApiService],
    controllers: [DataSourceApiController],
    exports: [DataSourceApiService],
})
export class DataSourceApiModule { }
