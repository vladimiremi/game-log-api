import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { join } from 'path';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/persistence/prisma/prisma.service';
import { Orchestrator } from './orchestrator';

describe('LogsController (e2e)', () => {
  let module: TestingModule;
  let app: INestApplication;
  let prisma: PrismaService;
  let orchestrator: Orchestrator;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
      providers: [Orchestrator],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    prisma = module.get<PrismaService>(PrismaService);
    orchestrator = module.get(Orchestrator);
  });

  afterEach(async () => {
    await orchestrator.clearDatabase();
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

    it('persists parsed log data to the database', async () => {
      const samplePath = join(__dirname, 'fixtures', 'sample.log');

      await request(app.getHttpServer())
        .post('/api/logs/upload')
        .attach('file', samplePath)
        .expect(HttpStatus.CREATED);

      const matches = await prisma.match.findMany();
      expect(matches).toHaveLength(1);
      expect(matches[0].id).toBe(1n);
      expect(matches[0].startedAt).toBeInstanceOf(Date);
      expect(matches[0].endedAt).toBeInstanceOf(Date);

      const players = await prisma.player.findMany();
      expect(players).toHaveLength(2);
      const playerNames = players.map((p) => p.name).sort();
      expect(playerNames).toEqual(['Player1', 'Player2']);

      const weapons = await prisma.weapon.findMany();
      expect(weapons).toHaveLength(1);
      expect(weapons[0].name).toBe('MOD_WEAPON');

      const kills = await prisma.kill.findMany({
        include: { killer: true, victim: true, weapon: true },
      });
      expect(kills).toHaveLength(1);
      expect(kills[0].matchId).toBe(1n);
      expect(kills[0].killer.name).toBe('Player1');
      expect(kills[0].victim.name).toBe('Player2');
      expect(kills[0].weapon.name).toBe('MOD_WEAPON');
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
