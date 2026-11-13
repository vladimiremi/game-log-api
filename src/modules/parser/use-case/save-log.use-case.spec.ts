import { Test, TestingModule } from '@nestjs/testing';
import type { ParsedLogEvent } from '../interfaces/log-parser.interface';
import { LOG_PARSER } from '../interfaces/log-parser.port';
import type { ILogParser } from '../interfaces/log-parser.port';
import {
  MATCH_REPOSITORY,
  type IMatchRepository,
} from '../../../domain/repositories/match-repository.interface';
import { SaveLogUseCase } from './save-log.use-case';

describe('SaveLogUseCase', () => {
  let useCase: SaveLogUseCase;
  let logParser: jest.Mocked<ILogParser>;
  let matchRepository: jest.Mocked<IMatchRepository>;

  beforeEach(async () => {
    logParser = {
      parseLog: jest.fn(),
    };
    matchRepository = {
      save: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaveLogUseCase,
        { provide: LOG_PARSER, useValue: logParser },
        { provide: MATCH_REPOSITORY, useValue: matchRepository },
      ],
    }).compile();

    useCase = module.get<SaveLogUseCase>(SaveLogUseCase);
  });

  it('should save match when match_ended event is received', async () => {
    const startedAt = new Date(2019, 3, 23, 15, 34, 22);
    const endedAt = new Date(2019, 3, 23, 15, 39, 22);
    logParser.parseLog.mockReturnValue([
      { type: 'match_started', matchId: 11348965, timestamp: startedAt },
      { type: 'match_ended', matchId: 11348965, timestamp: endedAt },
    ]);

    await useCase.execute('any');

    expect(matchRepository.save).toHaveBeenCalledTimes(1);
    const savedMatch = matchRepository.save.mock.calls[0][0];
    expect(savedMatch.id).toBe(BigInt(11348965));
    expect(savedMatch.startedAt).toEqual(startedAt);
    expect(savedMatch.endedAt).toEqual(endedAt);
    expect(savedMatch.kills).toHaveLength(0);
  });

  it('should save match with kills when match_ended is received', async () => {
    const startedAt = new Date(2019, 3, 23, 15, 34, 22);
    const killAt = new Date(2019, 3, 23, 15, 36, 4);
    const endedAt = new Date(2019, 3, 23, 15, 39, 22);
    logParser.parseLog.mockReturnValue([
      { type: 'match_started', matchId: 11348965, timestamp: startedAt },
      {
        type: 'kill',
        timestamp: killAt,
        killer: 'Roman',
        victim: 'Nick',
        weapon: 'M16',
      },
      { type: 'match_ended', matchId: 11348965, timestamp: endedAt },
    ]);

    await useCase.execute('any');

    expect(matchRepository.save).toHaveBeenCalledTimes(1);
    const savedMatch = matchRepository.save.mock.calls[0][0];
    expect(savedMatch.kills).toHaveLength(1);
    expect(savedMatch.kills[0].killerName).toBe('Roman');
    expect(savedMatch.kills[0].victimName).toBe('Nick');
    expect(savedMatch.kills[0].weaponName).toBe('M16');
  });

  it('should handle multiple matches and save each when ended', async () => {
    const started1 = new Date(2019, 3, 23, 15, 34, 22);
    const kill1At = new Date(2019, 3, 23, 15, 36, 4);
    const ended1 = new Date(2019, 3, 23, 15, 39, 22);
    const started2 = new Date(2021, 3, 23, 16, 14, 22);
    const kill2At = new Date(2021, 3, 23, 16, 26, 4);
    const ended2 = new Date(2021, 3, 23, 16, 49, 22);
    logParser.parseLog.mockReturnValue([
      { type: 'match_started', matchId: 11348965, timestamp: started1 },
      {
        type: 'kill',
        timestamp: kill1At,
        killer: 'Roman',
        victim: 'Nick',
        weapon: 'M16',
      },
      { type: 'match_ended', matchId: 11348965, timestamp: ended1 },
      { type: 'match_started', matchId: 11348966, timestamp: started2 },
      {
        type: 'kill',
        timestamp: kill2At,
        killer: 'Marcus',
        victim: 'Jhon',
        weapon: 'AK47',
      },
      { type: 'match_ended', matchId: 11348966, timestamp: ended2 },
    ]);

    await useCase.execute('any');

    expect(matchRepository.save).toHaveBeenCalledTimes(2);
    const match1 = matchRepository.save.mock.calls[0][0];
    expect(match1.id).toBe(BigInt(11348965));
    expect(match1.kills).toHaveLength(1);
    expect(match1.kills[0].killerName).toBe('Roman');

    const match2 = matchRepository.save.mock.calls[1][0];
    expect(match2.id).toBe(BigInt(11348966));
    expect(match2.kills).toHaveLength(1);
    expect(match2.kills[0].killerName).toBe('Marcus');
  });

  it('should not call save when log is empty', async () => {
    logParser.parseLog.mockReturnValue([]);

    await useCase.execute('any');

    expect(matchRepository.save).not.toHaveBeenCalled();
  });

  it('should not add duplicate kills when same kill appears twice', async () => {
    const startedAt = new Date(2019, 3, 23, 15, 34, 22);
    const killAt = new Date(2019, 3, 23, 15, 36, 4);
    const killEvent = {
      type: 'kill' as const,
      timestamp: killAt,
      killer: 'Roman',
      victim: 'Nick',
      weapon: 'M16',
    };
    logParser.parseLog.mockReturnValue([
      { type: 'match_started', matchId: 11348965, timestamp: startedAt },
      killEvent,
      killEvent,
      { type: 'match_ended', matchId: 11348965, timestamp: killAt },
    ]);

    await useCase.execute('any');

    const savedMatch = matchRepository.save.mock.calls[0][0];
    expect(savedMatch.kills).toHaveLength(1);
  });

  it('should save match without match_ended at end of log', async () => {
    const startedAt = new Date(2019, 3, 23, 15, 34, 22);
    logParser.parseLog.mockReturnValue([
      { type: 'match_started', matchId: 11348965, timestamp: startedAt },
      {
        type: 'kill',
        timestamp: new Date(2019, 3, 23, 15, 36, 4),
        killer: 'Roman',
        victim: 'Nick',
        weapon: 'M16',
      },
    ]);

    await useCase.execute('any');

    expect(matchRepository.save).toHaveBeenCalledTimes(1);
    const savedMatch = matchRepository.save.mock.calls[0][0];
    expect(savedMatch.kills).toHaveLength(1);
    expect(savedMatch.endedAt).toBeNull();
  });

  it('should ignore kill events when no match has started', async () => {
    logParser.parseLog.mockReturnValue([
      {
        type: 'kill',
        timestamp: new Date(),
        killer: 'Roman',
        victim: 'Nick',
        weapon: 'M16',
      },
    ] as ParsedLogEvent[]);

    await useCase.execute('any');

    expect(matchRepository.save).not.toHaveBeenCalled();
  });
});
