import { Injectable, NotImplementedException } from "@nestjs/common";

export interface PullCellRequest {
    dataSourceId: number;
    pullId: number;
    entityName: string;
    fieldName: string;
    primaryId: Map<string, any>;
}

@Injectable()
export class PullCellService {
    constructor() { }

    async getCount(request: PullCellRequest): Promise<number> {
        throw new NotImplementedException("Method not implemented.");
    }

    async execute(request: PullCellRequest): Promise<void> {
        throw new NotImplementedException("Method not implemented.");
    }
    async complete(request: PullCellRequest): Promise<void> {
        throw new NotImplementedException("Method not implemented.");
    }
}