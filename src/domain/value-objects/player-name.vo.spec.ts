import { DomainError } from '../errors/domain.error';
import { PlayerName } from './player-name.vo';

describe('PlayerName', () => {
  it('creates a trimmed player name', () => {
    const playerName = PlayerName.create('  Roman ');
    expect(playerName.value).toBe('Roman');
  });

  it('throws when name is empty', () => {
    expect(() => PlayerName.create('')).toThrow(DomainError);
  });

  it('detects WORLD player', () => {
    expect(PlayerName.isWorld('<WORLD>')).toBe(true);
    expect(PlayerName.isWorld('Roman')).toBe(false);
  });
});
