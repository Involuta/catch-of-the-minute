"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp = clamp;
exports.stealOutcomeWeights = stealOutcomeWeights;
exports.chooseIndexByWeights = chooseIndexByWeights;
exports.pAttack = pAttack;
exports.pDevour = pDevour;
function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function stealOutcomeWeights(thiefPower, thiefNumber) {
    const m = clamp(1 + (thiefPower / 100) * 0.8 + (thiefNumber / 1000000) * 0.6, 1, 1.6);
    // base weights order:
    // both, die+get, die+nothing, stolen+get, stolen+nothing
    let w = [1 * m, 2 * m, 85, 1 * m, 1 * m];
    const sum = w.reduce((a, b) => a + b, 0);
    return w.map(x => x / sum);
}
function chooseIndexByWeights(weights) {
    const r = Math.random();
    let acc = 0;
    for (let i = 0; i < weights.length; i++) {
        acc += weights[i];
        if (r <= acc)
            return i;
    }
    return weights.length - 1;
}
// p_attack per-second
function pAttack(baseAggression, currentNumber, maxNumber) {
    return baseAggression * (0.6 + 0.4 * (currentNumber / Math.max(1, maxNumber)));
}
// p_devour
function pDevour(cotmPower, victimPower, currentNumber, maxNumber, victimNumber) {
    // victimPower used implicitly via eligibility; feel free to mix in
    return clamp(0.2 + 0.5 * (currentNumber / Math.max(1, maxNumber)) + 0.3 * (1 - victimNumber / 1000000), 0.05, 0.95);
}
