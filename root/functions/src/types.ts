import { Timestamp } from "firebase-admin/firestore";
import { CreatureKey } from "./creatures";

export interface CotmDoc {
  minuteStart: Timestamp;
  minuteEnd: Timestamp;
  species: { key: CreatureKey; name: string; baseAggression:number; basePower:number; };
  currentNumber: number;
  maxNumber: number;
  attacksEnabledWindow: { startOffsetSec:number; endOffsetSec:number; };
}
