import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { GetMatchRankingUseCase } from '../use-case/get-match-ranking.use-case';

@ApiTags('ranking')
@Controller('api/matches')
export class RankingController {
  constructor(
    private readonly getMatchRankingUseCase: GetMatchRankingUseCase,
  ) {}

  @Get(':matchId/ranking')
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  async getRanking(@Param('matchId', ParseIntPipe) matchId: number) {
    const ranking = await this.getMatchRankingUseCase.execute(BigInt(matchId));
    return { ranking };
  }
}
