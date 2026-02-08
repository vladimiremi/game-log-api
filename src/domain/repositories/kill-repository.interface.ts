import { Kill } from '../entities/kill.entity';

export const KILL_REPOSITORY = Symbol('KILL_REPOSITORY');

export interface CreateKillPayload {
  matchId: bigint;
  killerId: number;
  victimId: number;
  weaponId: number;
  killedAt: Date;
}

export interface KillExistsParams {
  matchId: bigint;
  victimId: number;
  killedAt: Date;
}

export interface IKillRepository {
  create(payload: CreateKillPayload): Promise<void>;
  exists(params: KillExistsParams): Promise<boolean>;
  findByMatchId(matchId: bigint): Promise<Kill[]>;
  clear(): Promise<void>;
}
