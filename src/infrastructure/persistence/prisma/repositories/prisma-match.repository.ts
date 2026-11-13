import { Injectable } from '@nestjs/common';
import { Match } from '../../../../domain/entities/match.entity';
import { Kill } from '../../../../domain/entities/kill.entity';
import { PrismaService } from '../prisma.service';
import { KillMapper } from '../mappers/kill.mapper';
import type { IMatchRepository } from '../../../../domain/repositories/match-repository.interface';

@Injectable()
export class PrismaMatchRepository implements IMatchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(match: Match): Promise<void> {
    await this.prisma.match.upsert({
      where: { id: match.id },
      create: {
        id: match.id,
        startedAt: match.startedAt,
        endedAt: match.endedAt ?? undefined,
      },
      update: {
        ...(match.endedAt !== null && { endedAt: match.endedAt }),
      },
    });

    for (const kill of match.kills) {
      const [killer, victim, weapon] = await Promise.all([
        this.prisma.player.upsert({
          where: { name: kill.killerName },
          create: { name: kill.killerName },
          update: {},
        }),
        this.prisma.player.upsert({
          where: { name: kill.victimName },
          create: { name: kill.victimName },
          update: {},
        }),
        this.prisma.weapon.upsert({
          where: { name: kill.weaponName },
          create: { name: kill.weaponName },
          update: {},
        }),
      ]);

      const existing = await this.prisma.kill.findUnique({
        where: {
          matchId_victimId_killedAt: {
            matchId: kill.matchId,
            victimId: victim.id,
            killedAt: kill.killedAt,
          },
        },
      });
      if (existing) continue;

      await this.prisma.kill.create({
        data: {
          matchId: kill.matchId,
          killerId: killer.id,
          victimId: victim.id,
          weaponId: weapon.id,
          killedAt: kill.killedAt,
        },
      });
    }
  }

  async findById(id: bigint): Promise<Match | null> {
    const match = await this.prisma.match.findUnique({
      where: { id },
    });
    if (!match) return null;

    const kills = await this.prisma.kill.findMany({
      where: { matchId: id },
      include: { killer: true, victim: true, weapon: true },
    });
    const domainKills: Kill[] = kills.map((k) => KillMapper.toDomain(k));

    return Match.reconstitute(
      match.id,
      match.startedAt,
      match.endedAt,
      domainKills,
    );
  }
}
