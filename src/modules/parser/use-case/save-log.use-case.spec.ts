import { Test, TestingModule } from '@nestjs/testing';
import type { ParsedLogEvent } from '../interfaces/log-parser.interface';
import { LOG_PARSER } from '../interfaces/log-parser.port';
import type { ILogParser } from '../interfaces/log-parser.port';
import {
  KILL_REPOSITORY,
  type IKillRepository,
} from '../../../domain/repositories/kill-repository.interface';
import {
  MATCH_REPOSITORY,
  type IMatchRepository,
} from '../../../domain/repositories/match-repository.interface';
import {
  PLAYER_REPOSITORY,
  type IPlayerRepository,
} from '../../../domain/repositories/player-repository.interface';
import {
  WEAPON_REPOSITORY,
  type IWeaponRepository,
} from '../../../domain/repositories/weapon-repository.interface';
import { SaveLogUseCase } from './save-log.use-case';

describe('SaveLogUseCase', () => {
  let useCase: SaveLogUseCase;
  let logParser: jest.Mocked<ILogParser>;
  let matchRepository: jest.Mocked<IMatchRepository>;
  let playerRepository: jest.Mocked<IPlayerRepository>;
  let weaponRepository: jest.Mocked<IWeaponRepository>;
  let killRepository: jest.Mocked<IKillRepository>;

  beforeEach(async () => {
    logParser = {
      parseLog: jest.fn(),
    };
    matchRepository = {
      createOrUpdate: jest.fn(),
      findById: jest.fn(),
    };
    playerRepository = {
      upsert: jest.fn(),
      findByName: jest.fn(),
    };
    weaponRepository = {
      upsert: jest.fn(),
    };
    killRepository = {
      create: jest.fn(),
      exists: jest.fn().mockResolvedValue(false),
      findByMatchId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaveLogUseCase,
        { provide: LOG_PARSER, useValue: logParser },
        { provide: MATCH_REPOSITORY, useValue: matchRepository },
        { provide: PLAYER_REPOSITORY, useValue: playerRepository },
        { provide: WEAPON_REPOSITORY, useValue: weaponRepository },
        { provide: KILL_REPOSITORY, useValue: killRepository },
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

    expect(matchRepository.createOrUpdate.mock.calls).toHaveLength(1);
    expect(matchRepository.createOrUpdate.mock.calls[0][0]).toEqual({
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

    expect(matchRepository.createOrUpdate.mock.calls).toHaveLength(2);
    expect(matchRepository.createOrUpdate.mock.calls[0][0]).toEqual({
      id: BigInt(11348965),
      startedAt,
    });
    expect(matchRepository.createOrUpdate.mock.calls[1][0]).toEqual({
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
    playerRepository.upsert.mockImplementation((name) =>
      Promise.resolve({ id: name === 'Roman' ? 1 : 2, name }),
    );
    weaponRepository.upsert.mockResolvedValue({ id: 10, name: 'M16' });

    await useCase.execute('any');

    expect(playerRepository.upsert.mock.calls.map((c) => c[0])).toContain(
      'Roman',
    );
    expect(playerRepository.upsert.mock.calls.map((c) => c[0])).toContain(
      'Nick',
    );
    expect(weaponRepository.upsert.mock.calls[0][0]).toBe('M16');
    expect(killRepository.create.mock.calls).toHaveLength(1);
    expect(killRepository.create.mock.calls[0][0]).toEqual({
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
    playerRepository.upsert.mockImplementation((name) =>
      Promise.resolve({ id: name.length, name }),
    );
    weaponRepository.upsert.mockImplementation((name) =>
      Promise.resolve({ id: name === 'M16' ? 1 : 2 , name}),
    );

    await useCase.execute('any');

    expect(matchRepository.createOrUpdate.mock.calls).toHaveLength(4);
    expect(matchRepository.createOrUpdate.mock.calls[0][0]).toEqual({
      id: BigInt(11348965),
      startedAt: started1,
    });
    expect(matchRepository.createOrUpdate.mock.calls[1][0]).toEqual({
      id: BigInt(11348965),
      startedAt: started1,
      endedAt: ended1,
    });
    expect(matchRepository.createOrUpdate.mock.calls[2][0]).toEqual({
      id: BigInt(11348966),
      startedAt: started2,
    });
    expect(matchRepository.createOrUpdate.mock.calls[3][0]).toEqual({
      id: BigInt(11348966),
      startedAt: started2,
      endedAt: ended2,
    });
    expect(killRepository.create.mock.calls).toHaveLength(2);
    expect(killRepository.create.mock.calls[0][0]).toEqual({
      matchId: BigInt(11348965),
      killerId: 5,
      victimId: 4,
      weaponId: 1,
      killedAt: kill1At,
    });
    expect(killRepository.create.mock.calls[1][0]).toEqual({
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

    expect(matchRepository.createOrUpdate.mock.calls).toHaveLength(0);
    expect(playerRepository.upsert.mock.calls).toHaveLength(0);
    expect(weaponRepository.upsert.mock.calls).toHaveLength(0);
    expect(killRepository.create.mock.calls).toHaveLength(0);
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
    playerRepository.upsert.mockImplementation((name) =>
      Promise.resolve({ id: name === 'Roman' ? 1 : 2, name }),
    );
    weaponRepository.upsert.mockResolvedValue({ id: 10, name: 'M16' });
    killRepository.exists
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    await useCase.execute('any');

    expect(killRepository.exists).toHaveBeenCalledTimes(2);
    const expectedExistsParams = {
      matchId: BigInt(11348965),
      victimId: 2,
      killedAt: killAt,
    };

    expect(killRepository.exists).toHaveBeenNthCalledWith(
      1,
      expectedExistsParams,
    );

    expect(killRepository.exists).toHaveBeenNthCalledWith(
      2,
      expectedExistsParams,
    );

    expect(killRepository.create).toHaveBeenCalledTimes(1);

    expect(killRepository.create).toHaveBeenCalledWith({
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

    expect(matchRepository.createOrUpdate.mock.calls).toHaveLength(0);
    expect(playerRepository.upsert.mock.calls).toHaveLength(0);
    expect(weaponRepository.upsert.mock.calls).toHaveLength(0);
    expect(killRepository.create.mock.calls).toHaveLength(0);
  });
});
