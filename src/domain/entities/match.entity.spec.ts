import { Match } from './match.entity';
import { Kill } from './kill.entity';

describe('Match', () => {
  it('builds ranking excluding WORLD kills', () => {
    const match = new Match(1n, new Date('2024-01-01T10:00:00.000Z'));

    match.addKill(
      new Kill({
        matchId: 1n,
        killerName: 'Roman',
        victimName: 'Nick',
        weaponName: 'M16',
        killedAt: new Date('2024-01-01T10:01:00.000Z'),
      }),
    );
    match.addKill(
      new Kill({
        matchId: 1n,
        killerName: '<WORLD>',
        victimName: 'Nick',
        weaponName: 'FALLING',
        killedAt: new Date('2024-01-01T10:02:00.000Z'),
      }),
    );
    match.addKill(
      new Kill({
        matchId: 1n,
        killerName: 'Roman',
        victimName: 'Marcus',
        weaponName: 'M16',
        killedAt: new Date('2024-01-01T10:03:00.000Z'),
      }),
    );

    expect(match.getRanking()).toEqual([
      { playerName: 'Roman', frags: 2, deaths: 0 },
      { playerName: 'Marcus', frags: 0, deaths: 1 },
      { playerName: 'Nick', frags: 0, deaths: 2 },
    ]);
  });

  it('does not add duplicate kills', () => {
    const match = new Match(1n, new Date('2024-01-01T10:00:00.000Z'));
    const kill = new Kill({
      matchId: 1n,
      killerName: 'Roman',
      victimName: 'Nick',
      weaponName: 'M16',
      killedAt: new Date('2024-01-01T10:01:00.000Z'),
    });

    match.addKill(kill);
    match.addKill(kill);

    expect(match.kills).toHaveLength(1);
  });
});
