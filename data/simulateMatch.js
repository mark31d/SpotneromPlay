/* Match simulation based on team stats (attack, defense, form) */

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Simulate a match between two teams.
 * @param {Object} homeStats - {attack, defense, form, strength} (0-5 each for A/D/F, 0-100 strength)
 * @param {Object} awayStats - same
 * @param {number} seed - optional seed for reproducibility
 * @returns {{homeScore, awayScore, result, matchStats}} matchStats: shots, possession, etc.
 */
export function simulateMatch(homeStats, awayStats, seed = Date.now()) {
  const hStr = (homeStats?.strength ?? 50) / 100;
  const aStr = (awayStats?.strength ?? 50) / 100;
  const hA = ((homeStats?.attack ?? 0) + 1) * (0.8 + hStr * 0.4);
  const hD = ((homeStats?.defense ?? 0) + 1) * (0.8 + hStr * 0.4);
  const hF = ((homeStats?.form ?? 0) + 1) * (0.8 + hStr * 0.4);
  const aA = ((awayStats?.attack ?? 0) + 1) * (0.8 + aStr * 0.4);
  const aD = ((awayStats?.defense ?? 0) + 1) * (0.8 + aStr * 0.4);
  const aF = ((awayStats?.form ?? 0) + 1) * (0.8 + aStr * 0.4);

  const homePower = (hA * 1.2 + hD * 0.8 + hF) / 3;
  const awayPower = (aA * 1.2 + aD * 0.8 + aF) / 3;

  const totalPower = homePower + awayPower;
  const homeChance = totalPower > 0 ? homePower / totalPower : 0.5;

  const r1 = seededRandom(seed);
  const r2 = seededRandom(seed + 1);
  const r3 = seededRandom(seed + 2);
  const r4 = seededRandom(seed + 3);
  const r5 = seededRandom(seed + 4);

  const homeGoals = Math.floor(r1 * 4 * homeChance) + Math.floor(r2 * 2);
  const awayGoals = Math.floor(r2 * 4 * (1 - homeChance)) + Math.floor(r3 * 2);

  const homeScore = Math.min(5, Math.max(0, homeGoals));
  const awayScore = Math.min(5, Math.max(0, awayGoals));

  let result = 'draw';
  if (homeScore > awayScore) result = 'win';
  else if (homeScore < awayScore) result = 'loss';

  const homeShots = Math.floor(4 + r1 * 12 * homeChance);
  const awayShots = Math.floor(4 + r2 * 12 * (1 - homeChance));
  const homePoss = Math.round(40 + homeChance * 40 + (r4 - 0.5) * 10);
  const awayPoss = 100 - homePoss;
  const homeCorners = Math.floor(2 + r3 * 8 * homeChance);
  const awayCorners = Math.floor(2 + r4 * 8 * (1 - homeChance));
  const homeFouls = Math.floor(5 + r5 * 12 * (1 - homeChance));
  const awayFouls = Math.floor(5 + r1 * 12 * homeChance);
  const homeCards = Math.floor(r2 * 4);
  const awayCards = Math.floor(r3 * 4);

  const matchStats = {
    shotsOnTarget: {home: Math.min(homeShots, 15), away: Math.min(awayShots, 15)},
    possession: {home: homePoss, away: awayPoss},
    corners: {home: homeCorners, away: awayCorners},
    fouls: {home: homeFouls, away: awayFouls},
    shots: {home: homeShots + 2, away: awayShots + 2},
    cards: {home: homeCards, away: awayCards},
  };

  return {homeScore, awayScore, result, matchStats};
}

const OPPONENT_PREFIX = ['Atlas', 'Nova', 'Solar', 'Echo', 'Prism', 'Horizon', 'Ridge', 'Vortex', 'Zenith', 'Crescent', 'Monarch', 'Titan', 'Apex', 'Pulse', 'Storm'];
const OPPONENT_SUFFIX = ['City', 'United', 'Kings', 'Rovers', 'Town', 'AC', 'Valley', 'FC', 'SC', 'Athletic', 'Rangers', 'Dynamo'];

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function getOpponentStats(teamName) {
  const h = hash(teamName);
  const a = h % 6;
  const d = (h >> 2) % 6;
  const f = (h >> 4) % 6;
  const strength = Math.min(100, 30 + (a + d + f) * 8);
  return {
    attack: a,
    defense: d,
    form: f,
    strength,
    leadership: 1 + Math.floor((a + d) / 2),
  };
}

export function getOpponents(count = 12, excludeNames = [], seed = Date.now()) {
  const names = new Set();
  const list = [];
  let attempts = 0;
  while (list.length < count && attempts < 50) {
    attempts++;
    const pi = Math.floor(seededRandom(seed + attempts * 7) * OPPONENT_PREFIX.length);
    const si = Math.floor(seededRandom(seed + attempts * 11) * OPPONENT_SUFFIX.length);
    const name = OPPONENT_PREFIX[pi] + ' ' + OPPONENT_SUFFIX[si];
    if (!names.has(name) && !excludeNames.includes(name)) {
      names.add(name);
      list.push({name, ...getOpponentStats(name)});
    }
  }
  return list;
}

/**
 * Pick 2 random teams from user teams + opponents.
 * @returns {{team1: {name, attack, defense, form, isUser}, team2: {...}}}
 */
export function pickRandomMatch(userTeams, teamStats, getBaseTeamStats, getStrength, teamTraining = {}) {
  const opponents = getOpponents(20, userTeams);
  const pool = [
    ...userTeams.map(name => {
      const s = teamStats[name] || getBaseTeamStats(name);
      const t = teamTraining[name] || {};
      return {
        name,
        attack: s.attack ?? 0,
        defense: s.defense ?? 0,
        form: s.form ?? 0,
        strength: (typeof getStrength === 'function' ? getStrength(s, t) : null) ?? s.strength ?? 50,
        leadership: s.leadership ?? 1,
        isUser: true,
      };
    }),
    ...opponents.map(o => {
      const t = teamTraining[o.name] || {};
      const baseStats = {attack: o.attack, defense: o.defense, form: o.form};
      return {
        ...o,
        strength: (typeof getStrength === 'function' ? getStrength(baseStats, t) : null) ?? o.strength ?? 50,
        isUser: false,
      };
    }),
  ];
  if (pool.length < 2) return null;
  const i1 = Math.floor(Math.random() * pool.length);
  let i2 = Math.floor(Math.random() * pool.length);
  while (i2 === i1) i2 = Math.floor(Math.random() * pool.length);
  const t1 = pool[i1];
  const t2 = pool[i2];
  return {
    team1: t1,
    team2: t2,
  };
}
