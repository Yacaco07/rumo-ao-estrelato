import type { SavedAthlete } from "@/domain/athlete/athlete";
import { addDays, DAYS_PER_WEEK, FIRST_SEASON_YEAR, roundDate } from "./calendar";
import { effectiveContract, emptyMarket, marketAfterRound, settleMarket, useMarket, type MarketCareer } from "./market";
import { upcomingWorldMatches, worldQualifiers } from "./world-competitions";
import { brazilPlayoffEnd, brazilPlayoffs } from "./brazil-playoffs";
import { registrationAt, switchRegistration } from "./registration";
import { advanceNationalCareer, nationalEligible, nextNationalMatch } from "./national";
import type { NationalCareer } from "./national-schema";
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
  if (season.rounds.length === SEASON_ROUNDS) return season.brazilB && careerDate(season) < brazilPlayoffEnd(season)
    ? brazilPlayoffEnd(season) : roundDate(seasonYear(season) + 1, 0);
  return roundDate(seasonYear(season), season.rounds.length);
}

export function nextCommitmentDate(season: Season): string {
  const league = nextMatchDate(season);
  if (!season.brazilB) return league;
  const registration = registrationAt(season, season.rounds.length);
  if (registration.inactive) return league;
  const date = careerDate(season);
  const playoff = season.rounds.length === SEASON_ROUNDS
    ? brazilPlayoffs(season, date, readSeason(season).divisions.second).view.matches.find((match) =>
      !match.score && (match.home.id === registration.clubId || match.away.id === registration.clubId))?.date
    : undefined;
  const other = playoff ?? upcomingWorldMatches(season, date, registration.clubId)[0]?.date;
  return other && other < league ? other : league;
}

export function latestAdvanceDate(season: Season): string {
  return addDays(careerDate(season), 366);
}

export type ClockResult =
  | ({ ok: true; pastSeasons: Season[]; nationalityCareer: NationalCareer } & MarketCareer)
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
  if (current.detailedFrom === undefined) current = { ...current, detailedFrom: current.rounds.length };
  if (current.coachingFrom === undefined) current = { ...current, coachingFrom: current.rounds.length };
  let market = profile.market ?? emptyMarket();
  let contract = profile.contract;
  let national = profile.nationalityCareer ?? { matches: [], trophies: [] };
  let nationalDate = careerDate(current);

  function processNational(until: string) {
    if (current.brazilB) {
      national = advanceNationalCareer(national, profile.athlete, readSeason(current), seasonYear(current), nationalDate, until, current.seed);
    }
    nationalDate = until;
  }

  function settle(date: string) {
    ({ season: current, contract, market } = settleMarket({ season: current, contract, market }, date));
  }
  function success(): ClockResult { return { ok: true, season: current, pastSeasons, market, contract, nationalityCareer: national }; }

  if (parsed.data.type === "market") {
    const result = useMarket({ season: current, market, contract }, parsed.data.action, careerDate(current));
    if (!result.ok) return result;
    return { ok: true, ...result.career, pastSeasons, nationalityCareer: national };
  }

  function rollSeason() {
    const previous = readSeason(current);
    let clubs = current.clubs;
    let brazilB = current.brazilB;
    if (brazilB) {
      const { first, second } = previous.divisions;
      const promoted = new Set(brazilPlayoffs(current, careerDate(current), second).promoted);
      const relegated = new Set(first.slice(-4).map(({ club }) => club.id));
      const outgoing = clubs.filter(({ id }) => relegated.has(id));
      clubs = [...clubs.filter(({ id }) => !relegated.has(id)), ...brazilB.filter(({ id }) => promoted.has(id))];
      brazilB = [...brazilB.filter(({ id }) => !promoted.has(id)), ...outgoing];
    }
    const upcoming = createSeason({ ...profile, contract: effectiveContract({ season: current, contract, market }) },
      { worldVersion: current.worldVersion, clubs, ...(brazilB ? { brazilB } : {}) }, seasonYear(current) + 1);
    if (!upcoming) return false;
    const qualifications = brazilB ? {
      ...worldQualifiers(current, careerDate(current)),
      "br-a": previous.divisions.first.map(({ club }) => club.id),
      "br-b": previous.divisions.second.map(({ club }) => club.id),
    } : undefined;
    pastSeasons = [...pastSeasons, current];
    current = {
      ...upcoming,
      date: careerDate(current),
      trainingPlan: nextTrainingPlan(current.trainingPlan!, previous.practice),
      ...(qualifications ? { qualifications } : {}),
      detailedFrom: 0,
      coachingFrom: 0,
      startingTrust: previous.trust,
      startingSuspension: previous.health.suspension,
    };
    if (market.freeAgent) current = switchRegistration(current, { ...contract, inactive: true });
    return true;
  }

  if (parsed.data.type === "train") {
    settle(careerDate(current));
    if (current.brazilB && current.rounds.length === SEASON_ROUNDS) return { ok: false, message: "Aguarde o fim do playoff para preparar a edição seguinte." };
    if (current.rounds.length === SEASON_ROUNDS && !rollSeason()) return { ok: false, message: "A próxima temporada não pôde ser montada." };
    if (parsed.data.training !== "recovery" && readSeason(current).health.injury > 0) {
      return { ok: false, message: "Durante a lesão, escolha recuperação." };
    }
    const result = applySeasonAction(current, parsed.data);
    if (!result.ok) return result;
    current = result.season;
    return success();
  }

  const date = careerDate(current);
  const commitment = nextCommitmentDate(current);
  const international = parsed.data.type === "advance" && parsed.data.until === "next" && current.brazilB && nationalEligible(profile.athlete, readSeason(current))
    ? nextNationalMatch(profile.athlete, seasonYear(current), date, current.seed)?.date : undefined;
  const nextDate = international && international < commitment ? international : commitment;
  const target = parsed.data.type === "play" ? nextMatchDate(current)
    : parsed.data.until === "week" ? addDays(date, DAYS_PER_WEEK)
    : parsed.data.until === "next" ? nextDate : parsed.data.until;
  if (target <= date || target > latestAdvanceDate(current)) {
    return { ok: false, message: "Escolha uma data futura dentro de um ano do calendário." };
  }

  function finishIfDue() {
    if (current.rounds.length !== SEASON_ROUNDS) return true;
    const end = current.brazilB ? brazilPlayoffEnd(current) : careerDate(current);
    if (target < end) return true;
    processNational(end);
    settle(end);
    current = { ...current, date: end };
    return rollSeason();
  }

  if (!finishIfDue()) return { ok: false, message: "A próxima temporada não pôde ser montada." };
  while (current.rounds.length < SEASON_ROUNDS && nextMatchDate(current) <= target) {
    const matchDay = nextMatchDate(current);
    processNational(matchDay);
    settle(matchDay);
    const result = applySeasonAction(current, { type: "play" });
    if (!result.ok) return result;
    current = { ...result.season, date: matchDay };
    market = marketAfterRound({ season: current, market, contract }, matchDay, readSeason(current).last);
    if (!finishIfDue()) return { ok: false, message: "A próxima temporada não pôde ser montada." };
  }
  processNational(target);
  settle(target);
  current = { ...current, date: target };
  return success();
}
