import type { SeasonClub } from "./season-schema";

export const FIRST_SEASON_YEAR = 2026;
export const DAYS_PER_WEEK = 7;
const DAY = 86_400_000;

export type Fixture = { home: SeasonClub; away: SeasonClub };

export function addDays(date: string, days: number): string {
  return new Date(Date.parse(date + "T00:00:00Z") + days * DAY).toISOString().slice(0, 10);
}

export function firstRoundDate(year: number): string {
  const february = new Date(Date.UTC(year, 1, 1));
  const daysUntilSunday = (7 - february.getUTCDay()) % 7;
  return addDays(february.toISOString().slice(0, 10), daysUntilSunday);
}

export function roundDate(year: number, index: number): string {
  return addDays(firstRoundDate(year), index * DAYS_PER_WEEK);
}

export function buildCalendar(clubs: SeasonClub[]): Fixture[][] {
  const rotation: (SeasonClub | null)[] = [...clubs];
  if (rotation.length % 2 !== 0) rotation.push(null);
  const firstHalf = Array.from({ length: rotation.length - 1 }, (_, round) => {
    const matches: Fixture[] = [];
    for (let index = 0; index < rotation.length / 2; index++) {
      const first = rotation[index];
      const second = rotation[rotation.length - 1 - index];
      if (first && second) {
        matches.push((index === 0 ? round : index) % 2 === 0
          ? { home: first, away: second } : { home: second, away: first });
      }
    }
    rotation.splice(1, 0, rotation.pop()!);
    return matches;
  });
  return [...firstHalf, ...firstHalf.map((matches) => matches.map(({ home, away }) => ({ home: away, away: home })))];
}
