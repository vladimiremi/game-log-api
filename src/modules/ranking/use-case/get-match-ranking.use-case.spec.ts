import { Test, TestingModule } from '@nestjs/testing';
import { LOG_REPOSITORY } from '../../parser/repository/log-repository.interface';
import type { ILogRepository } from '../../parser/repository/log-repository.interface';
import { GetMatchRankingUseCase } from './get-match-ranking.use-case';

describe('GetMatchRankingUseCase', () => {
  let useCase: GetMatchRankingUseCase;
  let logRepository: jest.Mocked<ILogRepository>;

  beforeEach(async () => {
    logRepository = {
      upsertPlayer: jest.fn(),
      upsertWeapon: jest.fn(),
      createOrUpdateMatch: jest.fn(),
      killExists: jest.fn(),
      createKill: jest.fn(),
      getKillsByMatchId: jest.fn(),
      clear: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMatchRankingUseCase,
        { provide: LOG_REPOSITORY, useValue: logRepository },
      ],
    }).compile();

    useCase = module.get<GetMatchRankingUseCase>(GetMatchRankingUseCase);
  });

  it('should return ranking ordered by frags descending', async () => {
    logRepository.getKillsByMatchId.mockResolvedValue([
      { killerId: 1, killerName: 'PlayerA' },
      { killerId: 2, killerName: 'PlayerB' },
      { killerId: 1, killerName: 'PlayerA' },
    ]);

    const result = await useCase.execute(1n);

    expect(result).toEqual([
      { playerName: 'PlayerA', frags: 2 },
      { playerName: 'PlayerB', frags: 1 },
    ]);
  });

  it('should disregard kills by WORLD', async () => {
    logRepository.getKillsByMatchId.mockResolvedValue([
      { killerId: 1, killerName: 'Roman' },
      { killerId: 2, killerName: '<WORLD>' },
      { killerId: 3, killerName: 'Marcus' },
    ]);

    const result = await useCase.execute(1n);

    expect(result).toEqual([
      { playerName: 'Roman', frags: 1 },
      { playerName: 'Marcus', frags: 1 },
    ]);
    expect(result.some((e) => e.playerName === '<WORLD>')).toBe(false);
  });

  it('should return empty ranking when match has no kills', async () => {
    logRepository.getKillsByMatchId.mockResolvedValue([]);

    const result = await useCase.execute(1n);

    expect(result).toEqual([]);
  });

  it('should return empty ranking when match has only WORLD kills', async () => {
    logRepository.getKillsByMatchId.mockResolvedValue([
      { killerId: 1, killerName: '<WORLD>' },
      { killerId: 1, killerName: '<WORLD>' },
    ]);

    const result = await useCase.execute(1n);

    expect(result).toEqual([]);
  });

  it('should return empty ranking for non-existent match', async () => {
    logRepository.getKillsByMatchId.mockResolvedValue([]);

    const result = await useCase.execute(99999n);

    expect(result).toEqual([]);
  });
});
