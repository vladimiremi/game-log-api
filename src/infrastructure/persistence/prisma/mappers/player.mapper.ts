import type { Player as PrismaPlayer } from '@prisma/client';
import { Player } from '../../../../domain/entities/player.entity';

export class PlayerMapper {
  static toDomain(model: PrismaPlayer): Player {
    return new Player(model.name);
  }
}
