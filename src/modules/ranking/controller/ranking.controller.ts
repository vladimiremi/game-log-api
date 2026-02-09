import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetMatchRankingUseCase } from '../use-case/get-match-ranking.use-case';
import { RankingDto } from '../dto/ranking.dto';

@ApiTags('ranking')
@Controller('api/matches')
export class RankingController {
  constructor(
    private readonly getMatchRankingUseCase: GetMatchRankingUseCase,
  ) {}

  @ApiResponse({ type: RankingDto })
  @Get(':matchId/ranking')
  async getRanking(@Param('matchId', ParseIntPipe) matchId: number) {
    const ranking = await this.getMatchRankingUseCase.execute(BigInt(matchId));
    return { ranking };
  }
}
