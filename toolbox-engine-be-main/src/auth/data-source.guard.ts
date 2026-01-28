import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { DataSourceService } from "../data_source/data_source/data_source.service";

@Injectable()
export class DataSourceGuard implements CanActivate {
    private readonly logger = new Logger(DataSourceGuard.name);
    constructor(private readonly dataSourceService: DataSourceService) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['x-api-key'];
        const dataSource = this.dataSourceService.findByEngineApiKey(apiKey);
        if (!dataSource) {
            this.logger.warn(`Invalid API key: ${apiKey}`);
            return false;
        }
        return true;
    }
}