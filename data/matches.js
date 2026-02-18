/* Random match generator */

const TEAM_PREFIX = ['Atlas', 'Nova', 'Solar', 'Echo', 'Prism', 'Horizon', 'Ridge', 'Vortex', 'Zenith', 'Crescent', 'Monarch', 'Titan', 'Apex', 'Pulse', 'Storm'];
const TEAM_SUFFIX = ['City', 'United', 'Kings', 'Rovers', 'Town', 'AC', 'Valley', 'FC', 'SC', 'Athletic', 'Rangers', 'Dynamo'];

const LEAGUES = ['Apex League', 'Nova Cup', 'Division One', 'Premier Cup', 'Elite League', 'Champions League'];

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function pick(arr, seed) {
  return arr[Math.floor(seededRandom(seed) * arr.length)];
}

function pickUnique(arr, count, seed) {
  const shuffled = [...arr].sort(() => seededRandom(seed++) - 0.5);
  return shuffled.slice(0, count);
}

/* Convert raw weights to percentages that sum to 100 */
function toPercents(...weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map(w => (w / total) * 100);
  const rounded = raw.map(v => Math.round(v));
  const diff = 100 - rounded.reduce((a, b) => a + b, 0);
  if (diff !== 0) rounded[0] += diff;
  return rounded;
}

export function generateMatch(id, seed = Date.now() + id) {
  const teams = [...new Set(TEAM_PREFIX.map((p, i) => p + ' ' + pick(TEAM_SUFFIX, seed + i * 7)))];
  const [homeName, awayName] = pickUnique(teams, 2, seed);
  const league = pick(LEAGUES, seed + 100);
  const isLive = seededRandom(seed + 200) > 0.4;
  const minute = isLive ? Math.floor(seededRandom(seed + 300) * 90) + 1 : null;
  const period = minute ? (minute <= 45 ? '1st Half' : '2nd Half') : null;
  const homeScore = isLive ? Math.floor(seededRandom(seed + 400) * 5) : 0;
  const awayScore = isLive ? Math.floor(seededRandom(seed + 500) * 5) : 0;
  const momentum = Math.floor(seededRandom(seed + 900) * 80) + 10;

  /* 1X2 probabilities */
  const w1 = 1.3 + seededRandom(seed + 600) * 2.5;
  const wX = 2.8 + seededRandom(seed + 700) * 1.5;
  const w2 = 2.0 + seededRandom(seed + 800) * 3.0;
  const [pct1, pctX, pct2] = toPercents(1 / w1, 1 / wX, 1 / w2);

  /* O/U probabilities */
  const wOver = 1.5 + seededRandom(seed + 1000) * 1.2;
  const wUnder = 1.6 + seededRandom(seed + 1100) * 1.3;
  const [pctOver, pctUnder] = toPercents(1 / wOver, 1 / wUnder);

  /* BTTS probabilities */
  const wYes = 1.4 + seededRandom(seed + 1200) * 1.5;
  const wNo = 1.9 + seededRandom(seed + 1300) * 0.8;
  const [pctYes, pctNo] = toPercents(1 / wYes, 1 / wNo);

  /* CS probabilities */
  const csRaw = [
    {l: `${homeScore}-${awayScore}`, w: 6 + seededRandom(seed + 1500) * 10},
    {l: `${homeScore + 1}-${awayScore}`, w: 7 + seededRandom(seed + 1600) * 8},
    {l: `${homeScore}-${awayScore + 1}`, w: 8 + seededRandom(seed + 1700) * 7},
  ];
  const csPcts = toPercents(...csRaw.map(c => 1 / c.w));

  const timeStr = isLive ? `Live ${minute}'` : (minute === null ? ['18:30', '20:00', 'Tomorrow'][Math.floor(seededRandom(seed + 1400) * 3)] : `${minute}'`);

  return {
    id: String(id),
    homeName,
    awayName,
    league,
    minute,
    period,
    homeScore,
    awayScore,
    pct1,
    pctX,
    pct2,
    momentum,
    crestHomeIndex: seed % 6,
    crestAwayIndex: (seed + 1) % 6,
    cH: seed % 6,
    cA: (seed + 2) % 6,
    time: timeStr,
    markets: {
      '1X2': {picks: [{l: 'Win', v: pct1}, {l: 'Draw', v: pctX}, {l: 'Lose', v: pct2}]},
      'O/U': {picks: [{l: 'Over', v: pctOver}, {l: 'Under', v: pctUnder}]},
      'BTTS': {picks: [{l: 'Yes', v: pctYes}, {l: 'No', v: pctNo}]},
      'CS': {
        picks: csRaw.map((c, i) => ({l: c.l, v: csPcts[i]})),
      },
    },
  };
}

