export const LOG_REPOSITORY = Symbol('LOG_REPOSITORY');

export interface CreateOrUpdateMatchPayload {
  id: bigint;
  startedAt: Date;
  endedAt?: Date;
}

export interface CreateKillPayload {
  matchId: bigint;
  killerId: number;
  victimId: number;
  weaponId: number;
  killedAt: Date;
}

export interface KillByMatchItem {
  killerId: number;
  killerName: string;
}

export interface ILogRepository {
  upsertPlayer(name: string): Promise<{ id: number }>;
  upsertWeapon(name: string): Promise<{ id: number }>;
  createOrUpdateMatch(payload: CreateOrUpdateMatchPayload): Promise<void>;
  killExists(params: {
    matchId: bigint;
    victimId: number;
    killedAt: Date;
  }): Promise<boolean>;
  createKill(payload: CreateKillPayload): Promise<void>;
  getKillsByMatchId(matchId: bigint): Promise<KillByMatchItem[]>;
  clear(): Promise<void>;
}
