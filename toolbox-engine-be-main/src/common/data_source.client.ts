import { Logger } from "@nestjs/common";
import { DataSource } from "@prisma/client";
import { Entity } from "./data_source.types";

export default class DataSourceClient {
    private readonly logger = new Logger(DataSourceClient.name);

    constructor(private readonly dataSource: DataSource) {
        this.dataSource = dataSource;
    }
    async getEntities(): Promise<Entity[]> {
        this.logger.log(`Fetching entities from data source: ${this.dataSource.name} (${this.dataSource.id}), url: ${this.dataSource.url}`);
        const response = await fetch(`${this.dataSource.url}/api/entities`, {
            headers: {
                'api-key': this.dataSource.apiKey,
                'accept': 'application/json',
                'content-type': 'application/json',
            }
        });
        return (await response.json()) as Entity[];
    }

    async getData(entityName: string): Promise<any[]> {
        this.logger.log(`Fetching data for entity: ${entityName} from data source: ${this.dataSource.name} (${this.dataSource.id}), url: ${this.dataSource.url}`);
        const response = await fetch(`${this.dataSource.url}/api/data/${entityName}`, {
            headers: {
                'api-key': this.dataSource.apiKey,
                'accept': 'application/json',
                'content-type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch data for entity ${entityName}: ${response.statusText}`);
        }
        return (await response.json()) as any[];
    }
}