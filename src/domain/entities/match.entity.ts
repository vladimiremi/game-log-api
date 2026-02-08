import { DomainError } from '../errors/domain.error';
import { RankingEntry } from '../types/ranking-entry.interface';
import { Kill } from './kill.entity';

export class Match {
  private readonly _id: bigint;
  private readonly _startedAt: Date;
  private _endedAt: Date | null = null;
  private readonly _kills: Kill[] = [];

  constructor(id: bigint, startedAt: Date) {
    this._id = id;
    this._startedAt = startedAt;
  }

  get id(): bigint {
    return this._id;
  }

  get startedAt(): Date {
    return this._startedAt;
  }

  get endedAt(): Date | null {
    return this._endedAt;
  }

  get kills(): ReadonlyArray<Kill> {
    return [...this._kills];
  }

  end(timestamp: Date): void {
    if (this._endedAt) {
      throw new DomainError('Match already ended');
    }
    this._endedAt = timestamp;
  }

  addKill(kill: Kill): void {
    const duplicate = this._kills.some((existing) => existing.equals(kill));
    if (duplicate) return;
    this._kills.push(kill);
  }

  isFinished(): boolean {
    return this._endedAt !== null;
  }

  getRanking(): RankingEntry[] {
    const fragsByPlayer = new Map<string, number>();
    for (const kill of this._kills) {
      if (kill.isWorldKill()) continue;
      const name = kill.killerName;
      fragsByPlayer.set(name, (fragsByPlayer.get(name) ?? 0) + 1);
    }

    return Array.from(fragsByPlayer.entries())
      .map(([playerName, frags]) => ({ playerName, frags }))
      .sort((a, b) => b.frags - a.frags);
  }

  static withKills(matchId: bigint, kills: Kill[]): Match {
    const startedAt = kills.length > 0 ? kills[0].killedAt : new Date(0);
    const match = new Match(matchId, startedAt);
    for (const kill of kills) {
      match.addKill(kill);
    }
    return match;
  }
}
