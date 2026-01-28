import { Injectable, NotImplementedException } from "@nestjs/common";

export interface PullTableRequest {
    dataSourceId: number;
    pullId: number;
    entityName: string;
}

@Injectable()
export class PullRowService {
    constructor() { }

    async getCount(request: PullTableRequest): Promise<number> {
        throw new NotImplementedException("Method not implemented.");
    }
    async execute(request: PullTableRequest): Promise<void> {
        throw new NotImplementedException("Method not implemented.");
    }
    async complete(request: PullTableRequest): Promise<void> {
        throw new NotImplementedException("Method not implemented.");
    }
}