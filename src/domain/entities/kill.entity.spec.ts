import { DomainError } from '../errors/domain.error';
import { Kill } from './kill.entity';

describe('Kill', () => {
  const baseParams = {
    matchId: 1n,
    killerName: 'Roman',
    victimName: 'Nick',
    weaponName: 'M16',
    killedAt: new Date('2024-01-01T10:00:00.000Z'),
  };

  it('flags WORLD kills', () => {
    const kill = new Kill({ ...baseParams, killerName: '<WORLD>' });
    expect(kill.isWorldKill()).toBe(true);
  });

  it('compares kills by match, victim and time', () => {
    const a = new Kill(baseParams);
    const b = new Kill({ ...baseParams, killerName: 'Marcus' });
    expect(a.equals(b)).toBe(true);
  });

  it('throws when killer name is empty', () => {
    expect(
      () => new Kill({ ...baseParams, killerName: '   ' }),
    ).toThrow(DomainError);
  });
});
