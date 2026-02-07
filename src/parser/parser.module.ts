import { Module } from '@nestjs/common';
import { PrismaLogRepository } from './adapters/prisma-log.repository';
import { LogParserService } from './log-parser.service';
import { LOG_PARSER } from './ports/log-parser.port';
import { LOG_REPOSITORY } from './ports/log-repository.port';
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
