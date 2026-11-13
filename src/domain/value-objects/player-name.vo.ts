import { DomainError } from '../errors/domain.error';

export class PlayerName {
  private static readonly WORLD = '<WORLD>';
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(name: string): PlayerName {
    const trimmed = name?.trim();
    if (!trimmed) {
      throw new DomainError('Player name cannot be empty');
    }
    return new PlayerName(trimmed);
  }

  get value(): string {
    return this._value;
  }

  static isWorld(name: string): boolean {
    return name === PlayerName.WORLD;
  }

  equals(other: PlayerName): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
