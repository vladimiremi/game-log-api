import { PlayerName } from '../value-objects/player-name.vo';
import { WeaponName } from '../value-objects/weapon-name.vo';

interface KillParams {
  matchId: bigint;
  killerName: string;
  victimName: string;
  weaponName: string;
  killedAt: Date;
}

export class Kill {
  private readonly _matchId: bigint;
  private readonly _killerName: PlayerName;
  private readonly _victimName: PlayerName;
  private readonly _weaponName: WeaponName;
  private readonly _killedAt: Date;

  constructor(params: KillParams) {
    this._matchId = params.matchId;
    this._killerName = PlayerName.create(params.killerName);
    this._victimName = PlayerName.create(params.victimName);
    this._weaponName = WeaponName.create(params.weaponName);
    this._killedAt = params.killedAt;
  }

  get matchId(): bigint {
    return this._matchId;
  }

  get killerName(): string {
    return this._killerName.value;
  }

  get victimName(): string {
    return this._victimName.value;
  }

  get weaponName(): string {
    return this._weaponName.value;
  }

  get killedAt(): Date {
    return this._killedAt;
  }

  isWorldKill(): boolean {
    return PlayerName.isWorld(this._killerName.value);
  }

  equals(other: Kill): boolean {
    return (
      this._matchId === other._matchId &&
      this._victimName.equals(other._victimName) &&
      this._killedAt.getTime() === other._killedAt.getTime()
    );
  }
}
