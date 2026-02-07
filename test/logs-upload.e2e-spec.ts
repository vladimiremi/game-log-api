import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { join } from 'path';
import { AppModule } from '../src/app.module';
import { LOG_REPOSITORY } from '../src/parser/ports/log-repository.port';
import type { ILogRepository } from '../src/parser/ports/log-repository.port';

describe('LogsController (e2e)', () => {
  let module: TestingModule;
  let app: INestApplication;
  let logRepository: ILogRepository;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    logRepository = module.get<ILogRepository>(LOG_REPOSITORY);
  });

  afterEach(async () => {
    await logRepository.clear();
  });

  afterAll(async () => {
    await module.close();
  });

  describe('POST /api/logs/upload', () => {
    it('returns 201 and success message when uploading a valid log file', async () => {
      const samplePath = join(__dirname, 'fixtures', 'sample.log');

      const response = await request(app.getHttpServer())
        .post('/api/logs/upload')
        .attach('file', samplePath)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({ message: 'Log processed successfully' });
    });

    it('returns 400 when no file is uploaded', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/logs/upload')
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('No file uploaded');
    });

    it('returns 400 when file has invalid extension', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/logs/upload')
        .attach('file', Buffer.from('content'), 'document.pdf')
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatch(/\.log and \.txt/);
    });

    it('returns 400 when file is empty', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/logs/upload')
        .attach('file', Buffer.from('   '), 'empty.log')
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('empty');
    });
  });
});
