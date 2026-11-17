import { NATIONAL_POOLS } from "@/data/world/national-teams";
import { normalizeWorldText } from "@/domain/world/world-schema";
import { groupedCup, scheduledMatch, orderedClubs, type CompetitionMatch, type CompetitionView } from "./competition-engine";
import { hash, randomSource } from "./random";
import type { AthleteDraft } from "@/domain/athlete/athlete";
import type { NationalCareer } from "./national-schema";
import type { readSeason } from "./season";

const pools = Object.fromEntries(Object.entries(NATIONAL_POOLS).map(([group, teams]) => [
  group, teams.map(([id, name]) => ({ id: "nat-" + id, group, name })),
]));
const nations = Object.values(pools).flat();
const aliases: Record<string, string> = {
  brazil: "nat-br", brasileiro: "nat-br", brasileira: "nat-br", br: "nat-br", bra: "nat-br",
  japan: "nat-jp", "republica da coreia": "nat-kr", "south korea": "nat-kr", korea: "nat-kr",
  england: "nat-en", germany: "nat-de", france: "nat-fr", italy: "nat-it", spain: "nat-es",
  "arabia saudita": "nat-sa", uae: "nat-ae", qatar: "nat-qa", usa: "nat-us", eua: "nat-us",
  "republica tcheca": "nat-cz", holanda: "nat-nl",
};

export function findNation(nationality: string) {
  const name = normalizeWorldText(nationality);
  return nations.find((nation) => normalizeWorldText(nation.name) === name || nation.id === aliases[name]);
}

type Nation = NonNullable<ReturnType<typeof findNation>>;

export function nationalTournaments(year: number, date: string, seed: number): CompetitionView[] {
  const context = { year, asOf: date, seed: hash(`${seed}:selecao:${year}`) };
  function cup(id: string, name: string, list: Nation[], groups: number, extraQualify: number) {
    const clubs = orderedClubs(list, [], context.seed);
    const total = groups * 2 + extraQualify;
    const rounds = Math.ceil(Math.log2(total));
    return groupedCup(context, id, name, clubs, {
      groups, firstWeek: 18, rounds: 3, weekday: 1, qualify: 2, extraQualify,
      knockoutWeeks: Array.from({ length: rounds }, (_, index) => 21 + index),
    });
  }

  const tournaments: CompetitionView[] = [];
  if ((year - 2026) % 4 === 0) {
    const firstEdition = new Set(["nat-ae", "nat-cn", "nat-id", "nat-om", "nat-bh", "nat-sy", "nat-vn", "nat-bo", "nat-cl", "nat-pe", "nat-ve", "nat-it"]);
    const participants = year === 2026 ? nations.filter(({ id }) => !firstEdition.has(id)) : orderedClubs(nations, [], context.seed).slice(0, 48);
    tournaments.push(cup("world-cup", "Copa do Mundo", participants as Nation[], 12, 8));
  }
  if ((year - 2027) % 4 === 0) {
    tournaments.push(cup("asian-cup", "Copa Asiática", pools.afc, 4, 0));
  }
  if ((year - 2028) % 4 === 0) {
    tournaments.push(cup("euro", "Eurocopa", orderedClubs(pools.uefa, [], context.seed).slice(0, 16) as Nation[], 4, 0));
    tournaments.push(cup("copa-america", "Copa América", [...pools.conmebol, ...pools.concacaf], 4, 0));
  }
  return tournaments;
}

function nationalFixtures(nation: Nation, year: number, date: string, seed: number) {
  const context = { year, asOf: date, seed };
  const candidates = orderedClubs(nations.filter(({ id }) => id !== nation.id), [], hash(`${year}:${seed}:amigaveis`));
  const friendly: CompetitionView = {
    id: "friendly", name: "Amistoso internacional", tables: [],
    matches: [4, 12, 30].map((week, index) => scheduledMatch(context, "friendly", { home: nation, away: candidates[index] }, week, 1, "Amistoso")),
  };
  return [...nationalTournaments(year, date, seed), friendly].map((view) => ({
    ...view, matches: view.matches.filter(({ home, away }) => home.id === nation.id || away.id === nation.id),
  }));
}

export function nextNationalMatch(athlete: AthleteDraft, year: number, date: string, seed: number) {
  const nation = findNation(athlete.nationality);
  if (!nation) return undefined;
  return nationalFixtures(nation, year, date, seed).flatMap(({ matches }) => matches)
    .filter(({ score }) => !score).sort((a, b) => a.date.localeCompare(b.date))[0];
}

export function nationalEligible(athlete: AthleteDraft, form: ReturnType<typeof readSeason>) {
  if (form.health.injury || form.health.suspension || !findNation(athlete.nationality)) return false;
  const keeper = athlete.position === "GK";
  const requiredMinutes = keeper ? 270 : 240;
  const requiredRating = keeper ? 6.25 : 6.45;
  return form.stats.minutes >= requiredMinutes && (form.stats.average ?? 0) >= requiredRating && form.condition >= 30;
}

function callAppearance(athlete: AthleteDraft, form: ReturnType<typeof readSeason>, game: CompetitionMatch, nation: Nation) {
  const random = randomSource(hash(`${game.id}:${athlete.position}:${athlete.name}`));
  const home = game.home.id === nation.id;
  const ownScore = home ? game.score!.homeGoals : game.score!.awayGoals;
  const opponentScore = home ? game.score!.awayGoals : game.score!.homeGoals;
  const keeper = athlete.position === "GK";
  const starter = form.trust + ((form.stats.average ?? 6) - 6) * 6 >= 56;
  const minutes = starter ? keeper ? 90 : 70 + Math.floor(random() * 21)
    : keeper ? 0 : 12 + Math.floor(random() * 25);
  let goals = 0;
  let assists = 0;
  if (!keeper && minutes > 0) for (let index = 0; index < ownScore; index++) {
    const action = random() / (minutes / 90);
    if (action < 0.22) goals++;
    else if (action < 0.4) assists++;
  }
  return {
    id: game.id, date: game.date, nation: nation.name, opponent: (home ? game.away : game.home).name,
    goals, assists, minutes, ownScore, opponentScore, saves: keeper && minutes > 0 ? Math.floor(random() * 7) : 0,
  };
}

export function advanceNationalCareer(
  record: NationalCareer, athlete: AthleteDraft, form: ReturnType<typeof readSeason>,
  year: number, from: string, until: string, seed: number,
): NationalCareer {
  const nation = findNation(athlete.nationality);
  if (until <= from || !nation) return record;
  const fixtures = nationalFixtures(nation, year, until, seed);
  const matches = [...record.matches];
  const trophies = [...record.trophies];
  for (const view of fixtures) {
    if (nationalEligible(athlete, form)) {
      for (const game of view.matches) {
        if (game.score && game.date > from && game.date <= until && !matches.some(({ id }) => id === game.id)) {
          matches.push({ ...callAppearance(athlete, form, game, nation), competition: view.name, competitionId: view.id });
        }
      }
    }
    const trophyId = `${year}:${view.id}`;
    if (view.winner?.id === nation.id && !trophies.some(({ id }) => id === trophyId)
      && matches.some(({ id, competitionId, minutes }) => id.startsWith(`${year}:`) && competitionId === view.id && minutes > 0)) {
      trophies.push({ id: trophyId, year, name: view.name });
    }
  }
  matches.sort((a, b) => a.date.localeCompare(b.date));
  return { matches, trophies };
}
