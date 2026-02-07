import { Inject, Injectable } from '@nestjs/common';
import {
  LOG_REPOSITORY,
  type ILogRepository,
} from '../../parser/repository/log-repository.interface';
import type { RankingEntry } from '../interfaces/ranking.interface';

const WORLD_PLAYER_NAME = '<WORLD>';

@Injectable()
export class GetMatchRankingUseCase {
  constructor(
    @Inject(LOG_REPOSITORY) private readonly logRepository: ILogRepository,
  ) {}

  async execute(matchId: bigint): Promise<RankingEntry[]> {
    const kills = await this.logRepository.getKillsByMatchId(matchId);
    const fragsByPlayer = new Map<string, number>();

    for (const { killerName } of kills) {
      if (killerName === WORLD_PLAYER_NAME) continue;
      const current = fragsByPlayer.get(killerName) ?? 0;
      fragsByPlayer.set(killerName, current + 1);
    }

    return Array.from(fragsByPlayer.entries())
      .map(([playerName, frags]) => ({ playerName, frags }))
      .sort((a, b) => b.frags - a.frags);
  }
}