export function generateMatches(count = 8, baseSeed = Date.now()) {
  return Array.from({length: count}, (_, i) => generateMatch(i + 1, baseSeed + i * 1000));
}

/** Generate match with user's team as home vs random opponent */
export function generateMatchWithHomeTeam(homeTeamName, seed = Date.now()) {
  const teams = [...new Set(TEAM_PREFIX.map((p, i) => p + ' ' + pick(TEAM_SUFFIX, seed + i * 7)))];
  const awayCandidates = teams.filter(t => t !== homeTeamName);
  const awayName = awayCandidates.length > 0 ? awayCandidates[Math.floor(seededRandom(seed + 999) * awayCandidates.length)] : teams[0];
  const s = seed + homeTeamName.length * 111;
  const league = pick(LEAGUES, s + 100);
  const isLive = seededRandom(s + 200) > 0.4;
  const minute = isLive ? Math.floor(seededRandom(s + 300) * 90) + 1 : null;
  const period = minute ? (minute <= 45 ? '1st Half' : '2nd Half') : null;
  const homeScore = isLive ? Math.floor(seededRandom(s + 400) * 5) : 0;
  const awayScore = isLive ? Math.floor(seededRandom(s + 500) * 5) : 0;
  const momentum = Math.floor(seededRandom(s + 900) * 80) + 10;
  const w1 = 1.3 + seededRandom(s + 600) * 2.5;
  const wX = 2.8 + seededRandom(s + 700) * 1.5;
  const w2 = 2.0 + seededRandom(s + 800) * 3.0;
  const [pct1, pctX, pct2] = toPercents(1 / w1, 1 / wX, 1 / w2);
  const wOver = 1.5 + seededRandom(s + 1000) * 1.2;
  const wUnder = 1.6 + seededRandom(s + 1100) * 1.3;
  const [pctOver, pctUnder] = toPercents(1 / wOver, 1 / wUnder);
  const wYes = 1.4 + seededRandom(s + 1200) * 1.5;
  const wNo = 1.9 + seededRandom(s + 1300) * 0.8;
  const [pctYes, pctNo] = toPercents(1 / wYes, 1 / wNo);
  const csRaw = [
    {l: `${homeScore}-${awayScore}`, w: 6 + seededRandom(s + 1500) * 10},
    {l: `${homeScore + 1}-${awayScore}`, w: 7 + seededRandom(s + 1600) * 8},
    {l: `${homeScore}-${awayScore + 1}`, w: 8 + seededRandom(s + 1700) * 7},
  ];
  const csPcts = toPercents(...csRaw.map(c => 1 / c.w));
  const timeStr = isLive ? `Live ${minute}'` : ['18:30', '20:00', 'Tomorrow'][Math.floor(seededRandom(s + 1400) * 3)];
  return {
    id: `my_${homeTeamName.replace(/\s/g, '_')}_${seed}`,
    homeName: homeTeamName,
    awayName,
    league,
    minute,
    period,
    homeScore,
    awayScore,
    pct1,
    pctX,
    pct2,
    momentum,
    crestHomeIndex: s % 6,
    crestAwayIndex: (s + 1) % 6,
    cH: s % 6,
    cA: (s + 2) % 6,
    time: timeStr,
    markets: {
      '1X2': {picks: [{l: 'Win', v: pct1}, {l: 'Draw', v: pctX}, {l: 'Lose', v: pct2}]},
      'O/U': {picks: [{l: 'Over', v: pctOver}, {l: 'Under', v: pctUnder}]},
      'BTTS': {picks: [{l: 'Yes', v: pctYes}, {l: 'No', v: pctNo}]},
      'CS': {picks: csRaw.map((c, i) => ({l: c.l, v: csPcts[i]}))},
    },
  };
}
