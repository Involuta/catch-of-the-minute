export function clamp(n:number, a:number, b:number){ return Math.max(a, Math.min(b, n)); }

export function stealOutcomeWeights(thiefPower:number, thiefNumber:number) {
  const m = clamp(1 + (thiefPower/100)*0.8 + (thiefNumber/1_000_000)*0.6, 1, 1.6);
  // base weights order:
  // both, die+get, die+nothing, stolen+get, stolen+nothing
  let w = [1*m, 2*m, 85, 1*m, 1*m];
  const sum = w.reduce((a,b)=>a+b,0);
  return w.map(x=>x/sum);
}

export function chooseIndexByWeights(weights:number[]): number {
  const r = Math.random();
  let acc = 0;
  for (let i=0;i<weights.length;i++){
    acc += weights[i];
    if (r <= acc) return i;
  }
  return weights.length-1;
}

// p_attack per-second
export function pAttack(baseAggression:number, currentNumber:number, maxNumber:number){
  return baseAggression * (0.6 + 0.4 * (currentNumber/Math.max(1,maxNumber)));
}

// p_devour
export function pDevour(cotmPower:number, victimPower:number, currentNumber:number, maxNumber:number, victimNumber:number) {
  // victimPower used implicitly via eligibility; feel free to mix in
  return clamp(0.2 + 0.5*(currentNumber/Math.max(1,maxNumber)) + 0.3*(1 - victimNumber/1_000_000), 0.05, 0.95);
}
