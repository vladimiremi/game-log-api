import { Inject, Injectable } from '@nestjs/common';
import { LOG_PARSER } from '../interfaces/log-parser.port';
import type { ILogParser } from '../interfaces/log-parser.port';
import { Kill } from '../../../domain/entities/kill.entity';
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

@Injectable()
export class SaveLogUseCase {
  constructor(
    @Inject(LOG_PARSER) private readonly logParser: ILogParser,
    @Inject(MATCH_REPOSITORY) private readonly matchRepository: IMatchRepository,
    @Inject(PLAYER_REPOSITORY)
    private readonly playerRepository: IPlayerRepository,
    @Inject(WEAPON_REPOSITORY)
    private readonly weaponRepository: IWeaponRepository,
    @Inject(KILL_REPOSITORY) private readonly killRepository: IKillRepository,
  ) {}

  async execute(logContent: string): Promise<void> {
    const events = this.logParser.parseLog(logContent);

    let currentMatchId: bigint | null = null;
    let currentMatchStartedAt: Date | null = null;

    for (const event of events) {
      if (event.type === 'match_started') {
        currentMatchId = BigInt(event.matchId);
        currentMatchStartedAt = event.timestamp;
        await this.matchRepository.createOrUpdate({
          id: currentMatchId,
          startedAt: currentMatchStartedAt,
        });
        continue;
      }

      if (event.type === 'match_ended') {
        if (currentMatchId !== null && currentMatchStartedAt !== null) {
          await this.matchRepository.createOrUpdate({
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
          this.playerRepository.upsert(event.killer),
          this.playerRepository.upsert(event.victim),
          this.weaponRepository.upsert(event.weapon),
        ]);

        const kill = new Kill({
          matchId: currentMatchId,
          killerName: event.killer,
          victimName: event.victim,
          weaponName: event.weapon,
          killedAt: event.timestamp,
        });

        const exists: boolean = await this.killRepository.exists({
          matchId: currentMatchId,
          victimId: victim.id,
          killedAt: event.timestamp,
        });
        if (exists) continue;

        await this.killRepository.create({
          matchId: currentMatchId,
          killerId: killer.id,
          victimId: victim.id,
          weaponId: weapon.id,
          killedAt: kill.killedAt,
        });
      }
    }
  }
}
