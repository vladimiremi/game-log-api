import { Test, TestingModule } from '@nestjs/testing';
import { Kill } from '../../../domain/entities/kill.entity';
import {
  KILL_REPOSITORY,
  type IKillRepository,
} from '../../../domain/repositories/kill-repository.interface';
import { GetMatchRankingUseCase } from './get-match-ranking.use-case';

describe('GetMatchRankingUseCase', () => {
  let useCase: GetMatchRankingUseCase;
  let killRepository: jest.Mocked<IKillRepository>;
  const baseParams = {
    matchId: 1n,
    victimName: 'Victim',
    weaponName: 'Railgun',
    killedAt: new Date('2024-01-01T10:00:00.000Z'),
  };

  beforeEach(async () => {
    killRepository = {
      create: jest.fn(),
      exists: jest.fn(),
      findByMatchId: jest.fn(),
      clear: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMatchRankingUseCase,
        { provide: KILL_REPOSITORY, useValue: killRepository },
      ],
    }).compile();

    useCase = module.get<GetMatchRankingUseCase>(GetMatchRankingUseCase);
  });

  it('should return ranking ordered by frags descending', async () => {
    const base = new Date('2024-01-01T10:00:00.000Z');
    killRepository.findByMatchId.mockResolvedValue([
      new Kill({ ...baseParams, killerName: 'PlayerA', killedAt: new Date(base.getTime() + 0) }),
      new Kill({ ...baseParams, killerName: 'PlayerB', killedAt: new Date(base.getTime() + 1) }),
      new Kill({ ...baseParams, killerName: 'PlayerA', killedAt: new Date(base.getTime() + 2) }),
    ]);

    const result = await useCase.execute(1n);

    expect(result).toEqual([
      { playerName: 'PlayerA', frags: 2 },
      { playerName: 'PlayerB', frags: 1 },
    ]);
  });

  it('should disregard kills by WORLD', async () => {
    killRepository.findByMatchId.mockResolvedValue([
      new Kill({
        ...baseParams,
        killerName: 'Roman',
        killedAt: new Date('2024-01-01T10:00:00.000Z'),
      }),
      new Kill({
        ...baseParams,
        killerName: '<WORLD>',
        killedAt: new Date('2024-01-01T10:00:01.000Z'),
      }),
      new Kill({
        ...baseParams,
        killerName: 'Marcus',
        killedAt: new Date('2024-01-01T10:00:02.000Z'),
      }),
    ]);

    const result = await useCase.execute(1n);

    expect(result).toEqual([
      { playerName: 'Roman', frags: 1 },
      { playerName: 'Marcus', frags: 1 },
    ]);
    expect(result.some((e) => e.playerName === '<WORLD>')).toBe(false);
  });

  it('should return empty ranking when match has no kills', async () => {
    killRepository.findByMatchId.mockResolvedValue([]);

    const result = await useCase.execute(1n);

    expect(result).toEqual([]);
  });

  it('should return empty ranking when match has only WORLD kills', async () => {
    killRepository.findByMatchId.mockResolvedValue([
      new Kill({ ...baseParams, killerName: '<WORLD>' }),
      new Kill({ ...baseParams, killerName: '<WORLD>' }),
    ]);

    const result = await useCase.execute(1n);

    expect(result).toEqual([]);
  });

  it('should return empty ranking for non-existent match', async () => {
    killRepository.findByMatchId.mockResolvedValue([]);

    const result = await useCase.execute(99999n);

    expect(result).toEqual([]);
  });
});
