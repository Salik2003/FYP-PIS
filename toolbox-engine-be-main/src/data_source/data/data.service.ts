import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSourceData, DataSourceValue } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import DataSourceQueue from 'src/queue/data-source.queue';
import { DataSourceService } from '../data_source/data_source.service';
import { EntityService } from '../entity/entity.service';

@Injectable()
export class DataService {
    private readonly logger = new Logger(DataService.name);
    constructor(private readonly prisma: PrismaService
        , private readonly dataSourceService: DataSourceService
        , private readonly entityService: EntityService
        , private readonly dataSourceQueue: DataSourceQueue
    ) { }

    async getById(id: number): Promise<DataSourceData> {
        const data = await this.prisma.dataSourceData.findUnique({
            where: { id },
        });
        if (!data) {
            throw new NotFoundException(`Data with ID ${id} not found`);
        }
        return data;
    }

    async getValueById(id: number): Promise<DataSourceValue> {
        const field = await this.prisma.dataSourceValue.findUnique({
            where: { id },
        });
        if (!field) {
            throw new NotFoundException(`Value with ID ${id} not found`);
        }
        return field;
    }

    async getByEntityId(entityId: number) {
        const entity = await this.entityService.findById(entityId);
        const data = await this.prisma.dataSourceData.findMany({
            where: { entityId: entityId, deleted: false },
            orderBy: [{ id: 'desc' }]
        });
        const fields = await this.entityService.getFields(entityId);
        const result: any[] = [];
        for (let item of data) {
            const values = await this.prisma.dataSourceValue.findMany({
                where: { dataId: item.id, active: true, fieldId: { in: fields.map(f => f.id) } },
            });
            const object = {};
            for (let field of fields) {
                const value = values.find(v => v.fieldId === field.id);
                object[field.name] = value ? this.toJSONValue(value.value, field.type) : null;
            };
            result.push(object);
        }
        return { entity, fields, data: result };
    }

    private toJSONValue(value: any, type: string): string | number | boolean | null {
        if (type === 'number') {
            return value == null ? null : parseFloat(value);
        } else if (type === 'boolean') {
            return value === 'true';
        } else {
            return value;
        }
    }

    private async upsertData(entityId: number, item: any) {
        let dataId = await this.findDataIdByPrimaryKeys(entityId, item);
        if (dataId) {
            await this.prisma.dataSourceData.update({
                where: { id: dataId },
                data: {
                    deleted: false,
                    updatedAt: new Date(),
                }
            });
        } else {
            const data = await this.prisma.dataSourceData.create({
                data: {
                    entityId: entityId
                }
            });
            dataId = data.id;
        }
        await this.upsertValues(entityId, dataId, item);
        this.logger.log(`Data upserted for entity ID ${entityId}, data ID ${dataId}`);
    }

    private async upsertValues(entityId: number, dataId: number, item: any) {
        const current = await this.getDataValues(dataId);
        const changes = Object.keys(item).reduce((acc, key) => {
            if (current[key] !== item[key]) {
                acc[key] = item[key];
            }
            return acc;
        }, {});
        if (Object.keys(changes).length === 0) {
            this.logger.log(`No changes detected for data ID ${dataId}`);
            return;
        }
        const fields = await this.entityService.getFields(entityId);
        for (let field of fields) {
            if (changes[field.name] !== undefined) {
                let v: string = changes[field.name];
                if (v != null) v = v.toString();
                await this.prisma.dataSourceValue.upsert({
                    where: {
                        dataId_fieldId: {
                            dataId: dataId,
                            fieldId: field.id,
                        }
                    },
                    create: {
                        dataId: dataId,
                        fieldId: field.id,
                        value: v,
                        active: true,
                    },
                    update: {
                        value: v,
                        active: true,
                    }
                });
            }
        }
    }

    private async getDataValues(dataId: number) {
        const values = await this.prisma.dataSourceValue.findMany({
            where: { dataId: dataId },
            include: {
                field: true,
            },
        });
        const result: { [key: string]: any } = {};
        for (const value of values) {
            result[value.field.name] = this.toJSONValue(value.value, value.field.type);;
        }
        return result;
    }

    private async findDataIdByPrimaryKeys(entityId: number, item: any) {
        const fields = await this.entityService.getFields(entityId);
        const primaryKeys = fields.filter(f => f.primary);
        const primaryKeyValues = primaryKeys.map(f => item[f.name].toString());
        const values = await this.prisma.dataSourceValue.findMany({
            where: {
                fieldId: {
                    in: primaryKeys.map(f => f.id),
                },
                value: {
                    in: primaryKeyValues,
                },
                active: true
            }
        });
        if (values.length === 0) {
            return null;
        }
        return values[0].dataId;
    }

    private async removeAllDataByEntityId(entityId: number) {
        await this.prisma.dataSourceData.updateMany({
            where: {
                entityId: entityId,
            },
            data: {
                deleted: true,
            }
        });
    }
    async pushData(entityId: number, data: any[]) {
        for (const item of data) {
            await this.upsertData(entityId, item);
        }
        return { message: `Pushed ${data.length} records to entity ${entityId}` };
    }
}
