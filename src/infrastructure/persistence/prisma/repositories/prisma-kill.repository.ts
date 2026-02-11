import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Kill } from '../../../../domain/entities/kill.entity';
import { KillMapper } from '../mappers/kill.mapper';
import type {
  CreateKillPayload,
  IKillRepository,
  KillExistsParams,
} from '../../../../domain/repositories/kill-repository.interface';

@Injectable()
export class PrismaKillRepository implements IKillRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: CreateKillPayload): Promise<void> {
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

  async exists(params: KillExistsParams): Promise<boolean> {
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

  async findByMatchId(matchId: bigint): Promise<Kill[]> {
    const kills = await this.prisma.kill.findMany({
      where: { matchId },
      include: { killer: true, victim: true, weapon: true },
    });
    return kills.map((k) => KillMapper.toDomain(k));
  }
}
