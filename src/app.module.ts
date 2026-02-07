import { Module } from '@nestjs/common';
import { ParserController } from './controllers/parser.controller';
import { ParserModule } from './modules/parser/parser.module';
import { PrismaModule } from './persistense/prisma/prisma.module';

@Module({
  imports: [PrismaModule, ParserModule],
  controllers: [ParserController],
  providers: [],
})
export class AppModule {}
