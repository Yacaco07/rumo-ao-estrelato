import { addDays, roundDate } from "./calendar";
import { scheduledMatch, type CompetitionView, type TableRow } from "./competition-engine";
import { SEASON_ROUNDS, type Season } from "./season-schema";

export function brazilPlayoffEnd(season: Season) {
  return addDays(roundDate(season.year ?? 2026, SEASON_ROUNDS - 1), 5);
}

export function brazilPlayoffs(season: Season, date: string, standings: TableRow[]) {
  const view: CompetitionView = { id: "br-b-acesso", name: "Série B · Playoff de acesso", matches: [], tables: [] };
  const promoted = standings.slice(0, 2).map(({ club }) => club.id);
  if (!season.brazilB || season.rounds.length < SEASON_ROUNDS) return { view, promoted: [] };
  const context = { year: season.year ?? 2026, asOf: date, seed: season.seed };
  for (const [higher, lower] of [[2, 5], [3, 4]]) {
    const home = standings[higher].club;
    const away = standings[lower].club;
    const first = scheduledMatch(context, view.id, { home: away, away: home }, 37, 2, "Ida");
    const second = scheduledMatch(context, view.id, { home, away }, 37, 5, "Volta");
    if (first.score && second.score) {
      const aggregate = first.score.awayGoals + second.score.homeGoals - first.score.homeGoals - second.score.awayGoals;
      second.winnerId = aggregate >= 0 ? home.id : away.id;
      promoted.push(second.winnerId);
    }
    view.matches.push(first, second);
  }
  return { view, promoted };
}
