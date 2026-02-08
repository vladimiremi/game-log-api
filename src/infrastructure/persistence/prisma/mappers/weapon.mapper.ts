import type { Weapon as PrismaWeapon } from '@prisma/client';
import { Weapon } from '../../../../domain/entities/weapon.entity';

export class WeaponMapper {
  static toDomain(model: PrismaWeapon): Weapon {
    return new Weapon(model.name);
  }
}
