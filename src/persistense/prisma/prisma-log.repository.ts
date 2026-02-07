import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import type {
  CreateKillPayload,
  CreateOrUpdateMatchPayload,
  ILogRepository,
} from '../../modules/parser/interfaces/log-repository.port';

@Injectable()
export class PrismaLogRepository implements ILogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertPlayer(name: string): Promise<{ id: number }> {
    const player = await this.prisma.player.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    return { id: player.id };
  }

  async upsertWeapon(name: string): Promise<{ id: number }> {
    const weapon = await this.prisma.weapon.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    return { id: weapon.id };
  }

  async createOrUpdateMatch(
    payload: CreateOrUpdateMatchPayload,
  ): Promise<void> {
    await this.prisma.match.upsert({
      where: { id: payload.id },
      create: {
        id: payload.id,
        startedAt: payload.startedAt,
        endedAt: payload.endedAt,
      },
      update: {
        ...(payload.endedAt !== undefined && { endedAt: payload.endedAt }),
      },
    });
  }

  async killExists(params: {
    matchId: bigint;
    victimId: number;
    killedAt: Date;
  }): Promise<boolean> {
    const result = await this.prisma.kill.findUnique({
      where: {
        matchId_victimId_killedAt: {
          matchId: params.matchId,
          victimId: params.victimId,
          killedAt: params.killedAt,
        },
      },
    });
    return result !== null;
  }

  async createKill(payload: CreateKillPayload): Promise<void> {
    await this.prisma.kill.create({
      data: {
        matchId: payload.matchId,
        killerId: payload.killerId,
        victimId: payload.victimId,
        weaponId: payload.weaponId,
        killedAt: payload.killedAt,
      },
    });
  }

  async clear(): Promise<void> {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('This method can only be used in test environment');
    }
    await this.prisma.kill.deleteMany();
    await this.prisma.match.deleteMany();
    await this.prisma.player.deleteMany();
    await this.prisma.weapon.deleteMany();
  }
}
