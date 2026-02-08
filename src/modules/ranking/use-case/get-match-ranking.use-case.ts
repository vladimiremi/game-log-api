import { Inject, Injectable } from '@nestjs/common';
import { Match } from '../../../domain/entities/match.entity';
import {
  KILL_REPOSITORY,
  type IKillRepository,
} from '../../../domain/repositories/kill-repository.interface';
import type { RankingEntry } from '../../../domain/types/ranking-entry.interface';

@Injectable()
export class GetMatchRankingUseCase {
  constructor(
    @Inject(KILL_REPOSITORY) private readonly killRepository: IKillRepository,
  ) {}

  async execute(matchId: bigint): Promise<RankingEntry[]> {
    const kills = await this.killRepository.findByMatchId(matchId);
    const match = Match.withKills(matchId, kills);
    return match.getRanking();
  }
}
