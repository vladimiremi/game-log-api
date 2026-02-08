import type {
  Kill as PrismaKill,
  Player as PrismaPlayer,
  Weapon as PrismaWeapon,
} from '@prisma/client';
import { Kill } from '../../../../domain/entities/kill.entity';

type PrismaKillWithRelations = PrismaKill & {
  killer: PrismaPlayer;
  victim: PrismaPlayer;
  weapon: PrismaWeapon;
};

export class KillMapper {
  static toDomain(model: PrismaKillWithRelations): Kill {
    return new Kill({
      matchId: model.matchId,
      killerName: model.killer.name,
      victimName: model.victim.name,
      weaponName: model.weapon.name,
      killedAt: model.killedAt,
    });
  }
}
