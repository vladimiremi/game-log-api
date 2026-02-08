import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type {
  IPlayerRepository,
  PlayerRecord,
} from '../../../../domain/repositories/player-repository.interface';

@Injectable()
export class PrismaPlayerRepository implements IPlayerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(name: string): Promise<PlayerRecord> {
    const player = await this.prisma.player.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    return { id: player.id, name: player.name };
  }

  async findByName(name: string): Promise<PlayerRecord | null> {
    const player = await this.prisma.player.findUnique({
      where: { name },
    });
    if (!player) return null;
    return { id: player.id, name: player.name };
  }
}
