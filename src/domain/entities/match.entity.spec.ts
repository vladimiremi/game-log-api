import { Match } from './match.entity';
import { Kill } from './kill.entity';

describe('Match', () => {
  it('builds ranking excluding WORLD kills', () => {
    const match = Match.start(1n, new Date('2024-01-01T10:00:00.000Z'));

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

  it('returns at most 20 players in ranking and excludes the 21st', () => {
    const match = Match.start(1n, new Date('2024-01-01T10:00:00.000Z'));
    const baseTime = new Date('2024-01-01T10:00:00.000Z').getTime();

    for (let i = 2; i <= 21; i++) {
      match.addKill(
        new Kill({
          matchId: 1n,
          killerName: 'Player1',
          victimName: `Player${i}`,
          weaponName: 'M16',
          killedAt: new Date(baseTime + i),
        }),
      );
    }

    const ranking = match.getRanking();

    expect(ranking).toHaveLength(20);
    expect(ranking.some((e) => e.playerName === 'Player21')).toBe(false);
    expect(ranking.some((e) => e.playerName === 'Player1')).toBe(true);
    expect(ranking.some((e) => e.playerName === 'Player20')).toBe(true);
  });

  it('does not add duplicate kills', () => {
    const match = Match.start(1n, new Date('2024-01-01T10:00:00.000Z'));
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
