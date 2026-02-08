import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaKillRepository } from './repositories/prisma-kill.repository';
import { PrismaMatchRepository } from './repositories/prisma-match.repository';
import { PrismaPlayerRepository } from './repositories/prisma-player.repository';
import { PrismaWeaponRepository } from './repositories/prisma-weapon.repository';
import { KILL_REPOSITORY } from '../../../domain/repositories/kill-repository.interface';
import { MATCH_REPOSITORY } from '../../../domain/repositories/match-repository.interface';
import { PLAYER_REPOSITORY } from '../../../domain/repositories/player-repository.interface';
import { WEAPON_REPOSITORY } from '../../../domain/repositories/weapon-repository.interface';

@Global()
@Module({
  providers: [
    PrismaService,
    PrismaKillRepository,
    PrismaMatchRepository,
    PrismaPlayerRepository,
    PrismaWeaponRepository,
    {
      provide: KILL_REPOSITORY,
      useExisting: PrismaKillRepository,
    },
    {
      provide: MATCH_REPOSITORY,
      useExisting: PrismaMatchRepository,
    },
    {
      provide: PLAYER_REPOSITORY,
      useExisting: PrismaPlayerRepository,
    },
    {
      provide: WEAPON_REPOSITORY,
      useExisting: PrismaWeaponRepository,
    },
  ],
  exports: [
    PrismaService,
    KILL_REPOSITORY,
    MATCH_REPOSITORY,
    PLAYER_REPOSITORY,
    WEAPON_REPOSITORY,
  ],
})
export class PrismaModule {}
