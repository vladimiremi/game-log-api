import { Injectable } from '@nestjs/common';
import type {
  ParsedKill,
  ParsedLogEvent,
  ParsedMatchEnded,
  ParsedMatchStarted,
} from '../interfaces/log-parser.interface';
import { parseTimestamp } from '../../../helpers/parse-timestamp.helper';
import type { ILogParser } from '../interfaces/log-parser.port';

const LINE_REGEX = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2}) - (.+)$/;

@Injectable()
export class LogParserService implements ILogParser {
  parseLine(line: string): ParsedLogEvent | null {
    const trimmed = line.trim();
    if (!trimmed) return null;

    const match = trimmed.match(LINE_REGEX);
    if (!match) return null;

    const [, day, month, year, hour, min, sec, message] = match;
    const timestamp = parseTimestamp({ day, month, year, hour, min, sec });

    const newMatch = message.match(/^New match (\d+) has started$/);
    if (newMatch) {
      const event: ParsedMatchStarted = {
        type: 'match_started',
        matchId: parseInt(newMatch[1], 10),
        timestamp,
      };
      return event;
    }

    const matchEnded = message.match(/^Match (\d+) has ended$/);
    if (matchEnded) {
      const event: ParsedMatchEnded = {
        type: 'match_ended',
        matchId: parseInt(matchEnded[1], 10),
        timestamp,
      };
      return event;
    }

    const worldKill = message.match(/^<WORLD> killed (.+?) by (.+)$/);
    if (worldKill) {
      const event: ParsedKill = {
        type: 'kill',
        timestamp,
        killer: '<WORLD>',
        victim: worldKill[1].trim(),
        weapon: worldKill[2].trim(),
      };
      return event;
    }

    const playerKill = message.match(/^(.+?) killed (.+?) using (.+)$/);
    if (playerKill) {
      const event: ParsedKill = {
        type: 'kill',
        timestamp,
        killer: playerKill[1].trim(),
        victim: playerKill[2].trim(),
        weapon: playerKill[3].trim(),
      };
      return event;
    }

    return null;
  }

  parseLog(logContent: string): ParsedLogEvent[] {
    const lines = logContent.split(/\r?\n/);
    const events: ParsedLogEvent[] = [];
    for (const line of lines) {
      const event = this.parseLine(line);
      if (event) events.push(event);
    }

    return events;
  }
}
