import { Inject, Injectable } from '@nestjs/common';
import {
  MATCH_REPOSITORY,
  type IMatchRepository,
} from '../../../domain/repositories/match-repository.interface';
import type { RankingEntry } from '../../../domain/types/ranking-entry.interface';

@Injectable()
export class GetMatchRankingUseCase {
  constructor(
    @Inject(MATCH_REPOSITORY) private readonly matchRepository: IMatchRepository,
  ) {}

  async execute(matchId: bigint): Promise<RankingEntry[]> {
    const match = await this.matchRepository.findById(matchId);
    if (!match) return [];
    return match.getRanking();
  }
}
