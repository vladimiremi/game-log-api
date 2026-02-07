import { Module } from '@nestjs/common';
import { ParserController } from './controllers/parser.controller';
import { ParserModule } from './modules/parser/parser.module';
import { RankingModule } from './modules/ranking/ranking.module';
import { PrismaModule } from './persistense/prisma/prisma.module';

@Module({
  imports: [PrismaModule, ParserModule, RankingModule],
  controllers: [ParserController],
  providers: [],
})
export class AppModule {}
