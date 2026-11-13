import { DomainError } from '../errors/domain.error';
import { RankingEntry } from '../types/ranking-entry.interface';
import { PlayerName } from '../value-objects/player-name.vo';
import { Kill } from './kill.entity';

export class Match {
  static readonly MAX_PLAYERS_IN_RANKING = 20;

  private readonly _id: bigint;
  private readonly _startedAt: Date;
  private _endedAt: Date | null = null;
  private readonly _kills: Kill[] = [];

  private constructor(id: bigint, startedAt: Date) {
    this._id = id;
    this._startedAt = startedAt;
  }

  static start(id: bigint, startedAt: Date): Match {
    return new Match(id, startedAt);
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
    const deathsByPlayer = new Map<string, number>();
    const allPlayerNames = new Set<string>();

    for (const kill of this._kills) {
      if (!PlayerName.isWorld(kill.killerName)) {
        fragsByPlayer.set(
          kill.killerName,
          (fragsByPlayer.get(kill.killerName) ?? 0) + 1,
        );
        allPlayerNames.add(kill.killerName);
      }
      deathsByPlayer.set(
        kill.victimName,
        (deathsByPlayer.get(kill.victimName) ?? 0) + 1,
      );
      allPlayerNames.add(kill.victimName);
    }

    return Array.from(allPlayerNames)
      .filter((name) => !PlayerName.isWorld(name))
      .map((playerName) => ({
        playerName,
        frags: fragsByPlayer.get(playerName) ?? 0,
        deaths: deathsByPlayer.get(playerName) ?? 0,
      }))
      .sort((a, b) => b.frags - a.frags || a.deaths - b.deaths)
      .slice(0, Match.MAX_PLAYERS_IN_RANKING);
  }

  static withKills(matchId: bigint, kills: Kill[]): Match {
    const startedAt = kills.length > 0 ? kills[0].killedAt : new Date(0);
    return Match.reconstitute(matchId, startedAt, null, kills);
  }

  static reconstitute(
    id: bigint,
    startedAt: Date,
    endedAt: Date | null,
    kills: Kill[],
  ): Match {
    const match = Match.start(id, startedAt);
    if (endedAt) {
      match.end(endedAt);
    }
    for (const kill of kills) {
      match.addKill(kill);
    }
    return match;
  }
}
