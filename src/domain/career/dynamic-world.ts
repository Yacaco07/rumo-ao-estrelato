import { COMPETITION_MEMBERS } from "@/data/world/competition-members";
import { CURRENT_WORLD } from "@/data/world/current-world";
import { hash, randomSource } from "./random";
import { WORLD_POSITIONS, type DynamicWorld, type WorldClub, type WorldPlayer } from "./dynamic-world-schema";
import type { Season } from "./season-schema";

const firstNames = ["Alex", "Ariel", "Caio", "Davi", "Elias", "Gabriel", "Hugo", "Ivan", "Leandro", "Luan", "Mateus", "Nuno", "Raul", "Rui", "Yuri"];
const lastNames = ["Amaral", "Barros", "Campos", "Chaves", "Dias", "Farias", "Lima", "Matos", "Montes", "Nobre", "Paz", "Prado", "Reis", "Serra", "Silva"];
const targetCounts = { goalkeeper: 2, defender: 6, midfielder: 5, forward: 4 } satisfies Record<WorldPlayer["position"], number>;

function playerName(random: () => number) {
  return `${firstNames[Math.floor(random() * firstNames.length)]} ${lastNames[Math.floor(random() * lastNames.length)]}`;
}

function newPlayer(clubId: string, position: WorldPlayer["position"], year: number, index: number, seed: number, youth: boolean): WorldPlayer {
  const id = `academy:${clubId}:${year}:${position}:${index}`;
  const random = randomSource(hash(`${seed}:${id}`));
  const age = youth ? 16 + Math.floor(random() * 3) : 17 + Math.floor(random() * 20);
  const overall = (youth ? 34 : 44) + Math.floor(random() * 25);
  return { id, name: playerName(random), clubId, position, age, overall, potential: overall + 8 + Math.floor(random() * 10) };
}

function rostersFor(clubs: WorldClub[], players: WorldPlayer[]) {
  const map = new Map(clubs.map(({ id }) => [id, [] as WorldPlayer[]]));
  for (const player of players) map.get(player.clubId)?.push(player);
  return map;
}

function rosterNeeds(players: WorldPlayer[]) {
  const counts = { goalkeeper: 0, defender: 0, midfielder: 0, forward: 0 };
  for (const { position } of players) counts[position]++;
  return [...WORLD_POSITIONS].sort((a, b) => counts[a] / targetCounts[a] - counts[b] / targetCounts[b])[0];
}

function averageOverall(players: WorldPlayer[]) {
  const eligible = players.map(({ overall }) => overall).sort((a, b) => b - a).slice(0, 12);
  return eligible.length ? Math.round(eligible.reduce((total, level) => total + level, 0) / eligible.length) : 45;
}

export const objectiveLabel = {
  title: "Disputar o título",
  "first-half": "Ficar na primeira metade da tabela",
  survival: "Buscar permanência",
} satisfies Record<WorldClub["objective"], string>;

export function createDynamicWorld(season: Season): DynamicWorld {
  const year = season.year ?? 2026;
  const seed = hash(`dinamica:${season.seed}`);
  const definitions = [
    { id: "br-a", clubs: season.clubs },
    ...COMPETITION_MEMBERS.map((league) => league.id === "br-b" ? { ...league, clubs: season.brazilB ?? league.clubs } : league),
  ];
  const clubs: WorldClub[] = definitions.flatMap((league) => league.clubs.map(({ id, name }) => {
    const random = randomSource(hash(`${seed}:${id}:tecnico`));
    const region: WorldClub["region"] = ["br-a", "br-b", "ar-1"].includes(league.id) ? "south-america"
      : ["en-1", "es-1", "de-1", "it-1", "fr-1"].includes(league.id) ? "europe" : "asia";
    return {
      id, name, region, coach: { id: `coach:${id}`, name: playerName(random) },
      budget: 600_000 + 100_000 * Math.floor(random() * 25),
      objective: "first-half" as const, needs: "forward" as const,
    };
  }));
  const published = new Set(CURRENT_WORLD.clubs.filter(({ roster }) => roster.status === "listed" && roster.scope !== "competition-athletes").map(({ id }) => id));
  const players: WorldPlayer[] = CURRENT_WORLD.players.flatMap((player) => {
    if (!player.positionGroup || !published.has(player.clubId)) return [];
    const id = `catalog:${player.id}`;
    const overall = 48 + hash(`${seed}:${id}`) % 23;
    const age = player.dateOfBirth ? year - Number(player.dateOfBirth.slice(0, 4)) - Number(player.dateOfBirth.slice(5) > "02-01") : null;
    if (age !== null && age >= 40) return [];
    return [{
      id, name: player.name, clubId: player.clubId, position: player.positionGroup, age,
      overall, potential: overall + 10, sourcePlayerId: player.id,
    }];
  });
  const rosters = rostersFor(clubs, players);
  for (const club of clubs) {
    const roster = rosters.get(club.id)!;
    for (const position of WORLD_POSITIONS) {
      const present = roster.filter((player) => player.position === position).length;
      for (let index = present; index < targetCounts[position]; index++) {
        const player = newPlayer(club.id, position, year, index, seed, false);
        players.push(player);
        roster.push(player);
      }
    }
    club.needs = rosterNeeds(roster);
    const level = averageOverall(roster);
    club.objective = level >= 64 ? "title" : level >= 58 ? "first-half" : "survival";
  }
  return { version: 1, year, seed, players, clubs, news: [] };
}

