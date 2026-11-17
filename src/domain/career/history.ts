import type { SavedAthlete } from "@/domain/athlete/athlete";
import { FIRST_SEASON_YEAR, roundDate } from "./calendar";
import { registrationAt } from "./registration";
import { readSeason } from "./season";
import { SEASON_ROUNDS, type Season } from "./season-schema";
import { worldCompetitions } from "./world-competitions";

export const RETIREMENT_MINIMUM = 34;
export const RETIREMENT_MAXIMUM = 42;

export function careerAge(athlete: SavedAthlete["athlete"], season: Season): number {
  return season.trainingPlan?.age ?? athlete.age + (season.year ?? FIRST_SEASON_YEAR) - FIRST_SEASON_YEAR;
}

export function careerHistory(save: SavedAthlete) {
  const editions = [...(save.pastSeasons ?? []), ...(save.season ? [save.season] : [])].map((season) => {
    const year = season.year ?? FIRST_SEASON_YEAR;
    const { rounds, stats, divisions, overall } = readSeason(season);
    const playedClubs = [...new Set(rounds.flatMap(({ number, played }) =>
      played?.appearance.minutes ? [registrationAt(season, number - 1).clubId] : []))];
    const clubs = [...season.clubs, ...(season.brazilB ?? [])].filter(({ id }) => playedClubs.includes(id));
    const complete = season.rounds.length === SEASON_ROUNDS;
    const awards: string[] = [];
    if (complete) {
      if (stats.goals >= 15) awards.push("Destaque de artilharia");
      if (stats.assists >= 10) awards.push("Destaque de criação");
      if (stats.cleanSheets >= 12) awards.push("Destaque no gol");
      if (stats.appearances >= 18 && (stats.average ?? 0) >= 7.2) awards.push("Destaque de desempenho");
    }

    const titles: string[] = [];
    if (complete) {
      if (clubs.some(({ id }) => id === divisions.first[0]?.club.id)) titles.push("Série A");
      if (clubs.some(({ id }) => id === divisions.second[0]?.club.id)) titles.push("Série B");
    }
    for (const competition of worldCompetitions(season, season.date ?? roundDate(year, season.rounds.length - 1))) {
      const last = competition.matches.at(-1);
      if (!competition.winner || !last) continue;
      const round = rounds.filter(({ date }) => date <= last.date).length;
      const active = registrationAt(season, round);
      if (!active.inactive && active.clubId === competition.winner.id) titles.push(competition.name);
    }

    return { year, age: careerAge(save.athlete, season), complete, clubs, stats, overall, titles, awards };
  });
  const totals = editions.reduce((sum, { stats }) => ({
    appearances: sum.appearances + stats.appearances,
    minutes: sum.minutes + stats.minutes,
    goals: sum.goals + stats.goals,
    assists: sum.assists + stats.assists,
    saves: sum.saves + stats.saves,
    cleanSheets: sum.cleanSheets + stats.cleanSheets,
  }), { appearances: 0, minutes: 0, goals: 0, assists: 0, saves: 0, cleanSheets: 0 });
  const records = [
    { label: "Gols em uma edição", value: Math.max(0, ...editions.map(({ stats }) => stats.goals)) },
    { label: "Assistências em uma edição", value: Math.max(0, ...editions.map(({ stats }) => stats.assists)) },
    { label: "Defesas em uma edição", value: Math.max(0, ...editions.map(({ stats }) => stats.saves)) },
    { label: "Jogos sem sofrer gol em uma edição", value: Math.max(0, ...editions.map(({ stats }) => stats.cleanSheets)) },
  ];
  return { editions, totals, records };
}
