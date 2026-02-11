import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { join } from 'path';
import { AppModule } from '../src/app.module';
import { Orchestrator } from './orchestrator';

describe('RankingController (e2e)', () => {
  let module: TestingModule;
  let app: INestApplication;
  let orchestrator: Orchestrator;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
      providers: [Orchestrator],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    orchestrator = module.get(Orchestrator);
  });

  afterEach(async () => {
    await orchestrator.clearDatabase();
  });

  afterAll(async () => {
    await module.close();
  });

  describe('GET /api/matches/:matchId/ranking', () => {
    it('returns ranking ordered by frags and excludes WORLD after uploading ranking log', async () => {
      const rankingPath = join(__dirname, 'fixtures', 'ranking.log');

      await request(app.getHttpServer())
        .post('/api/logs/upload')
        .attach('file', rankingPath)
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .get('/api/matches/11348961/ranking')
        .expect(HttpStatus.OK);

      expect(response.body.ranking).toEqual([
        { playerName: 'Roman', frags: 2, deaths: 0 },
        { playerName: 'Marcus', frags: 1, deaths: 1 },
        { playerName: 'Nick', frags: 0, deaths: 3 },
      ]);
      expect(
        response.body.ranking.some(
          (e: { playerName: string }) => e.playerName === '<WORLD>',
        ),
      ).toBe(false);
    });

    it('returns 200 with empty ranking for non-existent match', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/matches/99999/ranking')
        .expect(HttpStatus.OK);

      expect(response.body.ranking).toEqual([]);
    });
  });
});
