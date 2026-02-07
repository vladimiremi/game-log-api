import { Test, TestingModule } from '@nestjs/testing';
import type { ParsedLogEvent } from '../interfaces/log-parser.interface';
import { LOG_PARSER } from '../interfaces/log-parser.port';
import type { ILogParser } from '../interfaces/log-parser.port';
import { LOG_REPOSITORY } from '../repository/log-repository.interface';
import type { ILogRepository } from '../repository/log-repository.interface';
import { SaveLogUseCase } from './save-log.use-case';

describe('SaveLogUseCase', () => {
  let useCase: SaveLogUseCase;
  let logParser: jest.Mocked<ILogParser>;
  let logRepository: jest.Mocked<ILogRepository>;

  beforeEach(async () => {
    logParser = {
      parseLog: jest.fn(),
    };
    logRepository = {
      upsertPlayer: jest.fn(),
      upsertWeapon: jest.fn(),
      createOrUpdateMatch: jest.fn(),
      killExists: jest.fn().mockResolvedValue(false),
      createKill: jest.fn(),
      getKillsByMatchId: jest.fn(),
      clear: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaveLogUseCase,
        { provide: LOG_PARSER, useValue: logParser },
        { provide: LOG_REPOSITORY, useValue: logRepository },
      ],
    }).compile();

    useCase = module.get<SaveLogUseCase>(SaveLogUseCase);
  });

  it('should persist match when match_started event is received', async () => {
    const startedAt = new Date(2019, 3, 23, 15, 34, 22);
    logParser.parseLog.mockReturnValue([
      { type: 'match_started', matchId: 11348965, timestamp: startedAt },
    ]);

    await useCase.execute('any');

    expect(logRepository.createOrUpdateMatch.mock.calls).toHaveLength(1);
    expect(logRepository.createOrUpdateMatch.mock.calls[0][0]).toEqual({
      id: BigInt(11348965),
      startedAt,
    });
  });

  it('should update match with endedAt when match_ended event is received', async () => {
    const startedAt = new Date(2019, 3, 23, 15, 34, 22);
    const endedAt = new Date(2019, 3, 23, 15, 39, 22);
    logParser.parseLog.mockReturnValue([
      { type: 'match_started', matchId: 11348965, timestamp: startedAt },
      { type: 'match_ended', matchId: 11348965, timestamp: endedAt },
    ]);

    await useCase.execute('any');

    expect(logRepository.createOrUpdateMatch.mock.calls).toHaveLength(2);
    expect(logRepository.createOrUpdateMatch.mock.calls[0][0]).toEqual({
      id: BigInt(11348965),
      startedAt,
    });
    expect(logRepository.createOrUpdateMatch.mock.calls[1][0]).toEqual({
      id: BigInt(11348965),
      startedAt,
      endedAt,
    });
  });

  it('should persist kills and resolve players/weapons via repository', async () => {
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
    logRepository.upsertPlayer.mockImplementation((name) =>
      Promise.resolve({ id: name === 'Roman' ? 1 : 2 }),
    );
    logRepository.upsertWeapon.mockResolvedValue({ id: 10 });

    await useCase.execute('any');

    expect(logRepository.upsertPlayer.mock.calls.map((c) => c[0])).toContain(
      'Roman',
    );
    expect(logRepository.upsertPlayer.mock.calls.map((c) => c[0])).toContain(
      'Nick',
    );
    expect(logRepository.upsertWeapon.mock.calls[0][0]).toBe('M16');
    expect(logRepository.createKill.mock.calls).toHaveLength(1);
    expect(logRepository.createKill.mock.calls[0][0]).toEqual({
      matchId: BigInt(11348965),
      killerId: 1,
      victimId: 2,
      weaponId: 10,
      killedAt: killAt,
    });
  });

  it('should handle multiple matches and associate kills with correct matchId', async () => {
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
    logRepository.upsertPlayer.mockImplementation((name) =>
      Promise.resolve({ id: name.length }),
    );
    logRepository.upsertWeapon.mockImplementation((name) =>
      Promise.resolve({ id: name === 'M16' ? 1 : 2 }),
    );

    await useCase.execute('any');

    expect(logRepository.createOrUpdateMatch.mock.calls).toHaveLength(4);
    expect(logRepository.createOrUpdateMatch.mock.calls[0][0]).toEqual({
      id: BigInt(11348965),
      startedAt: started1,
    });
    expect(logRepository.createOrUpdateMatch.mock.calls[1][0]).toEqual({
      id: BigInt(11348965),
      startedAt: started1,
      endedAt: ended1,
    });
    expect(logRepository.createOrUpdateMatch.mock.calls[2][0]).toEqual({
      id: BigInt(11348966),
      startedAt: started2,
    });
    expect(logRepository.createOrUpdateMatch.mock.calls[3][0]).toEqual({
      id: BigInt(11348966),
      startedAt: started2,
      endedAt: ended2,
    });
    expect(logRepository.createKill.mock.calls).toHaveLength(2);
    expect(logRepository.createKill.mock.calls[0][0]).toEqual({
      matchId: BigInt(11348965),
      killerId: 5,
      victimId: 4,
      weaponId: 1,
      killedAt: kill1At,
    });
    expect(logRepository.createKill.mock.calls[1][0]).toEqual({
      matchId: BigInt(11348966),
      killerId: 6,
      victimId: 4,
      weaponId: 2,
      killedAt: kill2At,
    });
  });

  it('should not call repository persist methods when log is empty', async () => {
    logParser.parseLog.mockReturnValue([]);

    await useCase.execute('any');

    expect(logRepository.createOrUpdateMatch.mock.calls).toHaveLength(0);
    expect(logRepository.upsertPlayer.mock.calls).toHaveLength(0);
    expect(logRepository.upsertWeapon.mock.calls).toHaveLength(0);
    expect(logRepository.createKill.mock.calls).toHaveLength(0);
  });

  it('should not create duplicate kill when same match, victim and killedAt already exists', async () => {
    const startedAt = new Date(2019, 3, 23, 15, 34, 22);
    const killAt = new Date(2019, 3, 23, 15, 36, 4);
    const endedAt = new Date(2019, 3, 23, 15, 39, 22);
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
      { type: 'match_ended', matchId: 11348965, timestamp: endedAt },
    ]);
    logRepository.upsertPlayer.mockImplementation((name) =>
      Promise.resolve({ id: name === 'Roman' ? 1 : 2 }),
    );
    logRepository.upsertWeapon.mockResolvedValue({ id: 10 });
    logRepository.killExists
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    await useCase.execute('any');

    expect(logRepository.killExists).toHaveBeenCalledTimes(2);
    const expectedExistsParams = {
      matchId: BigInt(11348965),
      victimId: 2,
      killedAt: killAt,
    };

    expect(logRepository.killExists).toHaveBeenNthCalledWith(
      1,
      expectedExistsParams,
    );

    expect(logRepository.killExists).toHaveBeenNthCalledWith(
      2,
      expectedExistsParams,
    );

    expect(logRepository.createKill).toHaveBeenCalledTimes(1);

    expect(logRepository.createKill).toHaveBeenCalledWith({
      matchId: BigInt(11348965),
      killerId: 1,
      victimId: 2,
      weaponId: 10,
      killedAt: killAt,
    });
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

    expect(logRepository.createOrUpdateMatch.mock.calls).toHaveLength(0);
    expect(logRepository.upsertPlayer.mock.calls).toHaveLength(0);
    expect(logRepository.upsertWeapon.mock.calls).toHaveLength(0);
    expect(logRepository.createKill.mock.calls).toHaveLength(0);
  });
});
