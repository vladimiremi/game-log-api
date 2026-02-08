import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type {
  CreateOrUpdateMatchPayload,
  IMatchRepository,
  MatchRecord,
} from '../../../../domain/repositories/match-repository.interface';

@Injectable()
export class PrismaMatchRepository implements IMatchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createOrUpdate(payload: CreateOrUpdateMatchPayload): Promise<void> {
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

  async findById(id: bigint): Promise<MatchRecord | null> {
    const match = await this.prisma.match.findUnique({
      where: { id },
    });
    if (!match) return null;
    return {
      id: match.id,
      startedAt: match.startedAt,
      endedAt: match.endedAt,
    };
  }
}
