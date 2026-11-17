import { COMPETITION_MEMBERS } from "@/data/world/competition-members";
import {
  groupedCup, knockout, orderedClubs, scheduleLeague, uniqueClubs, type CompetitionContext, type CompetitionView,
} from "./competition-engine";
import type { Season, SeasonClub } from "./season-schema";

export const BRAZIL_B_CLUBS = COMPETITION_MEMBERS.find(({ id }) => id === "br-b")!.clubs;
export type Qualifications = Record<string, string[]>;

const DOMESTIC = [
  { league: "en-1", id: "fa-cup", name: "FA Cup", superId: "community-shield", superName: "Community Shield" },
  { league: "es-1", id: "copa-del-rey", name: "Copa del Rey", superId: "supercopa-espana", superName: "Supercopa da Espanha" },
  { league: "de-1", id: "dfb-pokal", name: "DFB-Pokal", superId: "supercup-de", superName: "Supercopa da Alemanha" },
  { league: "it-1", id: "coppa-italia", name: "Coppa Italia", superId: "supercoppa-italia", superName: "Supercoppa Italiana" },
  { league: "fr-1", id: "coupe-de-france", name: "Coupe de France", superId: "trophee-des-champions", superName: "Trophée des Champions" },
  { league: "ar-1", id: "copa-argentina", name: "Copa Argentina", superId: "supercopa-argentina", superName: "Supercopa Argentina" },
];

