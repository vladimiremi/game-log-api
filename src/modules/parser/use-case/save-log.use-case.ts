import { Inject, Injectable } from '@nestjs/common';
import { LOG_PARSER } from '../interfaces/log-parser.port';
import type { ILogParser } from '../interfaces/log-parser.port';
import { LOG_REPOSITORY } from '../repository/log-repository.interface';
import type { ILogRepository } from '../repository/log-repository.interface';

@Injectable()
export class SaveLogUseCase {
  constructor(
    @Inject(LOG_PARSER) private readonly logParser: ILogParser,
    @Inject(LOG_REPOSITORY) private readonly logRepository: ILogRepository,
  ) {}

  async execute(logContent: string): Promise<void> {
    const events = this.logParser.parseLog(logContent);

    let currentMatchId: bigint | null = null;
    let currentMatchStartedAt: Date | null = null;

    for (const event of events) {
      if (event.type === 'match_started') {
        currentMatchId = BigInt(event.matchId);
        currentMatchStartedAt = event.timestamp;
        await this.logRepository.createOrUpdateMatch({
          id: currentMatchId,
          startedAt: currentMatchStartedAt,
        });
        continue;
      }

      if (event.type === 'match_ended') {
        if (currentMatchId !== null && currentMatchStartedAt !== null) {
          await this.logRepository.createOrUpdateMatch({
            id: currentMatchId,
            startedAt: currentMatchStartedAt,
            endedAt: event.timestamp,
          });
        }
        currentMatchId = null;
        currentMatchStartedAt = null;
        continue;
      }

      if (event.type === 'kill') {
        if (currentMatchId === null) continue;

        const [killer, victim, weapon] = await Promise.all([
          this.logRepository.upsertPlayer(event.killer),
          this.logRepository.upsertPlayer(event.victim),
          this.logRepository.upsertWeapon(event.weapon),
        ]);

        const exists: boolean = await this.logRepository.killExists({
          matchId: currentMatchId,
          victimId: victim.id,
          killedAt: event.timestamp,
        });
        if (exists) continue;

        await this.logRepository.createKill({
          matchId: currentMatchId,
          killerId: killer.id,
          victimId: victim.id,
          weaponId: weapon.id,
          killedAt: event.timestamp,
        });
      }
    }
  }
}
