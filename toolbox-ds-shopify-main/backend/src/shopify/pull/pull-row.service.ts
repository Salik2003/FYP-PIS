import { Injectable, NotImplementedException } from "@nestjs/common";

export interface PullRowRequest {
    dataSourceId: number;
    pullId: number;
    entityName: string;
    primaryId: Map<string, any>;
}

@Injectable()
export class PullRowService {
    constructor() { }

    async getCount(request: PullRowRequest): Promise<number> {
        throw new NotImplementedException("Method not implemented.");
    }
    async execute(request: PullRowRequest): Promise<void> {
        throw new NotImplementedException("Method not implemented.");
    }
    async complete(request: PullRowRequest): Promise<void> {
        throw new NotImplementedException("Method not implemented.");
    }
}