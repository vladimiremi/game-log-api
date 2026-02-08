import { PlayerName } from '../value-objects/player-name.vo';
import { DomainError } from '../errors/domain.error';

interface KillParams {
  matchId: bigint;
  killerName: string;
  victimName: string;
  weaponName: string;
  killedAt: Date;
}

export class Kill {
  private readonly _matchId: bigint;
  private readonly _killerName: string;
  private readonly _victimName: string;
  private readonly _weaponName: string;
  private readonly _killedAt: Date;

  constructor(params: KillParams) {
    const killerName = params.killerName?.trim();
    const victimName = params.victimName?.trim();
    const weaponName = params.weaponName?.trim();

    if (!killerName) {
      throw new DomainError('Killer name cannot be empty');
    }
    if (!victimName) {
      throw new DomainError('Victim name cannot be empty');
    }
    if (!weaponName) {
      throw new DomainError('Weapon name cannot be empty');
    }

    this._matchId = params.matchId;
    this._killerName = killerName;
    this._victimName = victimName;
    this._weaponName = weaponName;
    this._killedAt = params.killedAt;
  }

  get matchId(): bigint {
    return this._matchId;
  }

  get killerName(): string {
    return this._killerName;
  }

  get victimName(): string {
    return this._victimName;
  }

  get weaponName(): string {
    return this._weaponName;
  }

  get killedAt(): Date {
    return this._killedAt;
  }

  isWorldKill(): boolean {
    return PlayerName.isWorld(this._killerName);
  }

  equals(other: Kill): boolean {
    return (
      this._matchId === other._matchId &&
      this._victimName === other._victimName &&
      this._killedAt.getTime() === other._killedAt.getTime()
    );
  }
}
