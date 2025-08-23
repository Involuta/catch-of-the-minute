export type CreatureKey = "lanternfish"|"goliath_grouper"|"dungeness_crab"|"blue_crab"|"great_white_shark"|"giant_otter";

export interface InventoryItem {
  id: string;
  creatureKey: CreatureKey;
  name: string;
  power: number;
  number: number;
  caughtAt: any;
  alive: boolean;
}
