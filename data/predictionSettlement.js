/* Random outcome settlement for predictions */

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getRandomOutcome(market, matchId, seed) {
  const s = seed + matchId.charCodeAt(0) * 7 + Date.now() % 1000;
  if (market === '1X2') {
    const r = seededRandom(s);
    return r < 0.45 ? '1' : r < 0.75 ? 'X' : '2';
  }
  if (market === 'O/U') {
    return seededRandom(s + 1) > 0.5 ? 'Over' : 'Under';
  }
  if (market === 'BTTS') {
    return seededRandom(s + 2) > 0.5 ? 'Yes' : 'No';
  }
  if (market === 'CS') {
    const h = Math.floor(seededRandom(s + 3) * 4);
    const a = Math.floor(seededRandom(s + 4) * 4);
    return `${h}-${a}`;
  }
  return null;
}

const PICK_TO_OUTCOME = {win: '1', draw: 'x', lose: '2', over: 'over', under: 'under', yes: 'yes', no: 'no'};

export function settleSelection(market, pickLabel, matchId) {
  const outcome = getRandomOutcome(market, matchId, Date.now());
  const a = String(outcome || '').trim().toLowerCase();
  let b = String(pickLabel || '').trim().toLowerCase();
  if (market === '1X2' && PICK_TO_OUTCOME[b] !== undefined) b = PICK_TO_OUTCOME[b];
  const correct = a && b && a === b;
  return {outcome, correct};
}
