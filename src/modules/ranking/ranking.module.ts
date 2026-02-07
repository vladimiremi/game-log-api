import { Module } from '@nestjs/common';
import { ParserModule } from '../parser/parser.module';
import { RankingController } from '../../controllers/ranking.controller';
import { GetMatchRankingUseCase } from './use-case/get-match-ranking.use-case';

@Module({
  imports: [ParserModule],
  controllers: [RankingController],
  providers: [GetMatchRankingUseCase],
  exports: [GetMatchRankingUseCase],
})
export class RankingModule {}
