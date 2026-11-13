import { DomainError } from '../errors/domain.error';
import { WeaponName } from './weapon-name.vo';

describe('WeaponName', () => {
  it('creates a trimmed weapon name', () => {
    const weaponName = WeaponName.create('  M16 ');
    expect(weaponName.value).toBe('M16');
  });

  it('throws when name is empty', () => {
    expect(() => WeaponName.create('')).toThrow(DomainError);
  });

  it('compares weapon names by value', () => {
    const a = WeaponName.create('M16');
    const b = WeaponName.create('M16');
    const c = WeaponName.create('AK47');
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
