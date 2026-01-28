import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource, DataSourceEntity, DataSourcePullTargetType } from '@prisma/client';
import DataSourceClient from 'src/common/data_source.client';
import { Entity } from 'src/common/data_source.types';
import { PrismaService } from 'src/prisma/prisma.service';
import { DataSourceService } from '../data_source/data_source.service';

@Injectable()
export class EntityService {
    private readonly logger = new Logger(EntityService.name);
    constructor(private readonly prisma: PrismaService
        , private readonly dataSourceService: DataSourceService
    ) { }

    async findById(id: number): Promise<DataSourceEntity & { dataSource: DataSource }> {
        const entity = await this.prisma.dataSourceEntity.findUnique({
            where: { id },
            include: {
                dataSource: true,
            },
        });
        if (!entity) {
            throw new NotFoundException(`Entity with ID ${id} not found.`);
        }
        return entity;
    }

    async getFields(entityId: number): Promise<any[]> {
        return await this.prisma.dataSourceField.findMany({
            where: { entityId },
            orderBy: { order: 'asc' },
        });
    }

    async moveDown(id: number): Promise<DataSourceEntity> {
        const entity = await this.findById(id);
        const dataSourceId = entity.dataSourceId;
        const order = entity.order;
        const nextEntity = await this.prisma.dataSourceEntity.findFirst({
            where: { dataSourceId, order: { gt: order } },
            orderBy: { order: 'asc' },
        });

        if (!nextEntity) {
            return entity;
        }
        await this.prisma.dataSourceEntity.update({
            where: { id },
            data: { order: nextEntity.order },
        });
        await this.prisma.dataSourceEntity.update({
            where: { id: nextEntity.id },
            data: { order: order },
        });
        return nextEntity;
    }

    async moveUp(id: number): Promise<DataSourceEntity> {
        const entity = await this.findById(id);
        const dataSourceId = entity.dataSourceId;
        const order = entity.order;
        const previousEntity = await this.prisma.dataSourceEntity.findFirst({
            where: { dataSourceId, order: { lt: order } },
            orderBy: { order: 'desc' },
        });
        if (!previousEntity) {
            return entity;
        }
        await this.prisma.dataSourceEntity.update({
            where: { id },
            data: { order: previousEntity.order },
        });
        await this.prisma.dataSourceEntity.update({
            where: { id: previousEntity.id },
            data: { order: order },
        });
        return previousEntity;
    }

    async moveFieldDown(fieldId: number): Promise<void> {
        const field = await this.prisma.dataSourceField.findUnique({
            where: { id: fieldId },
        });
        if (!field) {
            return;
        }
        const order = field.order;
        const nextField = await this.prisma.dataSourceField.findFirst({
            where: { entityId: field.entityId, order: { gt: order } },
            orderBy: { order: 'asc' },
        });
        if (!nextField) {
            return;
        }
        await this.prisma.dataSourceField.update({
            where: { id: fieldId },
            data: { order: nextField.order },
        });
        await this.prisma.dataSourceField.update({
            where: { id: nextField.id },
            data: { order: order },
        });
    }

    async moveFieldUp(fieldId: number): Promise<void> {
        const field = await this.prisma.dataSourceField.findUnique({
            where: { id: fieldId },
        });
        if (!field) {
            return;
        }
        const order = field.order;
        const previousField = await this.prisma.dataSourceField.findFirst({
            where: { entityId: field.entityId, order: { lt: order } },
            orderBy: { order: 'desc' },
        });
        if (!previousField) {
            return;
        }
        await this.prisma.dataSourceField.update({
            where: { id: fieldId },
            data: { order: previousField.order },
        });
        await this.prisma.dataSourceField.update({
            where: { id: previousField.id },
            data: { order: order },
        });
    }

    async findByDataSourceId(id: number) {
        return await this.prisma.dataSourceEntity.findMany({
            where: { dataSourceId: id },
        });
    }
    async loadAllEntities(dataSourceId: number): Promise<DataSourceEntity[]> {
        return await this.prisma.dataSourceEntity.findMany({
            where: { dataSourceId: dataSourceId },
            include: {
                fields: {
                    orderBy: { order: 'asc' },
                },
                foreignKeys: {
                    include: {
                        refEntity: true,
                        fields: {
                            include: {
                                field: true,
                                refField: true,
                            },
                        },
                    },
                },
            },
            orderBy: { order: 'asc' },
        });
    }

    async sync(dataSourceId: number) {
        const dataSource = await this.dataSourceService.findById(dataSourceId);
        if (!dataSource) {
            throw new NotFoundException(`Data source with ID ${dataSourceId} not found.`);
        }
        const dataSourceClient = new DataSourceClient(dataSource);
        const entities = await dataSourceClient.getEntities();
        await this.saveEntities(dataSourceId, entities);
        return { message: `Entities synced for data source ${dataSource.name} (${dataSource.id})` };
    }

    async getLastPull(targetType: DataSourcePullTargetType, targetId: number) {
        return await this.prisma.dataSourcePull.findFirst({
            where: { targetType, targetId },
            orderBy: { createdAt: 'desc' }
        });
    }

    // private methods 
    private async findEntityByDataSourceIdAndName(dataSourceId: number, name: string): Promise<DataSourceEntity | null> {
        return await this.prisma.dataSourceEntity.findFirst({
            where: {
                dataSourceId: dataSourceId,
                name: name,
            },
        });
    }

    private async findFieldByEntityIdAndName(entityId: number, name: string) {
        return await this.prisma.dataSourceField.findFirst({
            where: {
                entityId: entityId,
                name: name,
            },
        });
    }

