export interface DataSource {
    id: number;
    name: string;
    url: string;
    active: boolean;
}

export interface CreateDataSourceRequest {
    name: string;
    url: string;
    active?: boolean;
}

export interface DataSourceEntity {
    id: number;
    dataSourceId: number;
    // Based on standard entity fields usually returned
    name?: string;
    externalId?: string;
}

export interface DataSourceData {
    id: number;
    entityId: number;
    // Since 'data' can be anything depending on the source
    data: Record<string, any>;
    createdAt?: string;
}