export function worldCompetitions(season: Season, date: string): CompetitionView[] {
  if (!season.brazilB) return [];
  const context = { year: season.year ?? 2026, asOf: date, seed: season.seed };
  const byLeague = new Map(COMPETITION_MEMBERS.map(({ id, clubs }) => [id, clubs]));
  byLeague.set("br-a", season.clubs);
  byLeague.set("br-b", season.brazilB);
  const previous = season.qualifications ?? {};
  const ranked = (id: string) => orderedClubs(byLeague.get(id) ?? [], previous[id] ?? [], context.seed);
  const allClubs = new Map([...byLeague.values()].flat().map((club) => [club.id, club]));
  const definitions: CompetitionView[] = [];

  function cup(id: string, name: string, teams: SeasonClub[], weeks: number[], weekday = 3) {
    const view = knockout(context, id, name, teams, weeks, weekday);
    definitions.push(view);
    return view;
  }
  function superCup(id: string, name: string, leagues: string, nationalCup: string) {
    const ranks = ranked(leagues);
    const winner = previous[nationalCup]?.[0];
    const reference = (winner ? allClubs.get(winner) : undefined) ?? ranks[1];
    const fixtures = uniqueClubs([ranks[0], reference, ranks[1], ranks[2]]).slice(0, 2);
    cup(id, name, fixtures, [0], 2);
  }

  for (const league of COMPETITION_MEMBERS) {
    if (league.id === "br-b") continue;
    if (league.id !== "ar-1") {
      definitions.push(scheduleLeague(context, league.id, league.name, league.clubs));
      continue;
    }
    const argTeams = league.clubs.slice(0, 15).flatMap((club, index) => [club, league.clubs[index + 15]]);
    const open = groupedCup(context, "ar-apertura", "Apertura", argTeams, {
      groups: 2, rounds: 15, firstWeek: 0, knockoutWeeks: [15, 16, 17, 18], weekday: 0, qualify: 8,
    });
    const close = groupedCup(context, "ar-clausura", "Clausura", argTeams, {
      groups: 2, rounds: 15, firstWeek: 19, knockoutWeeks: [34, 35, 36, 37], weekday: 0, qualify: 8,
    });
    // Clasificación anual usa somente as duas fases de zonas.
    const entries = open.tables.flatMap(({ rows }) => rows).map((row) => {
      const other = close.tables.flatMap(({ rows }) => rows).find(({ club }) => club.id === row.club.id);
      return other ? {
        ...row, points: row.points + other.points, played: row.played + other.played,
        wins: row.wins + other.wins, draws: row.draws + other.draws, losses: row.losses + other.losses,
        scored: row.scored + other.scored, conceded: row.conceded + other.conceded,
      } : row;
    }).sort((a, b) => b.points - a.points || b.scored - b.conceded - (a.scored - a.conceded) || b.scored - a.scored);
    definitions.push(open, close, { id: "ar-1", name: league.name, matches: [], tables: [{ name: "Tabela anual", rows: entries }],
      winner: close.winner ? entries[0]?.club : undefined });
  }

  cup("copa-brasil", "Copa do Brasil", [...ranked("br-a"), ...ranked("br-b")], [1, 5, 10, 18, 26, 33]);
  superCup("supercopa-brasil", "Supercopa do Brasil", "br-a", "copa-brasil");
  for (const item of DOMESTIC) {
    cup(item.id, item.name, ranked(item.league), [1, 5, 10, 22, 33]);
    superCup(item.superId, item.superName, item.league, item.id);
  }

  function interleave(leagues: string[]) {
    const ranks = leagues.map(ranked);
    return Array.from({ length: Math.max(...ranks.map((group) => group.length)) }, (_, index) =>
      ranks.flatMap((group) => group[index] ?? [])).flat();
  }

  const south = interleave(["br-a", "ar-1"]);
  const libertadores = groupedCup(context, "libertadores", "CONMEBOL Libertadores", south.slice(0, 32), {
    groups: 8, rounds: 6, firstWeek: 3, knockoutWeeks: [12, 19, 25, 34], weekday: 4, qualify: 2,
  });
  const sudamericana = groupedCup(context, "sudamericana", "CONMEBOL Sul-Americana", south.slice(32, 48), {
    groups: 4, rounds: 6, firstWeek: 3, knockoutWeeks: [19, 25, 34], weekday: 4, qualify: 2,
  });
  definitions.push(libertadores, sudamericana);
  function championsOrSeeds(ids: string[], reserve: SeasonClub[]) {
    return uniqueClubs(ids.flatMap((id, index) => {
      const club = allClubs.get(previous[id]?.[0] ?? "");
      return club ?? reserve[index];
    }));
  }
  cup("recopa", "Recopa Sul-Americana", championsOrSeeds(["libertadores", "sudamericana"], south).concat(south.slice(0, 3)).filter((club, index, all) =>
    all.findIndex((candidate) => candidate.id === club.id) === index).slice(0, 2), [1], 2);

  const europe = interleave(["en-1", "es-1", "de-1", "it-1", "fr-1"]);
  const europeanViews = [
    { id: "champions", name: "UEFA Champions League", clubs: europe.slice(0, 32), rounds: 8 },
    { id: "europa", name: "UEFA Europa League", clubs: europe.slice(32, 64), rounds: 8 },
    { id: "conference", name: "UEFA Conference League", clubs: europe.slice(64, 96), rounds: 6 },
  ].map(({ id, name, clubs, rounds }) => groupedCup(context, id, name, clubs, {
    groups: 1, rounds, firstWeek: 3, knockoutWeeks: [12, 19, 25, 34], weekday: 4, qualify: 16,
  }));
  definitions.push(...europeanViews);
  cup("uefa-super", "Supercopa da UEFA", uniqueClubs([...championsOrSeeds(["champions", "europa"], europe), ...europe]).slice(0, 2), [1], 2);

  const asianWest = interleave(["sa-1", "ae-1", "qa-1"]);
  const asianEast = interleave(["jp-1", "kr-1", "cn-1"]);
  function alternate(left: SeasonClub[], right: SeasonClub[]) {
    return left.flatMap((club, index) => [club, right[index]]);
  }
  const asianElite = groupedCup(context, "afc-elite", "AFC Champions League Elite",
    alternate(asianWest.slice(0, 16), asianEast.slice(0, 16)), {
      groups: 2, rounds: 8, firstWeek: 3, knockoutWeeks: [13, 19, 25, 34], weekday: 4, qualify: 8,
    });
  const asianTwo = groupedCup(context, "afc-two", "AFC Champions League Two",
    alternate(asianWest.slice(16, 32), asianEast.slice(16, 32)), {
      groups: 8, rounds: 6, firstWeek: 3, knockoutWeeks: [13, 19, 25, 34], weekday: 4, qualify: 2,
    });
  definitions.push(asianElite, asianTwo);

  const continentalWinners = [europeanViews[0].winner, libertadores.winner, asianElite.winner].filter((club) => club !== undefined);
  if (continentalWinners.length === 3) {
    cup("intercontinental", "Copa Intercontinental", continentalWinners, [35, 36], 2);
  }
  if ((context.year - 2029) % 4 === 0) {
    const qualified = championsOrSeeds(["champions", "libertadores", "afc-elite"], [europe[0], south[0], asianWest[0]]);
    const worldClubs = uniqueClubs([...qualified, ...europe.slice(0, 6), ...south.slice(0, 5), ...asianWest.slice(0, 4), ...asianEast.slice(0, 4)]).slice(0, 16);
    definitions.push(groupedCup(context, "club-world-cup", "Mundial de Clubes", worldClubs, {
      groups: 4, rounds: 3, firstWeek: 26, knockoutWeeks: [31, 33, 36], weekday: 5, qualify: 2,
    }));
  }
  return definitions;
}

export function worldQualifiers(season: Season, date: string): Qualifications {
  return Object.fromEntries(worldCompetitions(season, date).flatMap((view) => {
    if (!view.winner) return [];
    const ranks = view.tables.length === 1 ? view.tables[0].rows.map(({ club }) => club.id) : [];
    return [[view.id, [...new Set([view.winner.id, ...ranks])]]];
  }));
}

export function upcomingWorldMatches(season: Season, date: string, clubId: string) {
  return worldCompetitions(season, date).flatMap((view) => view.matches
    .filter((match) => !match.score && (match.home.id === clubId || match.away.id === clubId))
    .map((match) => ({ ...match, competition: view.name })))
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}
