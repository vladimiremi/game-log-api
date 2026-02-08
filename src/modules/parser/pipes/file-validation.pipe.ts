import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { extname } from 'path';

@Injectable()
export class FileValidationPipe
  implements PipeTransform<Express.Multer.File, Express.Multer.File>
{
  transform(file: Express.Multer.File): Express.Multer.File {
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

    return file;
  }
}