    async saveEntities(dataSourceId: number, entities: Entity[]): Promise<void> {
        await this.markEntitiesAsRemoved(dataSourceId);
        await this.markFieldsAsRemoved(dataSourceId);
        await this.deleteAllForeignKeys(dataSourceId);
        // 
        for (const entity of entities) {
            const entityRecord = await this.prisma.dataSourceEntity.upsert({
                where: {
                    dataSourceId_name: {
                        dataSourceId: dataSourceId,
                        name: entity.name,
                    }
                },
                create: {
                    dataSourceId: dataSourceId,
                    name: entity.name,
                    status: 'ENABLED',
                    order: entity.order,
                },
                update: {
                    status: 'ENABLED',
                    order: entity.order,
                },
            });
            for (const field of entity.fields) {
                await this.prisma.dataSourceField.upsert({
                    where: {
                        entityId_name: {
                            entityId: entityRecord.id,
                            name: field.name,
                        }
                    },
                    create: {
                        entityId: entityRecord.id,
                        name: field.name,
                        type: field.type,
                        status: 'ENABLED',
                        primary: field.primary,
                        order: field.order,
                    },
                    update: {
                        status: 'ENABLED',
                        primary: field.primary,
                        order: field.order,
                    },
                });
            }
        }
        // upsert foreign keys
        for (const entity of entities) {
            const entityRecord = await this.findEntityByDataSourceIdAndName(dataSourceId, entity.name);
            if (!entityRecord) {
                this.logger.warn(`Entity ${entity.name} not found in data source ${dataSourceId}. Skipping foreign key creation.`);
                continue;
            }
            if (!entity.foreignKeys || entity.foreignKeys.length === 0) {
                this.logger.warn(`Entity ${entity.name} has no foreign keys defined. Skipping foreign key creation.`);
                continue;
            }
            for (let foreignKey of entity.foreignKeys) {
                const refRecord = await this.findEntityByDataSourceIdAndName(dataSourceId, foreignKey.table);
                if (!refRecord) {
                    this.logger.warn(`Referenced entity ${foreignKey.table} not found in data source ${dataSourceId}. Skipping foreign key creation.`);
                    continue;
                }
                const foreignKeyRecord = await this.prisma.dataSourceForeignKey.upsert({
                    where: {
                        entityId_refEntityId: {
                            entityId: entityRecord.id,
                            refEntityId: refRecord.id,
                        }
                    },
                    create: {
                        entityId: entityRecord.id,
                        refEntityId: refRecord.id,
                    },
                    update: {}
                });
                this.logger.log(`Foreign key fields: ${JSON.stringify(foreignKey.fields)}, ${Object.keys(foreignKey.fields)}`);
                for (let fieldName of Object.keys(foreignKey.fields)) {
                    this.logger.log(`Processing field: ${fieldName}`);
                    const fieldRecord = await this.findFieldByEntityIdAndName(entityRecord.id, fieldName);
                    if (!fieldRecord) {
                        this.logger.warn(`Field ${fieldName} not found in entity ${entityRecord.name}. Skipping foreign key field creation.`);
                        continue;
                    }
                    const refFieldRecord = await this.findFieldByEntityIdAndName(refRecord.id, foreignKey.fields[fieldName]);
                    if (!refFieldRecord) {
                        this.logger.warn(`Referenced field ${foreignKey.fields[fieldName]} not found in entity ${refRecord.name}. Skipping foreign key field creation.`);
                        continue;
                    }
                    await this.prisma.dataSourceForeignKeyField.upsert({
                        where: {
                            foreignKeyId_fieldId_refFieldId: {
                                foreignKeyId: foreignKeyRecord.id,
                                fieldId: fieldRecord.id,
                                refFieldId: refFieldRecord.id,
                            }
                        },
                        create: {
                            foreignKeyId: foreignKeyRecord.id,
                            fieldId: fieldRecord.id,
                            refFieldId: refFieldRecord.id,
                        },
                        update: {}
                    });
                }
            }
        }
    }

    private async markEntitiesAsRemoved(dataSourceId: number): Promise<void> {
        await this.prisma.dataSourceEntity.updateMany({
            where: {
                dataSourceId: dataSourceId,
            },
            data: {
                status: 'REMOVED'
            },
        });
    }
    private async findAllEntities(dataSourceId: number): Promise<DataSourceEntity[]> {
        return await this.prisma.dataSourceEntity.findMany({
            where: {
                dataSourceId: dataSourceId,
            },
        });
    }
    private async markFieldsAsRemoved(dataSourceId: number): Promise<void> {
        const entities = await this.findAllEntities(dataSourceId);
        for (const entity of entities) {
            await this.prisma.dataSourceField.updateMany({
                where: {
                    entityId: entity.id,
                },
                data: {
                    status: 'REMOVED'
                },
            });
        }
    }
    private async deleteAllForeignKeys(dataSourceId: number): Promise<void> {
        const entities = await this.findAllEntities(dataSourceId);
        for (const entity of entities) {
            const foreignKeys = await this.prisma.dataSourceForeignKey.findMany({
                where: {
                    entityId: entity.id,
                },
            });
            if (foreignKeys.length === 0) continue;
            for (let foreignKey of foreignKeys) {
                await this.prisma.dataSourceForeignKeyField.deleteMany({
                    where: {
                        foreignKeyId: foreignKey.id,
                    },
                });
            }
            await this.prisma.dataSourceForeignKey.deleteMany({
                where: {
                    entityId: entity.id,
                },
            });
        }
    }
}