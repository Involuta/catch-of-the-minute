"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_KEYS = exports.CREATURES = void 0;
exports.randomCreature = randomCreature;
exports.CREATURES = {
    lanternfish: {
        name: "Lanternfish",
        species: "Benthosema glaciale",
        basePower: 20,
        baseAggression: 0.05,
        prevalence: 0.95,
    },
    goliath_grouper: {
        name: "Goliath Grouper",
        species: "Epinephelus itajara",
        basePower: 700,
        baseAggression: 0.2,
        prevalence: 0.3,
    },
    dungeness_crab: {
        name: "Dungeness Crab",
        species: "Metacarcinus magister",
        basePower: 120,
        baseAggression: 0.08,
        prevalence: 0.7,
    },
    blue_crab: {
        name: "Blue Crab",
        species: "Callinectes sapidus",
        basePower: 90,
        baseAggression: 0.07,
        prevalence: 0.8,
    },
    great_white_shark: {
        name: "Great White Shark",
        species: "Carcharodon carcharias",
        basePower: 1000,
        baseAggression: 0.35,
        prevalence: 0.05,
    },
    giant_otter: {
        name: "Giant Otter",
        species: "Pteronura brasiliensis",
        basePower: 400,
        baseAggression: 0.15,
        prevalence: 0.15,
    },
    horrid_stonefish: {
        name: "Horrid Stonefish",
        species: "Synanceia horrida",
        basePower: 350,
        baseAggression: 0.25,
        prevalence: 0.45,
    },
    peacock_mantis_shrimp: {
        name: "Peacock Mantis Shrimp",
        species: "Odontodactylus scyllarus",
        basePower: 300,
        baseAggression: 0.3,
        prevalence: 0.5,
    },
    blobfish: {
        name: "Blobfish",
        species: "Psychrolutes microporos",
        basePower: 15,
        baseAggression: 0.02,
        prevalence: 0.05,
    },
    european_seabass: {
        name: "European Seabass",
        species: "Dicentrarchus labrax",
        basePower: 250,
        baseAggression: 0.18,
        prevalence: 0.5,
    },
    atlantic_salmon: {
        name: "Atlantic Salmon",
        species: "Salmo salar",
        basePower: 220,
        baseAggression: 0.1,
        prevalence: 0.6,
    },
    skipjack_tuna: {
        name: "Skipjack Tuna",
        species: "Katsuwonus pelamis",
        basePower: 500,
        baseAggression: 0.22,
        prevalence: 0.7,
    },
    pink_shrimp: {
        name: "Pink Shrimp",
        species: "Pandalus borealis",
        basePower: 30,
        baseAggression: 0.05,
        prevalence: 0.75,
    },
    atlantic_cod: {
        name: "Atlantic Cod",
        species: "Gadus morhua",
        basePower: 280,
        baseAggression: 0.12,
        prevalence: 0.45,
    },
    maine_lobster: {
        name: "Maine Lobster",
        species: "Homarus americanus",
        basePower: 200,
        baseAggression: 0.15,
        prevalence: 0.4,
    },
    sea_otter: {
        name: "Sea Otter",
        species: "Enhydra lutris",
        basePower: 350,
        baseAggression: 0.12,
        prevalence: 0.2,
    },
    stubby_squid: {
        name: "Stubby Squid",
        species: "Rossia pacifica",
        basePower: 40,
        baseAggression: 0.06,
        prevalence: 0.3,
    },
    crown_of_thorns: {
        name: "Crown of Thorns",
        species: "Acanthaster planci",
        basePower: 180,
        baseAggression: 0.25,
        prevalence: 0.6,
    },
};
exports.ALL_KEYS = Object.keys(exports.CREATURES);
function powerToTier(basePower) {
    if (basePower >= 900)
        return "S";
    if (basePower >= 600)
        return "A";
    if (basePower >= 300)
        return "B";
    if (basePower >= 150)
        return "C";
    if (basePower >= 50)
        return "D";
    return "F";
}
function prevalenceToTier(prevalence) {
    if (prevalence >= 0.7)
        return "Common";
    if (prevalence >= 0.4)
        return "Rare";
    if (prevalence >= 0.15)
        return "Epic";
    return "Legendary";
}
// Choose a random creature based on prevalence
function randomCreature() {
    const keys = Object.keys(exports.CREATURES);
    // Step 1: build a list of weights (prevalence values)
    const weights = keys.map((k) => exports.CREATURES[k].prevalence);
    // Step 2: sum all weights
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    // Step 3: pick a random number between 0 and totalWeight
    let r = Math.random() * totalWeight;
    // Step 4: walk through the list, subtracting weights until we land on the chosen one
    for (let i = 0; i < keys.length; i++) {
        r -= weights[i];
        if (r <= 0) {
            const k = keys[i];
            const c = exports.CREATURES[k];
            return { key: k, powerTier: powerToTier(c.basePower), prevalenceTier: prevalenceToTier(c.prevalence), ...exports.CREATURES[k] };
        }
    }
    // Fallback (should never hit if weights > 0)
    const k = keys[keys.length - 1];
    return { key: k, ...exports.CREATURES[k] };
}
