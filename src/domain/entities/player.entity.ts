import { DomainError } from '../errors/domain.error';

export class Player {
  private readonly _name: string;

  constructor(name: string) {
    const trimmed = name?.trim();
    if (!trimmed) {
      throw new DomainError('Player name cannot be empty');
    }
    this._name = trimmed;
  }

  get name(): string {
    return this._name;
  }
}
