import { Controller, Get } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';

@ApiHeader({
    name: 'api-key',
    description: 'API Key for authentication',
    required: true,
})
@Controller('health')
export class HealthController {
    @Get()
    get() {
        const time = new Date().toISOString();
        return { status: "OK", time };
    }
}
