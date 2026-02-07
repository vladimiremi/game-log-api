import { Module } from '@nestjs/common';
import { PrismaLogRepository } from '../../persistense/prisma/prisma-log.repository';
import { LogParserService } from './services/log-parser.service';
import { LOG_PARSER } from './interfaces/log-parser.port';
import { LOG_REPOSITORY } from './repository/log-repository.interface';
import { SaveLogUseCase } from './use-case/save-log.use-case';

@Module({
  providers: [
    LogParserService,
    SaveLogUseCase,
    {
      provide: LOG_PARSER,
      useExisting: LogParserService,
    },
    {
      provide: LOG_REPOSITORY,
      useClass: PrismaLogRepository,
    },
  ],
  exports: [SaveLogUseCase, LOG_PARSER, LOG_REPOSITORY],
})
export class ParserModule {}
