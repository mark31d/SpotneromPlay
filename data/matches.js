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

export function generateMatch(id, seed = Date.now() + id) {
  const teams = [...new Set(TEAM_PREFIX.map((p, i) => p + ' ' + pick(TEAM_SUFFIX, seed + i * 7)))];
  const [homeName, awayName] = pickUnique(teams, 2, seed);
  const league = pick(LEAGUES, seed + 100);
  const isLive = seededRandom(seed + 200) > 0.4;
  const minute = isLive ? Math.floor(seededRandom(seed + 300) * 90) + 1 : null;
  const period = minute ? (minute <= 45 ? '1st Half' : '2nd Half') : null;
  const homeScore = isLive ? Math.floor(seededRandom(seed + 400) * 5) : 0;
  const awayScore = isLive ? Math.floor(seededRandom(seed + 500) * 5) : 0;
  const totalGoals = homeScore + awayScore;

  const odds1 = +(1.3 + seededRandom(seed + 600) * 2.5).toFixed(2);
  const oddsX = +(2.8 + seededRandom(seed + 700) * 1.5).toFixed(2);
  const odds2 = +(2.0 + seededRandom(seed + 800) * 3.0).toFixed(2);
  const momentum = Math.floor(seededRandom(seed + 900) * 80) + 10;

  const overOdds = +(1.5 + seededRandom(seed + 1000) * 1.2).toFixed(2);
  const underOdds = +(1.6 + seededRandom(seed + 1100) * 1.3).toFixed(2);
  const bttsYes = +(1.4 + seededRandom(seed + 1200) * 1.5).toFixed(2);
  const bttsNo = +(1.9 + seededRandom(seed + 1300) * 0.8).toFixed(2);

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
    odds1,
    oddsX,
    odds2,
    momentum,
    crestHomeIndex: seed % 6,
    crestAwayIndex: (seed + 1) % 6,
    cH: seed % 6,
    cA: (seed + 2) % 6,
    time: timeStr,
    odds: {
      '1X2': {picks: [{l: '1', v: odds1}, {l: 'X', v: oddsX}, {l: '2', v: odds2}]},
      'O/U': {picks: [{l: 'Over', v: overOdds}, {l: 'Under', v: underOdds}]},
      'BTTS': {picks: [{l: 'Yes', v: bttsYes}, {l: 'No', v: bttsNo}]},
      'CS': {
        picks: [
          {l: `${homeScore}-${awayScore}`, v: 6 + seededRandom(seed + 1500) * 10},
          {l: `${homeScore + 1}-${awayScore}`, v: 7 + seededRandom(seed + 1600) * 8},
          {l: `${homeScore}-${awayScore + 1}`, v: 8 + seededRandom(seed + 1700) * 7},
        ].map(p => ({...p, v: +(p.v).toFixed(2)})),
      },
    },
  };
}

export function generateMatches(count = 8, baseSeed = Date.now()) {
  return Array.from({length: count}, (_, i) => generateMatch(i + 1, baseSeed + i * 1000));
}
