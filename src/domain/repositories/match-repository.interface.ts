import type { Match } from '../entities/match.entity';

export const MATCH_REPOSITORY = Symbol('MATCH_REPOSITORY');

export interface IMatchRepository {
  save(match: Match): Promise<void>;
  findById(id: bigint): Promise<Match | null>;
}
