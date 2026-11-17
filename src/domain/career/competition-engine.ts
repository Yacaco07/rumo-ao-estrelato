import { addDays, buildCalendar, firstRoundDate, type Fixture } from "./calendar";
import { hash, randomSource } from "./random";
import type { SeasonClub } from "./season-schema";

export type Scores = { homeGoals: number; awayGoals: number };
export type CompetitionMatch = Fixture & {
  id: string; date: string; phase: string; score: Scores | null;
  winnerId?: string; penalties?: { home: number; away: number };
};
export type TableRow = {
  club: SeasonClub;
  played: number; wins: number; draws: number; losses: number;
  scored: number; conceded: number; points: number;
};
export type CompetitionView = {
  id: string; name: string; matches: CompetitionMatch[];
  tables: { name: string; rows: TableRow[] }[]; winner?: SeasonClub;
};

export function leagueTable(clubs: SeasonClub[], matches: CompetitionMatch[]): TableRow[] {
  const rows = new Map(clubs.map((club) => [club.id, {
    club, played: 0, wins: 0, draws: 0, losses: 0, scored: 0, conceded: 0, points: 0,
  }]));
  function apply(id: string, scored: number, conceded: number) {
    const row = rows.get(id);
    if (!row) return;
    row.played++;
    row.scored += scored;
    row.conceded += conceded;
    if (scored > conceded) { row.wins++; row.points += 3; }
    else if (scored < conceded) row.losses++;
    else { row.draws++; row.points++; }
  }
  for (const match of matches) {
    if (!match.score) continue;
    apply(match.home.id, match.score.homeGoals, match.score.awayGoals);
    apply(match.away.id, match.score.awayGoals, match.score.homeGoals);
  }
  return [...rows.values()].sort((a, b) =>
    b.points - a.points || b.wins - a.wins || (b.scored - b.conceded) - (a.scored - a.conceded)
    || b.scored - a.scored || a.club.id.localeCompare(b.club.id, "en"));
}

export function uniqueClubs(clubs: SeasonClub[]) {
  return [...new Map(clubs.map((club) => [club.id, club])).values()];
}

export function orderedClubs(clubs: SeasonClub[], preferred: string[], seed: number) {
  const order = new Map(preferred.map((id, index) => [id, index]));
  return uniqueClubs(clubs).sort((a, b) => (order.get(a.id) ?? Infinity) - (order.get(b.id) ?? Infinity)
    || hash(`${seed}:${a.id}`) - hash(`${seed}:${b.id}`) || a.id.localeCompare(b.id, "en"));
}

export type CompetitionContext = { year: number; asOf: string; seed: number };

export function scheduledMatch(
  context: CompetitionContext, competition: string, fixture: Fixture, week: number, weekday: number, phase: string,
  decisive = false,
): CompetitionMatch {
  const date = addDays(firstRoundDate(context.year), week * 7 + weekday);
  const id = `${context.year}:${competition}:${week}:${fixture.home.id}:${fixture.away.id}`;
  const base = { ...fixture, id, date, phase };
  if (date > context.asOf) return { ...base, score: null };

  const random = randomSource(hash(`${context.seed}:${id}`));
  function goals(home: boolean) {
    let number = 0;
    for (let index = 0; index < 8; index++) if (random() < (home ? 0.23 : 0.19)) number++;
    return number;
  }
  const score = { homeGoals: goals(true), awayGoals: goals(false) };
  if (!decisive) return { ...base, score };

  if (score.homeGoals === score.awayGoals) {
    const homeWins = random() < 0.5;
    const common = 2 + Math.floor(random() * 3);
    return {
      ...base, score, winnerId: homeWins ? fixture.home.id : fixture.away.id,
      penalties: { home: common + Number(homeWins), away: common + Number(!homeWins) },
    };
  }
  return { ...base, score, winnerId: score.homeGoals > score.awayGoals ? fixture.home.id : fixture.away.id };
}

export function scheduleLeague(
  context: CompetitionContext, id: string, name: string, clubs: SeasonClub[],
  { start = 0, rounds, weekday = 0, step = 1 }: { start?: number; rounds?: number; weekday?: number; step?: number } = {},
): CompetitionView {
  const fixtures = buildCalendar(clubs);
  const matches = fixtures.slice(0, rounds ?? fixtures.length).flatMap((games, index) => games.map((game) =>
    scheduledMatch(context, id, game, start + index * step, weekday, `Rodada ${index + 1}`)));
  const rows = leagueTable(clubs, matches);
  return { id, name, matches, tables: [{ name: "Classificação", rows }], winner: matches.every(({ score }) => score) ? rows[0]?.club : undefined };
}

function roundName(remaining: number) {
  if (remaining === 2) return "Final";
  if (remaining === 4) return "Semifinais";
  if (remaining === 8) return "Quartas de final";
  if (remaining === 16) return "Oitavas de final";
  return "Fase eliminatória";
}

export function knockout(
  context: CompetitionContext, id: string, name: string, entrants: SeasonClub[], weeks: number[], weekday: number,
): CompetitionView {
  let alive = uniqueClubs(entrants);
  const matches: CompetitionMatch[] = [];
  for (const week of weeks) {
    if (alive.length < 2) break;
    const nextSize = 2 ** Math.floor(Math.log2(alive.length - 1));
    const byes = nextSize * 2 - alive.length;
    const winners = alive.slice(0, byes);
    const games: CompetitionMatch[] = [];
    for (let index = byes; index < byes + (alive.length - byes) / 2; index++) {
      const home = alive[index];
      const away = alive[alive.length - 1 - (index - byes)];
      const game = scheduledMatch(context, id, { home, away }, week, weekday, roundName(alive.length), true);
      games.push(game);
      if (game.winnerId) winners.push(game.winnerId === home.id ? home : away);
    }
    matches.push(...games);
    if (games.some(({ score }) => score === null)) return { id, name, matches, tables: [] };
    alive = winners;
  }
  return { id, name, matches, tables: [], winner: alive.length === 1 ? alive[0] : undefined };
}

export function groupedCup(
  context: CompetitionContext, id: string, name: string, clubs: SeasonClub[],
  rules: { groups: number; rounds: number; firstWeek: number; knockoutWeeks: number[]; weekday: number; qualify: number; extraQualify?: number },
): CompetitionView {
  const groups = Array.from({ length: rules.groups }, (_, group) => clubs.filter((_, index) => index % rules.groups === group));
  const leagues = groups.map((members, index) => scheduleLeague(context, `${id}-g${index + 1}`, `Grupo ${String.fromCharCode(65 + index)}`, members, {
    rounds: rules.rounds, start: rules.firstWeek, weekday: rules.weekday,
  }));
  const matches = leagues.flatMap(({ matches }) => matches);
  const tables = leagues.map((league) => ({ name: league.name, rows: league.tables[0].rows }));
  if (matches.some(({ score }) => score === null)) return { id, name, matches, tables };
  const qualified = Array.from({ length: rules.qualify }, (_, index) => tables.flatMap(({ rows }) => rows[index]?.club ?? [])).flat();
  if (rules.extraQualify) {
    const next = tables.flatMap(({ rows }) => rows[rules.qualify] ?? [])
      .sort((a, b) => b.points - a.points || (b.scored - b.conceded) - (a.scored - a.conceded) || b.scored - a.scored || a.club.id.localeCompare(b.club.id, "en"));
    qualified.push(...next.slice(0, rules.extraQualify).map(({ club }) => club));
  }
  const final = knockout(context, id, name, qualified, rules.knockoutWeeks, rules.weekday);
  return { ...final, matches: [...matches, ...final.matches], tables };
}
