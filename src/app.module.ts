import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { ParserModule } from './modules/parser/parser.module';
import { RankingModule } from './modules/ranking/ranking.module';

@Module({
  imports: [PrismaModule, ParserModule, RankingModule],
})
export class AppModule {}
