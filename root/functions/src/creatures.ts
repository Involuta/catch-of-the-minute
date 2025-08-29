export type CreatureKey = "lanternfish"|"goliath_grouper"|"dungeness_crab"|"blue_crab"|"great_white_shark"|"giant_otter";

export const CREATURES: Record<CreatureKey, {name:string;basePower:number;baseAggression:number}> = {
  lanternfish:       { name:"Lanternfish",       basePower:10,  baseAggression:0.05 },
  goliath_grouper:   { name:"Goliath Grouper",   basePower:60,  baseAggression:0.20 },
  dungeness_crab:    { name:"Dungeness Crab",    basePower:25,  baseAggression:0.08 },
  blue_crab:         { name:"Blue Crab",         basePower:18,  baseAggression:0.07 },
  great_white_shark: { name:"Great White Shark", basePower:100, baseAggression:0.35 },
  giant_otter:       { name:"Giant Otter",       basePower:40,  baseAggression:0.15 }
};

export const ALL_KEYS = Object.keys(CREATURES) as CreatureKey[];

export function randomCreature() {
  const keys = ALL_KEYS;
  const k = keys[Math.floor(Math.random()*keys.length)];
  return { key: k, ...CREATURES[k] };
}