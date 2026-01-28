import { Injectable, NotImplementedException } from "@nestjs/common";

export interface PullDataSourceRequest {
    dataSourceId: number;
    pullId: number;
}

@Injectable()
export class PullDataSourceService {
    constructor() { }

    async getCount(request: PullDataSourceRequest): Promise<number> {
        throw new NotImplementedException("Method not implemented.");
    }
    async execute(request: PullDataSourceRequest): Promise<void> {
        throw new NotImplementedException("Method not implemented.");
    }
    async complete(request: PullDataSourceRequest): Promise<void> {
        throw new NotImplementedException("Method not implemented.");
    }
}