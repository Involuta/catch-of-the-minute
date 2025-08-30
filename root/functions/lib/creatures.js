"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_KEYS = exports.CREATURES = void 0;
exports.randomCreature = randomCreature;
exports.CREATURES = {
    lanternfish: { name: "Lanternfish", species: "Benthosema glaciale", basePower: 10, baseAggression: 0.05 },
    goliath_grouper: { name: "Goliath Grouper", species: "Epinephelus itajara", basePower: 60, baseAggression: 0.20 },
    dungeness_crab: { name: "Dungeness Crab", species: "Metacarcinus magister", basePower: 25, baseAggression: 0.08 },
    blue_crab: { name: "Blue Crab", species: "Callinectes sapidus", basePower: 18, baseAggression: 0.07 },
    great_white_shark: { name: "Great White Shark", species: "Carcharodon carcharias", basePower: 100, baseAggression: 0.35 },
    giant_otter: { name: "Giant Otter", species: "Pteronura brasiliensis", basePower: 40, baseAggression: 0.15 }
};
exports.ALL_KEYS = Object.keys(exports.CREATURES);
function randomCreature() {
    const keys = exports.ALL_KEYS;
    const k = keys[Math.floor(Math.random() * keys.length)];
    return { key: k, ...exports.CREATURES[k] };
}
