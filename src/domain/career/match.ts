import type { Fixture } from "./calendar";
import type { Selection } from "./coach";
import { hash, randomSource } from "./random";
import type { Season, SeasonClub, TrainingPlan } from "./season-schema";

type Preparation = { fatigue: number; xp: number };
type Match = Fixture & { homeGoals: number; awayGoals: number };
export type Absence = "injured" | "suspended" | "free-agent";
export type MatchEvent = {
  minute: number;
  clubId: string;
  kind: "goal" | "save" | "yellow" | "red" | "injury" | "sub-in" | "sub-out";
  player: boolean;
  assist?: boolean;
};
type Appearance = {
  minutes: number; goals: number; assists: number; saves: number; cleanSheet: boolean;
  rating: number | null; lineup: Selection; absence?: Absence; injuryGames: number;
  yellow: number; red: number;
};

export function playerOverall(initialOverall: number, xp: number) {
  return Math.min(99, initialOverall + Math.min(12, Math.floor(xp / 65)));
}

type MatchContext = {
  attributes: TrainingPlan["attributes"];
  absence?: Absence;
  selection?: Selection;
};

export function simulateMatch(
  fixture: Fixture, player: Season["player"], prepared: Preparation,
  roundIndex: number, seed: number, detailed?: MatchContext,
) {
  const random = randomSource(hash(`${seed}:${roundIndex}:${fixture.home.id}:${fixture.away.id}`));
  const { clubId, role, position, initialOverall } = player;
  const isKeeper = position === "GK";
  const managesHome = fixture.home.id === clubId;
  const managesAway = fixture.away.id === clubId;
  const hasAthlete = managesHome || managesAway;
  const overall = playerOverall(initialOverall, prepared.xp);
  const skills = detailed?.attributes;
  const legacyStarter = roundIndex === 0 || role === "rotation" || overall >= 60 || prepared.fatigue < 45 && roundIndex % 3 === 0;
  const selection = detailed?.selection ?? (legacyStarter ? "starter" : "bench");
  const starter = selection === "starter";
  const absence = hasAthlete ? detailed?.absence : undefined;
  const plannedMinutes = !hasAthlete || absence || selection === "unavailable" ? 0 : isKeeper ? starter ? 90 : 0
    : Math.max(15, Math.min(90, (starter ? 81 : 46) + Math.floor(random() * 12) - Math.floor(prepared.fatigue / 3)));
  const enters = starter ? 0 : 90 - plannedMinutes;
  const expectedExit = enters + plannedMinutes;
  const incident = randomSource(hash(`${seed}:incident:${roundIndex}:${clubId}`));
  const incidentRoll = detailed && plannedMinutes > 0 ? incident() : 1;
  const injuryRisk = 0.023 + Math.max(0, prepared.fatigue - 50) / 450;
  const injuryGames = incidentRoll < injuryRisk ? 1 + Math.floor(incident() * 3) : 0;
  const red = !injuryGames && incidentRoll < injuryRisk + 0.02 ? 1 : 0;
  const yellow = !injuryGames && !red && incidentRoll < injuryRisk + 0.18 ? 1 : 0;
  const incidentMinute = injuryGames || red || yellow ? enters + 1 + Math.floor(incident() * plannedMinutes) : null;
  const leaves = incidentMinute !== null && (injuryGames || red) ? incidentMinute : expectedExit;
  const minutes = leaves - enters;
  const lineup: Selection = absence ? "unavailable" : selection;
  const events: MatchEvent[] = [];
  if (minutes > 0 && enters > 0) events.push({ kind: "sub-in", minute: enters, clubId, player: true });
  if (incidentMinute !== null) {
    const kind = injuryGames ? "injury" : red ? "red" : "yellow";
    events.push({ kind, minute: incidentMinute, clubId, player: true });
  }
  if (minutes > 0 && leaves < 90 && !red) events.push({ kind: "sub-out", minute: leaves, clubId, player: true });
  let goals = 0;
  let assists = 0;
  let saves = 0;
  let concededOnPitch = 0;

  function score(club: SeasonClub, atHome: boolean) {
    const withAthlete = club.id === clubId;
    const againstKeeper = hasAthlete && isKeeper && !withAthlete && minutes > 0;
    const teamShape = ((hash(`${seed}:${club.id}`) % 13) - 6) * 0.005;
    const chance = 0.225 + teamShape + (atHome ? 0.035 : 0);
    const relevant = isKeeper ? skills?.reflexes : position === "CB" || position === "DM" ? skills?.defending
      : position === "CM" || position === "AM" ? skills?.passing : skills?.shooting;
    const athleteImpact = ((relevant ?? overall) - prepared.fatigue / 4) / 1800;
    const shots = 4 + Math.floor(random() * 6);
    let scored = 0;
    for (let index = 0; index < shots; index++) {
      const minute = 1 + Math.floor(random() * 90);
      const onPitch = minute > enters && minute <= leaves;
      const attackBonus = withAthlete && !isKeeper && onPitch ? athleteImpact : 0;
      const keeperPresent = againstKeeper && (!detailed || onPitch);
      const keeperBonus = keeperPresent ? athleteImpact : 0;
      const outcome = random();
      if (outcome < chance + attackBonus - keeperBonus) {
        scored++;
        let scoredByPlayer = false;
        let assisted = false;
        if (withAthlete && !isKeeper && onPitch) {
          const share = position === "ST" || position === "WG" ? 0.32 : 0.13;
          const involvement = random();
          if (involvement < share) { goals++; scoredByPlayer = true; }
          else if (involvement < share + 0.20) { assists++; assisted = true; }
        }
        if (keeperPresent) concededOnPitch++;
        events.push({ kind: "goal", minute, clubId: club.id, player: scoredByPlayer, ...(assisted ? { assist: true } : {}) });
      } else if (keeperPresent && outcome < 0.65) {
        saves++;
        events.push({ kind: "save", minute, clubId, player: true });
      }
    }
    return scored;
  }

  const match: Match = { ...fixture, homeGoals: score(fixture.home, true), awayGoals: score(fixture.away, false) };
  const conceded = managesHome ? match.awayGoals : match.homeGoals;
  const cleanSheet = isKeeper && minutes === 90 && conceded === 0;
  const impact = isKeeper ? saves * 0.22 + Number(cleanSheet) * 0.6 - (detailed ? concededOnPitch : conceded) * 0.32 : goals * 0.8 + assists * 0.55;
  const rating = minutes === 0 ? null : Math.round(Math.min(10, Math.max(3, 6 + impact - red * 1.65 - yellow * 0.25 - prepared.fatigue / 150 + random() * 0.8)) * 10) / 10;
  const appearance: Appearance = { minutes, goals, assists, saves, cleanSheet, rating, lineup, absence, injuryGames, yellow, red };
  events.sort((a, b) => a.minute - b.minute);
  return { match, appearance, events };
}
