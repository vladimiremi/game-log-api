import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type {
  IWeaponRepository,
  WeaponRecord,
} from '../../../../domain/repositories/weapon-repository.interface';

@Injectable()
export class PrismaWeaponRepository implements IWeaponRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(name: string): Promise<WeaponRecord> {
    const weapon = await this.prisma.weapon.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    return { id: weapon.id, name: weapon.name };
  }
}
