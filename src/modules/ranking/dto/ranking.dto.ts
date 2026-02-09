import { ApiProperty } from "@nestjs/swagger";
import { RankingEntry } from "src/domain/types/ranking-entry.interface";


class RankingEntryDto implements RankingEntry {
    @ApiProperty({ description: 'Player name' })
    playerName: string;
  
    @ApiProperty({ description: 'Number of frags' })
    frags: number;
  
    @ApiProperty({ description: 'Number of deaths' })
    deaths: number;
  }

export class RankingDto {
    @ApiProperty({ description: 'Ranking entries', type: () => [RankingEntryDto] })
    ranking: RankingEntryDto[];
}