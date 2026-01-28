import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
    catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
        if (exception.code === 'P2002') {
            throw new ConflictException(
                `Duplicate value for field(s): ${exception.meta?.target}`
            );
        }

        // Re-throw so NestJS can handle it or other filters can catch it
        throw exception;
    }
}
