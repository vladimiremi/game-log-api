import { Test, TestingModule } from '@nestjs/testing';
import { Kill } from '../../../domain/entities/kill.entity';
import { Match } from '../../../domain/entities/match.entity';
import {
  MATCH_REPOSITORY,
  type IMatchRepository,
} from '../../../domain/repositories/match-repository.interface';
import { GetMatchRankingUseCase } from './get-match-ranking.use-case';

describe('GetMatchRankingUseCase', () => {
  let useCase: GetMatchRankingUseCase;
  let matchRepository: jest.Mocked<IMatchRepository>;
  const baseParams = {
    matchId: 1n,
    victimName: 'Victim',
    weaponName: 'Railgun',
    killedAt: new Date('2024-01-01T10:00:00.000Z'),
  };

  beforeEach(async () => {
    matchRepository = {
      save: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMatchRankingUseCase,
        { provide: MATCH_REPOSITORY, useValue: matchRepository },
      ],
    }).compile();

    useCase = module.get<GetMatchRankingUseCase>(GetMatchRankingUseCase);
  });

  it('should return ranking ordered by frags descending', async () => {
    const base = new Date('2024-01-01T10:00:00.000Z');
    const kills = [
      new Kill({ ...baseParams, killerName: 'PlayerA', killedAt: new Date(base.getTime() + 0) }),
      new Kill({ ...baseParams, killerName: 'PlayerB', killedAt: new Date(base.getTime() + 1) }),
      new Kill({ ...baseParams, killerName: 'PlayerA', killedAt: new Date(base.getTime() + 2) }),
    ];
    matchRepository.findById.mockResolvedValue(
      Match.reconstitute(1n, base, null, kills),
    );

    const result = await useCase.execute(1n);

    expect(result).toEqual([
      { playerName: 'PlayerA', frags: 2, deaths: 0 },
      { playerName: 'PlayerB', frags: 1, deaths: 0 },
      { playerName: 'Victim', frags: 0, deaths: 3 },
    ]);
  });

  it('should disregard kills by WORLD', async () => {
    const kills = [
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
    ];
    matchRepository.findById.mockResolvedValue(
      Match.reconstitute(1n, new Date('2024-01-01T10:00:00.000Z'), null, kills),
    );

    const result = await useCase.execute(1n);

    expect(result).toEqual([
      { playerName: 'Roman', frags: 1, deaths: 0 },
      { playerName: 'Marcus', frags: 1, deaths: 0 },
      { playerName: 'Victim', frags: 0, deaths: 3 },
    ]);
    expect(result.some((e) => e.playerName === '<WORLD>')).toBe(false);
  });

  it('should return empty ranking when match has no kills', async () => {
    matchRepository.findById.mockResolvedValue(
      Match.reconstitute(1n, new Date(), null, []),
    );

    const result = await useCase.execute(1n);

    expect(result).toEqual([]);
  });

  it('should include players who only died in the ranking with zero frags', async () => {
    const kills = [
      new Kill({ ...baseParams, killerName: '<WORLD>' }),
      new Kill({ ...baseParams, killerName: '<WORLD>' }),
    ];
    matchRepository.findById.mockResolvedValue(
      Match.reconstitute(1n, new Date(), null, kills),
    );

    const result = await useCase.execute(1n);

    expect(result).toEqual([{ playerName: 'Victim', frags: 0, deaths: 1 }]);
  });

  it('should return empty ranking for non-existent match', async () => {
    matchRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute(99999n);

    expect(result).toEqual([]);
  });
});
