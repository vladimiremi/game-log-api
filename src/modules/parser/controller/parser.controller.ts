import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SaveLogUseCase } from '../use-case/save-log.use-case';
import { FileValidationPipe } from '../pipes/file-validation.pipe';

@ApiTags('logs')
@Controller('api/logs')
export class ParserController {
  constructor(private readonly saveLogUseCase: SaveLogUseCase) {}

  @Post('/upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Log file (.log or .txt only)',
        },
      },
    },
  })
  async upload(
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
  ) {
    const content = file.buffer.toString('utf-8');
    await this.saveLogUseCase.execute(content);
    return { message: 'Log processed successfully' };
  }
}
