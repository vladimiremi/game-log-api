export const WEAPON_REPOSITORY = Symbol('WEAPON_REPOSITORY');

export interface WeaponRecord {
  id: number;
  name: string;
}

export interface IWeaponRepository {
  upsert(name: string): Promise<WeaponRecord>;
}
