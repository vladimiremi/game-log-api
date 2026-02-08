export const MATCH_REPOSITORY = Symbol('MATCH_REPOSITORY');

export interface CreateOrUpdateMatchPayload {
  id: bigint;
  startedAt: Date;
  endedAt?: Date;
}

export interface MatchRecord {
  id: bigint;
  startedAt: Date;
  endedAt?: Date | null;
}

export interface IMatchRepository {
  createOrUpdate(payload: CreateOrUpdateMatchPayload): Promise<void>;
  findById(id: bigint): Promise<MatchRecord | null>;
}
