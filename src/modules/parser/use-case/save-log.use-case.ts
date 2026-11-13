import { Inject, Injectable } from '@nestjs/common';
import { LOG_PARSER } from '../interfaces/log-parser.port';
import type { ILogParser } from '../interfaces/log-parser.port';
import { Kill } from '../../../domain/entities/kill.entity';
import { Match } from '../../../domain/entities/match.entity';
import {
  MATCH_REPOSITORY,
  type IMatchRepository,
} from '../../../domain/repositories/match-repository.interface';

@Injectable()
export class SaveLogUseCase {
  constructor(
    @Inject(LOG_PARSER) private readonly logParser: ILogParser,
    @Inject(MATCH_REPOSITORY) private readonly matchRepository: IMatchRepository,
  ) {}

  async execute(logContent: string): Promise<void> {
    const events = this.logParser.parseLog(logContent);

    let currentMatch: Match | null = null;

    for (const event of events) {
      if (event.type === 'match_started') {
        const matchId = BigInt(event.matchId);
        currentMatch = Match.start(matchId, event.timestamp);
        continue;
      }

      if (event.type === 'match_ended') {
        if (currentMatch !== null) {
          currentMatch.end(event.timestamp);
          await this.matchRepository.save(currentMatch);
        }
        currentMatch = null;
        continue;
      }

      if (event.type === 'kill' && currentMatch !== null) {
        const kill = new Kill({
          matchId: currentMatch.id,
          killerName: event.killer,
          victimName: event.victim,
          weaponName: event.weapon,
          killedAt: event.timestamp,
        });
        currentMatch.addKill(kill);
      }
    }

    if (currentMatch !== null) {
      await this.matchRepository.save(currentMatch);
    }
  }
}
