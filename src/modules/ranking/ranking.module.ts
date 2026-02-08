import { Module } from '@nestjs/common';
import { RankingController } from './controller/ranking.controller';
import { GetMatchRankingUseCase } from './use-case/get-match-ranking.use-case';

@Module({
  controllers: [RankingController],
  providers: [GetMatchRankingUseCase],
  exports: [GetMatchRankingUseCase],
})
export class RankingModule {}
