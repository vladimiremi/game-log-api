import { DomainError } from '../errors/domain.error';

export class WeaponName {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(name: string): WeaponName {
    const trimmed = name?.trim();
    if (!trimmed) {
      throw new DomainError('Weapon name cannot be empty');
    }
    return new WeaponName(trimmed);
  }

  get value(): string {
    return this._value;
  }

  equals(other: WeaponName): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
