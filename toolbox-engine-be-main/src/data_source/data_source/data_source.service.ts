import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DataSourceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) { }

  // Fetch all data sources
  findAll(): Promise<DataSource[]> {
    return this.prisma.dataSource.findMany({
      orderBy: { order: 'asc' },
    });
  }

  // Find a data source by ID
  async findById(id: number): Promise<DataSource> {
    const data = await this.prisma.dataSource.findUnique({
      where: { id },
    });
    if (!data) {
      throw new NotFoundException(`Data source with ID ${id} not found.`);
    }
    return data;
  }

  findByName(name: string): Promise<DataSource | null> {
    return this.prisma.dataSource.findFirst({
      where: { name },
    });
  }

  // Find by API key
  findByApiKey(apiKey: string): Promise<DataSource | null> {
    return this.prisma.dataSource.findUnique({
      where: { apiKey },
    });
  }

  // Find by engine API key
  findByEngineApiKey(engineApiKey: string): Promise<DataSource | null> {
    return this.prisma.dataSource.findUnique({
      where: { engineApiKey },
    });
  }

  findByUrl(url: string): Promise<DataSource | null> {
    return this.prisma.dataSource.findFirst({
      where: { url },
    });
  }

  // Create new data source
  async create(data: {
    name: string;
    url: string;
  }): Promise<DataSource> {
    const byName = await this.findByName(data.name);
    if (byName) {
      throw new ConflictException(`Data source with name ${data.name} already exists.`);
    }
    const byUrl = await this.findByUrl(data.url);
    if (byUrl) {
      throw new ConflictException(`Data source with URL ${data.url} already exists.`);
    }
    const length = 16; // Length of the API key and engine API key
    const apiKey = randomBytes(length).toString('hex').match(/.{1,8}/g)!.join('-');
    const engineApiKey = randomBytes(length).toString('hex').match(/.{1,8}/g)!.join('-');
    const entity = {
      ...data,
      apiKey,
      engineApiKey,
      order: 99999,
    } as DataSource;
    const dataSource = await this.prisma.dataSource.create({ data: entity });
    this.eventEmitter.emit('dataSource.created', dataSource);
    return dataSource;
  }

  // Update existing data source
  async update(id: number, data: Partial<DataSource>): Promise<DataSource> {
    const dataSource = await this.prisma.dataSource.update({
      where: { id },
      data,
    });
    this.eventEmitter.emit('dataSource.deleted', dataSource);
    return dataSource;
  }

  async moveDown(id: number): Promise<DataSource> {
    const dataSource = await this.findById(id);
    const order = dataSource.order;
    const nextDataSource = await this.prisma.dataSource.findFirst({
      where: { order: { gt: order } },
      orderBy: { order: 'asc' },
    });
    if (!nextDataSource) {
      return dataSource;
    }
    await this.prisma.dataSource.update({
      where: { id },
      data: { order: nextDataSource.order },
    });
    await this.prisma.dataSource.update({
      where: { id: nextDataSource.id },
      data: { order: order },
    });
    return nextDataSource;
  }

  async moveUp(id: number): Promise<DataSource> {
    const dataSource = await this.findById(id);
    const order = dataSource.order;
    const previousDataSource = await this.prisma.dataSource.findFirst({
      where: { order: { lt: order } },
      orderBy: { order: 'desc' },
    });
    if (!previousDataSource) {
      return dataSource;
    }
    await this.prisma.dataSource.update({
      where: { id },
      data: { order: previousDataSource.order },
    });
    await this.prisma.dataSource.update({
      where: { id: previousDataSource.id },
      data: { order: order },
    });
    return previousDataSource;
  }

  // Delete a data source
  async delete(id: number): Promise<DataSource> {
    const dataSource = await this.prisma.dataSource.delete({
      where: { id },
    });
    this.eventEmitter.emit('dataSource.deleted', dataSource);
    return dataSource;
  }
}
