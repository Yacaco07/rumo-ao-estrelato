import { averageRating, type AthleteDraft } from "@/domain/athlete/athlete";
import { getPosition } from "@/domain/athlete/positions";
import { defaultTrainingFocus, developedAttributes, gainPractice, TRAINING_EFFECT, trainingPotential } from "./training";
import type { ContractOffer } from "./contract";
import { buildCalendar, FIRST_SEASON_YEAR, roundDate, type Fixture } from "./calendar";
import { SEASON_ROUNDS, seasonActionSchema, seasonSchema, type Season, type SeasonAction, type SeasonClub, type Training } from "./season-schema";

export type SeasonCatalog = { worldVersion: string; clubs: SeasonClub[] };
export type SeasonProfile = {
  createdAt: string;
  athlete: AthleteDraft;
  contract: ContractOffer;
};

type Match = Fixture & { homeGoals: number; awayGoals: number };
type Preparation = { fatigue: number; xp: number };
type Appearance = { minutes: number; goals: number; assists: number; saves: number; cleanSheet: boolean; rating: number | null };

export { buildCalendar } from "./calendar";

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index++) {
    result = Math.imul(result ^ value.charCodeAt(index), 16777619);
  }
  return result >>> 0;
}

function randomSource(seed: number) {
  let state = seed;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export function createSeason(profile: SeasonProfile, catalog: SeasonCatalog, year = FIRST_SEASON_YEAR): Season | null {
  const result = seasonSchema.safeParse({
    rulesVersion: 1,
    year,
    ...catalog,
    seed: hash(JSON.stringify([
      profile.createdAt, profile.athlete.name, profile.contract.clubId,
      catalog.worldVersion, ...(year === FIRST_SEASON_YEAR ? [] : [year]),
    ])),
    player: {
      clubId: profile.contract.clubId,
      role: profile.contract.role,
      position: profile.athlete.position,
      initialOverall: averageRating(profile.athlete),
    },
    rounds: [],
    preparation: null,
  });
  return result.success ? result.data : null;
}

export function applySeasonAction(season: Season, input: SeasonAction): { ok: true; season: Season } | { ok: false; message: string } {
  const action = seasonActionSchema.safeParse(input);
  if (!action.success || action.data.type === "advance") return { ok: false, message: "Escolha uma ação válida." };
  if (season.rounds.length === SEASON_ROUNDS) return { ok: false, message: "A temporada já terminou." };
  if (action.data.type === "play") {
    const { selectedFocus, ...previous } = season;
    const withFocus = season.focuses || selectedFocus;
    const focuses = withFocus ? [
      ...(season.focuses ?? season.rounds.map(() => null)), selectedFocus ?? null,
    ] : undefined;
    return { ok: true, season: { ...previous, rounds: [...season.rounds, season.preparation], preparation: null, ...(focuses ? { focuses } : {}) } };
  }
  if (season.preparation !== null) return { ok: false, message: "A preparação desta rodada já foi registrada." };
  const { training, focus } = action.data;
  if (focus && (training === "recovery" || !getPosition(season.player.position).attributes.includes(focus))) {
    return { ok: false, message: "Escolha um atributo da sua posição para este treino." };
  }
  return { ok: true, season: { ...season, preparation: training, ...(focus ? { selectedFocus: focus } : {}) } };
}

function prepare(current: Preparation, training: Training | null): Preparation {
  const change = training ? TRAINING_EFFECT[training] : { fatigue: -12, xp: 0 };
  return { fatigue: Math.max(0, Math.min(100, current.fatigue + change.fatigue)), xp: current.xp + change.xp };
}

function playerOverall(initialOverall: number, xp: number) {
  return Math.min(99, initialOverall + Math.min(12, Math.floor(xp / 65)));
}

function simulateMatch(fixture: Fixture, player: Season["player"], prepared: Preparation, roundIndex: number, seed: number) {
  const random = randomSource(hash(`${seed}:${roundIndex}:${fixture.home.id}:${fixture.away.id}`));
  const { clubId, role, position, initialOverall } = player;
  const isKeeper = position === "GK";
  const managesHome = fixture.home.id === clubId;
  const managesAway = fixture.away.id === clubId;
  const hasAthlete = managesHome || managesAway;
  const overall = playerOverall(initialOverall, prepared.xp);
  const starter = roundIndex === 0 || role === "rotation" || overall >= 60 || prepared.fatigue < 45 && roundIndex % 3 === 0;
  const minutes = !hasAthlete ? 0 : isKeeper ? starter ? 90 : 0
    : Math.max(15, Math.min(90, (starter ? 81 : 46) + Math.floor(random() * 12) - Math.floor(prepared.fatigue / 3)));
  let goals = 0;
  let assists = 0;
  let saves = 0;

  function score(club: SeasonClub, atHome: boolean) {
    const withAthlete = club.id === clubId;
    const againstKeeper = hasAthlete && isKeeper && !withAthlete && minutes > 0;
    const teamShape = ((hash(`${seed}:${club.id}`) % 13) - 6) * 0.005;
    const chance = 0.225 + teamShape + (atHome ? 0.035 : 0);
    const athleteImpact = (overall - prepared.fatigue / 4) / 1800;
    const shots = 4 + Math.floor(random() * 6);
    let scored = 0;
    for (let index = 0; index < shots; index++) {
      const minute = 1 + Math.floor(random() * 90);
      const onPitch = starter ? minute <= minutes : minute > 90 - minutes;
      const attackBonus = withAthlete && !isKeeper && onPitch ? athleteImpact : 0;
      const keeperBonus = againstKeeper ? athleteImpact : 0;
      const outcome = random();
      if (outcome < chance + attackBonus - keeperBonus) {
        scored++;
        if (withAthlete && !isKeeper && onPitch) {
          const share = position === "ST" || position === "WG" ? 0.32 : 0.13;
          const involvement = random();
          if (involvement < share) goals++;
          else if (involvement < share + 0.20) assists++;
        }
      } else if (againstKeeper && outcome < 0.65) {
        saves++;
      }
    }
    return scored;
  }

  const match: Match = { ...fixture, homeGoals: score(fixture.home, true), awayGoals: score(fixture.away, false) };
  const conceded = managesHome ? match.awayGoals : match.homeGoals;
  const cleanSheet = isKeeper && minutes === 90 && conceded === 0;
  const impact = isKeeper ? saves * 0.22 + Number(cleanSheet) * 0.6 - conceded * 0.32 : goals * 0.8 + assists * 0.55;
  const rating = minutes === 0 ? null : Math.round(Math.min(10, Math.max(3, 6 + impact - prepared.fatigue / 150 + random() * 0.8)) * 10) / 10;
  const appearance: Appearance = { minutes, goals, assists, saves, cleanSheet, rating };
  return { match, appearance };
}

function newTable(clubs: SeasonClub[]) {
  return new Map(clubs.map((club) => [club.id, { club, played: 0, wins: 0, draws: 0, losses: 0, scored: 0, conceded: 0, points: 0 }]));
}

function recordResult(table: ReturnType<typeof newTable>, club: SeasonClub, goals: number, against: number) {
  const row = table.get(club.id)!;
  row.played++;
  row.scored += goals;
  row.conceded += against;
  if (goals > against) { row.wins++; row.points += 3; }
  else if (goals === against) { row.draws++; row.points++; }
  else row.losses++;
}

export function readSeason(season: Season) {
  const { player, trainingPlan } = season;
  const roleFocus = defaultTrainingFocus(player.position);
  let practice = trainingPlan?.practice ?? {};
  const table = newTable(season.clubs);
  let progress: Preparation = { fatigue: 0, xp: 0 };
  const stats = { appearances: 0, minutes: 0, goals: 0, assists: 0, saves: 0, cleanSheets: 0, totalRating: 0 };
  const calendar = buildCalendar(season.clubs);
  const rounds = calendar.map((fixtures, index) => {
    const fixture = fixtures.find(({ home, away }) => home.id === player.clubId || away.id === player.clubId)!;
    const scheduled = { number: index + 1, date: roundDate(season.year ?? FIRST_SEASON_YEAR, index), competition: "Série A", fixture };
    if (index >= season.rounds.length) return { ...scheduled, played: null };

    const preparation = season.rounds[index];
    const focus = season.focuses?.[index] ?? roleFocus;
    if (trainingPlan && preparation) practice = gainPractice(trainingPlan, practice, focus, TRAINING_EFFECT[preparation].practice);
    progress = prepare(progress, preparation);
    const results = fixtures.map((game) => simulateMatch(game, player, progress, index, season.seed));
    for (const { match } of results) {
      recordResult(table, match.home, match.homeGoals, match.awayGoals);
      recordResult(table, match.away, match.awayGoals, match.homeGoals);
    }
    const { match, appearance } = results[fixtures.indexOf(fixture)];
    stats.minutes += appearance.minutes;
    stats.goals += appearance.goals;
    stats.assists += appearance.assists;
    stats.saves += appearance.saves;
    stats.cleanSheets += Number(appearance.cleanSheet);
    if (appearance.rating !== null) {
      stats.appearances++;
      stats.totalRating += appearance.rating;
      if (trainingPlan) practice = gainPractice(trainingPlan, practice, focus, Math.floor(appearance.rating * appearance.minutes / 60));
    }
    progress = {
      fatigue: Math.max(0, Math.min(100, progress.fatigue + Math.round(appearance.minutes / 6) - 9)),
      xp: progress.xp + (appearance.rating === null ? 0 : Math.floor(appearance.rating * 2)),
    };
    return { ...scheduled, played: { match, appearance, preparation, results: results.map(({ match }) => match) } };
  });

  if (season.preparation !== null) {
    if (trainingPlan) practice = gainPractice(trainingPlan, practice, season.selectedFocus ?? roleFocus, TRAINING_EFFECT[season.preparation].practice);
    progress = prepare(progress, season.preparation);
  }
  const attributes = trainingPlan ? developedAttributes(trainingPlan, practice) : undefined;
  const standings = Array.from(table.values()).sort((a, b) =>
    b.points - a.points || b.wins - a.wins || (b.scored - b.conceded) - (a.scored - a.conceded) ||
    b.scored - a.scored || a.club.id.localeCompare(b.club.id, "en"),
  );
  return {
    rounds,
    next: rounds[season.rounds.length],
    last: rounds[season.rounds.length - 1],
    standings,
    stats: { ...stats, average: stats.appearances > 0 ? stats.totalRating / stats.appearances : null },
    fatigue: progress.fatigue,
    condition: 100 - progress.fatigue,
    overall: attributes ? Math.round(Object.values(attributes).reduce((sum, score) => sum + score, 0) / Object.keys(attributes).length)
      : playerOverall(player.initialOverall, progress.xp),
    attributes,
    potential: trainingPlan ? trainingPotential(trainingPlan) : undefined,
    practice,
    xp: progress.xp,
  };
}
