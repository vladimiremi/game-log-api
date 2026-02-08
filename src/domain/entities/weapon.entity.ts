import { DomainError } from '../errors/domain.error';

export class Weapon {
  private readonly _name: string;

  constructor(name: string) {
    const trimmed = name?.trim();
    if (!trimmed) {
      throw new DomainError('Weapon name cannot be empty');
    }
    this._name = trimmed;
  }

  get name(): string {
    return this._name;
  }
}
