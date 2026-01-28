import { Injectable, Logger, NotFoundException, NotImplementedException } from '@nestjs/common';
import { DataSource, DataSourcePull, DataSourcePullTargetType } from '@prisma/client';
import { DataSourcePullCreateRequest, DataSourcePullQuery } from 'src/dto/data_source_pull.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import DataSourceQueue from 'src/queue/data-source.queue';
import { PullDataSourceEvent, PullFieldEvent, PullRowEvent, PullTableEvent } from 'src/queue/types';
import { DataService } from '../data/data.service';
import { DataSourceService } from '../data_source/data_source.service';
import { EntityService } from '../entity/entity.service';

@Injectable()
export class PullService {
    private readonly logger = new Logger(PullService.name);
    constructor(private readonly prisma: PrismaService
        , private readonly entityService: EntityService
        , private readonly dataService: DataService
        , private readonly dataSourceService: DataSourceService
        , private readonly dataSourceQueue: DataSourceQueue
    ) { }

    async query(query: DataSourcePullQuery): Promise<DataSourcePull[]> {
        if (query.last) {
            const lastPull = await this.prisma.dataSourcePull.findFirst({
                where: { targetId: query.targetId, targetType: query.targetType },
                orderBy: { createdAt: 'desc' }
            });
            if (lastPull && query.includeDataCount) {
                const dataCount = await this.prisma.dataSourcePullData.count({
                    where: { dataSourcePullId: lastPull.id }
                });
                lastPull.pulledCount = dataCount;
            }
            return lastPull ? [lastPull] : [];
        }
        return await this.prisma.dataSourcePull.findMany({
            where: { targetId: query.targetId, targetType: query.targetType }
        });
    }

    async pull(request: DataSourcePullCreateRequest): Promise<DataSourcePull> {
        this.logger.log(`Syncing data for ${request.targetType} - ID ${request.targetId}`);
        // const entity = await this.entityService.findById(request.targetId);
        const dataSource = await this.getDataSource(request.targetType, request.targetId);
        const pull = await this.prisma.dataSourcePull.create({
            data: {
                targetId: request.targetId, targetType: request.targetType,
            }
        });
        if(request.targetType === DataSourcePullTargetType.DATA_SOURCE) {
            await this.dataSourceQueue.pushEvent(dataSource, new PullDataSourceEvent(pull.id, dataSource.id));
        }else if (request.targetType === DataSourcePullTargetType.TABLE) {
            const entity = await this.entityService.findById(request.targetId);
            await this.dataSourceQueue.pushEvent(dataSource, new PullTableEvent(pull.id, dataSource.id, entity.name));
        } else if (request.targetType === DataSourcePullTargetType.ROW) {
            throw new NotImplementedException("Pull row not implemented");
            // await this.dataSourceQueue.pushEvent(dataSource, new PullRowEvent(pull.id, dataSource.id, entity.name, request.targetId));
        } else if (request.targetType === DataSourcePullTargetType.CELL) {
            throw new NotImplementedException("Pull field not implemented");
            // await this.dataSourceQueue.pushEvent(dataSource, new PullFieldEvent(pull.id, dataSource.id, entity.name, request.targetId, request.fieldName));
        }
        return pull;
    }

    async submitPull(pull: DataSourcePull): Promise<void> {
        // await this.dataSourceQueue.pushEvent(pull.dataSource, new PullCompletedEvent(pull.id, pull.dataSource.id));
        throw new NotImplementedException("Submit pull not implemented");
    }

    async findById(id: number): Promise<DataSourcePull> {
        const pull = await this.prisma.dataSourcePull.findUnique({
            where: { id },
        });
        if (!pull) {
            throw new NotFoundException(`Pull with ID ${id} not found`);
        }
        const dataCount = await this.prisma.dataSourcePullData.count({
            where: { dataSourcePullId: id }
        });
        pull.pulledCount = dataCount;
        return pull;
    }

    async update(pull: DataSourcePull): Promise<DataSourcePull> {
        return await this.prisma.dataSourcePull.update({
            where: { id: pull.id },
            data: pull
        });
    }

    async addDataToPull(pullId: number, data: any): Promise<void> {
        await this.prisma.dataSourcePullData.create({
            data: {
                dataSourcePullId: pullId,
                data: data
            }
        });
    }

    private async getDataSource(targetType: DataSourcePullTargetType, targetId: number): Promise<DataSource> {
        if (targetType === DataSourcePullTargetType.DATA_SOURCE) {
            return this.dataSourceService.findById(targetId);
        }else if (targetType === DataSourcePullTargetType.TABLE) {
            const entity = await this.entityService.findById(targetId);
            return entity.dataSource;
        } else if (targetType === DataSourcePullTargetType.ROW) {
            const data = await this.dataService.getById(targetId);
            return this.getDataSource(DataSourcePullTargetType.TABLE, data.entityId);
        }else if (targetType === DataSourcePullTargetType.CELL) {
            const value = await this.dataService.getValueById(targetId);
            return this.getDataSource(DataSourcePullTargetType.ROW, value.dataId);
        }
        throw new NotFoundException(`Target type ${targetType} not found`);
    }
}
