import type { SavedAthlete } from "@/domain/athlete/athlete";
import { addDays, DAYS_PER_WEEK, FIRST_SEASON_YEAR, roundDate } from "./calendar";
import { nextTrainingPlan, withTrainingPlan } from "./training";
import { applySeasonAction, createSeason, readSeason } from "./season";
import { SEASON_ROUNDS, seasonActionSchema, type Season, type SeasonAction } from "./season-schema";

export function seasonYear(season: Season): number {
  return season.year ?? FIRST_SEASON_YEAR;
}

export function careerDate(season: Season): string {
  return season.date ?? roundDate(seasonYear(season), season.rounds.length - 1);
}

export function nextMatchDate(season: Season): string {
  if (season.rounds.length === SEASON_ROUNDS) return roundDate(seasonYear(season) + 1, 0);
  return roundDate(seasonYear(season), season.rounds.length);
}

export function latestAdvanceDate(season: Season): string {
  return addDays(careerDate(season), 366);
}

export type ClockResult =
  | { ok: true; season: Season; pastSeasons: Season[] }
  | { ok: false; message: string };

export function applyCareerAction(
  profile: SavedAthlete & { contract: NonNullable<SavedAthlete["contract"]> },
  season: Season,
  input: SeasonAction,
): ClockResult {
  const parsed = seasonActionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Escolha um comando válido." };
  let pastSeasons = profile.pastSeasons ?? [];
  let current = withTrainingPlan(season, profile.athlete);

  function rollSeason() {
    const upcoming = createSeason(profile, { worldVersion: current.worldVersion, clubs: current.clubs }, seasonYear(current) + 1);
    if (!upcoming) return false;
    const previous = readSeason(current);
    pastSeasons = [...pastSeasons, current];
    current = {
      ...upcoming,
      date: careerDate(current),
      trainingPlan: nextTrainingPlan(current.trainingPlan!, previous.practice),
    };
    return true;
  }

  if (parsed.data.type === "train") {
    if (current.rounds.length === SEASON_ROUNDS && !rollSeason()) return { ok: false, message: "A próxima temporada não pôde ser montada." };
    const result = applySeasonAction(current, parsed.data);
    return result.ok ? { ...result, pastSeasons } : result;
  }

  const date = careerDate(current);
  const target = parsed.data.type === "play" ? nextMatchDate(current)
    : parsed.data.until === "week" ? addDays(date, DAYS_PER_WEEK)
    : parsed.data.until === "next" ? nextMatchDate(current) : parsed.data.until;
  if (target <= date || target > latestAdvanceDate(current)) {
    return { ok: false, message: "Escolha uma data futura dentro de um ano do calendário." };
  }

  if (current.rounds.length === SEASON_ROUNDS && !rollSeason()) return { ok: false, message: "A próxima temporada não pôde ser montada." };
  while (nextMatchDate(current) <= target) {
    const matchDay = nextMatchDate(current);
    const result = applySeasonAction(current, { type: "play" });
    if (!result.ok) return result;
    current = { ...result.season, date: matchDay };
    if (current.rounds.length === SEASON_ROUNDS && !rollSeason()) return { ok: false, message: "A próxima temporada não pôde ser montada." };
  }
  return { ok: true, season: { ...current, date: target }, pastSeasons };
}
