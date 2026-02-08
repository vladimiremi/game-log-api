import { Test, TestingModule } from '@nestjs/testing';
import type {
  ParsedKill,
  ParsedMatchEnded,
  ParsedMatchStarted,
} from '../interfaces/log-parser.interface';
import { LogParserService } from './log-parser.service';

describe('LogParserService', () => {
  let service: LogParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogParserService],
    }).compile();

    service = module.get<LogParserService>(LogParserService);
  });

  describe('parseLine', () => {
    it('should return match_started event for "New match X has started" line', () => {
      const line = '23/04/2019 15:34:22 - New match 11348965 has started';
      const result = service.parseLine(line);

      expect(result.type).toBe('match_started');
      if (result.type === 'match_started') {
        expect(result.matchId).toBe(11348965);
        expect(result.timestamp).toEqual(new Date(2019, 3, 23, 15, 34, 22));
      }
    });

    it('should return match_ended event for "Match X has ended" line', () => {
      const line = '23/04/2019 15:39:22 - Match 11348965 has ended';
      const result = service.parseLine(line);

      expect(result.type).toBe('match_ended');
      if (result.type === 'match_ended') {
        expect(result.matchId).toBe(11348965);
        expect(result.timestamp).toEqual(new Date(2019, 3, 23, 15, 39, 22));
      }
    });

    it('should return kill event for player kill line', () => {
      const line = '23/04/2019 15:36:04 - Roman killed Nick using M16';
      const result = service.parseLine(line);
      expect(result).not.toBeNull();
      if (!result) return;
      expect(result.type).toBe('kill');
      const kill = result as ParsedKill;
      expect(kill.killer).toBe('Roman');
      expect(kill.victim).toBe('Nick');
      expect(kill.weapon).toBe('M16');
      expect(kill.timestamp).toEqual(new Date(2019, 3, 23, 15, 36, 4));
    });

    it('should return kill event for <WORLD> kill line', () => {
      const line = '23/04/2019 15:36:33 - <WORLD> killed Nick by DROWN';
      const result = service.parseLine(line);
      expect(result).not.toBeNull();
      if (!result) return;
      expect(result.type).toBe('kill');
      const kill = result as ParsedKill;
      expect(kill.killer).toBe('<WORLD>');
      expect(kill.victim).toBe('Nick');
      expect(kill.weapon).toBe('DROWN');
      expect(kill.timestamp).toEqual(new Date(2019, 3, 23, 15, 36, 33));
    });

    it('should return null for empty or whitespace-only line', () => {
      expect(service.parseLine('')).toBeNull();
      expect(service.parseLine('   ')).toBeNull();
      expect(service.parseLine('\t')).toBeNull();
    });

    it('should return null for unknown line format', () => {
      const line = '23/04/2019 15:00:00 - foo bar';
      expect(service.parseLine(line)).toBeNull();
    });
  });

  describe('parseLog', () => {
    it('should return only events from valid lines, skipping blanks', () => {
      const logContent = [
        '23/04/2019 15:34:22 - New match 11348965 has started',
        '',
        '23/04/2019 15:36:04 - Roman killed Nick using M16',
        '   ',
        '23/04/2019 15:39:22 - Match 11348965 has ended',
      ].join('\n');
      const result = service.parseLog(logContent);
      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('match_started');
      expect(result[1].type).toBe('kill');
      expect(result[2].type).toBe('match_ended');
    });

    it('should return correct sequence for full sample log', () => {
      const logContent = [
        '23/04/2019 15:34:22 - New match 11348965 has started',
        '23/04/2019 15:36:04 - Roman killed Nick using M16',
        '23/04/2019 15:36:33 - <WORLD> killed Nick by DROWN',
        '23/04/2019 15:39:22 - Match 11348965 has ended',
        '',
        '23/04/2021 16:14:22 - New match 11348966 has started',
        '23/04/2021 16:26:04 - Roman killed Marcus using M16',
        '23/04/2021 16:36:33 - <WORLD> killed Marcus by DROWN',
        '23/04/2021 16:49:22 - Match 11348966 has ended',
        '',
        '24/04/2020 16:14:22 - New match 11348961 has started',
        '24/04/2020 16:26:12 - Roman killed Marcus using M16',
        '24/04/2020 16:35:56 - Marcus killed Jhon using AK47',
        '24/04/2020 17:12:34 - Roman killed Bryian using M16',
        '24/04/2020 18:26:14 - Bryan killed Marcus using AK47',
        '24/04/2020 19:36:33 - <WORLD> killed Marcus by DROWN',
        '24/04/2020 20:19:22 - Match 11348961 has ended',
      ].join('\n');
      const result = service.parseLog(logContent);
      expect(result).toHaveLength(15);
      expect(result[0].type).toBe('match_started');
      expect((result[0] as ParsedMatchStarted).matchId).toBe(11348965);
      expect(result[1].type).toBe('kill');
      expect(result[2].type).toBe('kill');
      expect(result[3].type).toBe('match_ended');
      expect((result[3] as ParsedMatchEnded).matchId).toBe(11348965);
      expect(result[4].type).toBe('match_started');
      expect((result[4] as ParsedMatchStarted).matchId).toBe(11348966);
      expect(result[5].type).toBe('kill');
      expect(result[6].type).toBe('kill');
      expect(result[7].type).toBe('match_ended');
      expect(result[8].type).toBe('match_started');
      expect((result[8] as ParsedMatchStarted).matchId).toBe(11348961);
      expect(result[9].type).toBe('kill');
      expect(result[10].type).toBe('kill');
      expect(result[11].type).toBe('kill');
      expect(result[12].type).toBe('kill');
      expect(result[13].type).toBe('kill');
      expect(result[14].type).toBe('match_ended');
      expect((result[14] as ParsedMatchEnded).matchId).toBe(11348961);
    });
  });
});