export function worldStrengths(world: DynamicWorld): Record<string, number> {
  return Object.fromEntries([...rostersFor(world.clubs, world.players)].map(([id, roster]) => [id, averageOverall(roster)]));
}

export function advanceDynamicWorld(previous: DynamicWorld, year: number): DynamicWorld {
  if (year <= previous.year) return previous;
  const clubs = previous.clubs.map((club) => ({ ...club }));
  const news: DynamicWorld["news"] = [];
  const players = previous.players.flatMap((player) => {
    const age = player.age === null ? null : player.age + year - previous.year;
    const roll = hash(`${previous.seed}:${year}:${player.id}`) % 100;
    if (age !== null && (age >= 40 || age >= 36 && roll < 22)) {
      news.push({ year, kind: "retirement", name: player.name, clubId: player.clubId });
      return [];
    }
    const change = age === null ? 0 : age <= 23 ? (roll < 70 ? 2 : 1) : age <= 29 ? Number(roll < 45) : age >= 34 ? -2 : 0;
    return [{ ...player, age, overall: Math.max(18, Math.min(player.potential, player.overall + change)) }];
  });

  const rosters = rostersFor(clubs, players);
  const traded = new Set<string>();
  for (const [index, club] of clubs.entries()) {
    const home = rosters.get(club.id)!;
    const need = rosterNeeds(home);
    const prospect = hash(`${previous.seed}:${year}:${club.id}:mercado`) % 257;
    const partner = clubs[(prospect + index) % clubs.length];
    const away = rosters.get(partner.id)!;
    const candidates = away.filter(({ id, position }) => !traded.has(id) && position === need);
    const best = candidates.reduce<WorldPlayer | undefined>((current, player) => !current || player.overall > current.overall ? player : current, undefined);
    if (club.id !== partner.id && club.region === partner.region && best && candidates.length >= targetCounts[need] && prospect % 3 !== 0) {
      const fee = 80_000 + (best.overall - 18) * 12_000;
      if (club.budget >= fee) {
        partner.budget = Math.min(100_000_000, partner.budget + fee);
        club.budget -= fee;
        away.splice(away.indexOf(best), 1);
        best.clubId = club.id;
        home.push(best);
        traded.add(best.id);
        news.push({ year, kind: "transfer", name: best.name, clubId: club.id, fromClubId: partner.id, fee });
      }
    }
  }

  for (const [index, club] of clubs.entries()) {
    const roster = rosters.get(club.id)!;
    for (const position of WORLD_POSITIONS) {
      const present = roster.filter((player) => player.position === position).length;
      for (let fill = present; fill < targetCounts[position]; fill++) {
        const player = newPlayer(club.id, position, year, fill, previous.seed, true);
        players.push(player);
        roster.push(player);
        news.push({ year, kind: "debut", name: player.name, clubId: club.id });
      }
    }
    if (index % 11 === year % 11 && index + 1 < clubs.length && club.region === clubs[index + 1].region) {
      const partner = clubs[index + 1];
      [club.coach, partner.coach] = [partner.coach, club.coach];
      news.push({ year, kind: "coach", name: club.coach.name, clubId: club.id, fromClubId: partner.id });
      news.push({ year, kind: "coach", name: partner.coach.name, clubId: partner.id, fromClubId: club.id });
    }
    club.needs = rosterNeeds(roster);
    const level = averageOverall(roster);
    club.objective = level >= 65 ? "title" : level >= 59 ? "first-half" : "survival";
    club.budget = Math.min(100_000_000, club.budget + 200_000);
  }

  const events = (["transfer", "coach", "retirement", "debut"] as const).flatMap((kind) =>
    news.filter((item) => item.kind === kind).slice(0, 20));
  return { ...previous, year, players, clubs, news: [...events, ...previous.news].slice(0, 140) };
}
