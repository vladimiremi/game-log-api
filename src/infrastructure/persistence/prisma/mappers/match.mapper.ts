import type { Match as PrismaMatch } from '@prisma/client';
import { Match } from '../../../../domain/entities/match.entity';

export class MatchMapper {
  static toDomain(model: PrismaMatch): Match {
    const match = new Match(model.id, model.startedAt);
    if (model.endedAt) {
      match.end(model.endedAt);
    }
    return match;
  }
}
