import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { extname } from 'path';
import { SaveLogUseCase } from '../modules/parser/use-case/save-log.use-case';

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
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedExtensions = ['.log', '.txt'];
    const ext = extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      throw new BadRequestException('Only .log and .txt files are allowed');
    }

    const content = file.buffer?.toString('utf-8') ?? '';
    if (!content.trim()) {
      throw new BadRequestException('File is empty');
    }

    await this.saveLogUseCase.execute(content);
    return { message: 'Log processed successfully' };
  }
}
