import { Module } from '@nestjs/common';
import { ParserController } from './controller/parser.controller';
import { LOG_PARSER } from './interfaces/log-parser.port';
import { FileValidationPipe } from './pipes/file-validation.pipe';
import { LogParserService } from './services/log-parser.service';
import { SaveLogUseCase } from './use-case/save-log.use-case';

@Module({
  controllers: [ParserController],
  providers: [
    LogParserService,
    FileValidationPipe,
    SaveLogUseCase,
    {
      provide: LOG_PARSER,
      useExisting: LogParserService,
    },
  ],
  exports: [SaveLogUseCase, LOG_PARSER],
})
export class ParserModule {}
