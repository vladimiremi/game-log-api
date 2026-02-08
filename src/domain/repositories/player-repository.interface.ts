export const PLAYER_REPOSITORY = Symbol('PLAYER_REPOSITORY');

export interface PlayerRecord {
  id: number;
  name: string;
}

export interface IPlayerRepository {
  upsert(name: string): Promise<PlayerRecord>;
  findByName(name: string): Promise<PlayerRecord | null>;
}
