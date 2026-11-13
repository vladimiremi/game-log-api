import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaMatchRepository } from './repositories/prisma-match.repository';
import { MATCH_REPOSITORY } from '../../../domain/repositories/match-repository.interface';

@Global()
@Module({
  providers: [
    PrismaService,
    PrismaMatchRepository,
    {
      provide: MATCH_REPOSITORY,
      useExisting: PrismaMatchRepository,
    },
  ],
  exports: [PrismaService, MATCH_REPOSITORY],
})
export class PrismaModule {}
