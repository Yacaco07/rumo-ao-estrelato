import { averageRating, type AthleteDraft } from "@/domain/athlete/athlete";
import { getPosition } from "@/domain/athlete/positions";
import { defaultTrainingFocus, developedAttributes, gainPractice, TRAINING_EFFECT, trainingPotential } from "./training";
import { initialTrust, selectAthlete, trainingTrust, updateTrust } from "./coach";
import { registrationAt } from "./registration";
import { hash } from "./random";
import { playerOverall, simulateMatch, type Absence } from "./match";
import type { ContractOffer } from "./contract";
import { buildCalendar, FIRST_SEASON_YEAR, roundDate } from "./calendar";
import { SEASON_ROUNDS, seasonActionSchema, seasonSchema, type Season, type SeasonAction, type SeasonClub, type Training } from "./season-schema";

export type SeasonCatalog = { worldVersion: string; clubs: SeasonClub[]; brazilB?: SeasonClub[] };
export type SeasonProfile = {
  createdAt: string;
  athlete: AthleteDraft;
  contract: ContractOffer;
};

type Preparation = { fatigue: number; xp: number };

export { buildCalendar } from "./calendar";

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
  if (!action.success || (action.data.type === "advance" || action.data.type === "market")) return { ok: false, message: "Escolha uma ação válida." };
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
  const table = newTable([...season.clubs, ...(season.brazilB ?? [])]);
  const serieA = new Set(season.clubs.map(({ id }) => id));
  let progress: Preparation = { fatigue: 0, xp: 0 };
  let suspension = season.startingSuspension ?? 0;
  let injury = 0;
  let yellow = 0;
  let trust = season.startingTrust ?? initialTrust(player.role);
  const stats = { starts: 0, appearances: 0, minutes: 0, goals: 0, assists: 0, saves: 0, cleanSheets: 0, totalRating: 0, yellowCards: 0, redCards: 0 };
  const calendar = buildCalendar(season.clubs);
  const secondCalendar = season.brazilB ? buildCalendar(season.brazilB) : undefined;
  const rounds = calendar.map((firstDivision, index) => {
    const fixtures = [...firstDivision, ...(secondCalendar?.[index] ?? [])];
    const registration = registrationAt(season, index);
    const fixture = fixtures.find(({ home, away }) => home.id === registration.clubId || away.id === registration.clubId)!;
    const scheduled = { number: index + 1, date: roundDate(season.year ?? FIRST_SEASON_YEAR, index), competition: serieA.has(registration.clubId) ? "Série A" : "Série B", fixture };
    if (index >= season.rounds.length) return { ...scheduled, played: null };

    const preparation = season.rounds[index];
    if (season.registrations?.some(({ fromRound }) => fromRound === index)) trust = initialTrust(registration.role);
    const coaching = season.coachingFrom !== undefined && index >= season.coachingFrom;
    if (coaching) {
      const talk = season.coachTalkRounds?.includes(index) ? 6 : 0;
      trust = updateTrust(trust + talk + trainingTrust(preparation, progress.fatigue), null, 0);
    }
    const focus = season.focuses?.[index] ?? roleFocus;
    if (trainingPlan && preparation) practice = gainPractice(trainingPlan, practice, focus, TRAINING_EFFECT[preparation].practice);
    progress = prepare(progress, preparation);
    const detailed = season.detailedFrom !== undefined && index >= season.detailedFrom;
    const absence: Absence | undefined = registration.inactive ? "free-agent" : injury > 0 ? "injured" : suspension > 0 ? "suspended" : undefined;
    const attributes = detailed && trainingPlan ? developedAttributes(trainingPlan, practice) : {};
    const selection = coaching ? selectAthlete({ trust, role: registration.role, fatigue: progress.fatigue, debut: index === 0, absence }) : undefined;
    const results = fixtures.map((game) => simulateMatch(game, { ...player, ...registration }, progress, index, season.seed,
      detailed ? { attributes, absence, selection } : undefined));
    for (const { match } of results) {
      recordResult(table, match.home, match.homeGoals, match.awayGoals);
      recordResult(table, match.away, match.awayGoals, match.homeGoals);
    }
    const { match, appearance, events } = results[fixtures.indexOf(fixture)];
    injury = Math.max(0, injury - 1, appearance.injuryGames);
    suspension = Math.max(0, suspension - 1) + appearance.red;
    yellow += appearance.yellow;
    if (yellow === 3) { yellow = 0; suspension++; }
    stats.yellowCards += appearance.yellow;
    stats.redCards += appearance.red;
    stats.minutes += appearance.minutes;
    stats.goals += appearance.goals;
    stats.assists += appearance.assists;
    stats.saves += appearance.saves;
    stats.cleanSheets += Number(appearance.cleanSheet);
    if (coaching) trust = updateTrust(trust, appearance.rating, appearance.red);
    if (appearance.minutes > 0 && appearance.lineup === "starter") stats.starts++;
    if (appearance.rating !== null) {
      stats.appearances++;
      stats.totalRating += appearance.rating;
      if (trainingPlan) practice = gainPractice(trainingPlan, practice, focus, Math.floor(appearance.rating * appearance.minutes / 60));
    }
    progress = {
      fatigue: Math.max(0, Math.min(100, progress.fatigue + Math.round(appearance.minutes / 6) - 9)),
      xp: progress.xp + (appearance.rating === null ? 0 : Math.floor(appearance.rating * 2)),
    };
    return { ...scheduled, played: { match, appearance, events, preparation, allResults: results.map(({ match }) => match), results: results.filter(({ match }) => serieA.has(match.home.id) === serieA.has(registration.clubId)).map(({ match }) => match) } };
  });

  const registration = registrationAt(season, season.rounds.length);
  if (season.registrations?.some(({ fromRound }) => fromRound === season.rounds.length)) trust = initialTrust(registration.role);
  if (season.coachTalkRounds?.includes(season.rounds.length)) trust = updateTrust(trust + 6, null, 0);
  if (season.preparation !== null) {
    if (season.coachingFrom !== undefined) trust = updateTrust(trust + trainingTrust(season.preparation, progress.fatigue), null, 0);
    if (trainingPlan) practice = gainPractice(trainingPlan, practice, season.selectedFocus ?? roleFocus, TRAINING_EFFECT[season.preparation].practice);
    progress = prepare(progress, season.preparation);
  }
  const attributes = trainingPlan ? developedAttributes(trainingPlan, practice) : undefined;
  const standings = Array.from(table.values()).sort((a, b) =>
    b.points - a.points || b.wins - a.wins || (b.scored - b.conceded) - (a.scored - a.conceded) ||
    b.scored - a.scored || a.club.id.localeCompare(b.club.id, "en"),
  );
  const first = standings.filter(({ club }) => serieA.has(club.id));
  const second = standings.filter(({ club }) => !serieA.has(club.id));
  return {
    rounds,
    next: rounds[season.rounds.length],
    last: rounds[season.rounds.length - 1],
    standings: serieA.has(registration.clubId) ? first : second,
    divisions: { first, second },
    stats: { ...stats, average: stats.appearances > 0 ? stats.totalRating / stats.appearances : null },
    fatigue: progress.fatigue,
    condition: 100 - progress.fatigue,
    overall: attributes ? Math.round(Object.values(attributes).reduce((sum, score) => sum + score, 0) / Object.keys(attributes).length)
      : playerOverall(player.initialOverall, progress.xp),
    attributes,
    potential: trainingPlan ? trainingPotential(trainingPlan) : undefined,
    health: { injury, suspension },
    trust,
    selection: selectAthlete({
      trust, role: registration.role, fatigue: progress.fatigue, debut: season.rounds.length === 0,
      absence: registration.inactive ? "free-agent" : injury > 0 ? "injured" : suspension > 0 ? "suspended" : undefined,
    }),
    practice,
    xp: progress.xp,
  };
}
