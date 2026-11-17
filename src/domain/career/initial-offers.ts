import type { SavedAthlete } from "@/domain/athlete/athlete";
import type { Position } from "@/domain/athlete/positions";
import type { PositionGroup, WorldSnapshot } from "@/domain/world/world-schema";

const OFFER_COUNT = 5;
const GROUP_BY_POSITION: Record<Position, PositionGroup> = {
  GK: "goalkeeper",
  CB: "defender",
  FB: "defender",
  DM: "midfielder",
  CM: "midfielder",
  AM: "midfielder",
  WG: "forward",
  ST: "forward",
};

type OfferClub = {
  id: string;
  name: string;
  positionCounts: Record<PositionGroup, number>;
};

export function buildOfferCatalog(world: WorldSnapshot) {
  const competitions = new Set(world.competitions.filter(({ leagueId }) => leagueId === "br-a").map(({ id }) => id));
  const clubs: OfferClub[] = [];

  for (const club of world.clubs) {
    if (!competitions.has(club.competitionId) || club.roster.status !== "listed" || club.roster.scope === "competition-athletes") continue;

    const players = world.players.filter(({ clubId }) => clubId === club.id);
    if (players.length === 0 || players.length !== club.roster.sourceListedCount || players.some(({ positionGroup }) => positionGroup === null)) continue;

    const positionCounts = { goalkeeper: 0, defender: 0, midfielder: 0, forward: 0 };
    for (const { positionGroup } of players) {
      if (positionGroup !== null) positionCounts[positionGroup]++;
    }
    clubs.push({ id: club.id, name: club.name, positionCounts });
  }

  return { clubs, version: world.version };
}

export type OfferCatalog = ReturnType<typeof buildOfferCatalog>;
type InitialOffer = {
  clubId: string;
  clubName: string;
  sectorPlayers: number;
  months: 12 | 24;
  role: "development" | "rotation";
};

type InitialOffers =
  | { status: "profile-required" }
  | { status: "insufficient-clubs" }
  | { status: "ready"; athlete: SavedAthlete["athlete"]; sector: PositionGroup; offers: InitialOffer[] };

function scoreTie(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  }
  return hash >>> 0;
}

export function createInitialOffers(saved: SavedAthlete | null, catalog: OfferCatalog): InitialOffers {
  if (saved?.status !== "ready") return { status: "profile-required" };

  const { name, position, age } = saved.athlete;
  const sector = GROUP_BY_POSITION[position];
  const seed = JSON.stringify([catalog.version, name, position, age]);
  const candidates = catalog.clubs.map((club) => ({
    club,
    sectorPlayers: club.positionCounts[sector],
    tie: scoreTie(`${seed}:${club.id}`),
  }));
  if (candidates.length < OFFER_COUNT) return { status: "insufficient-clubs" };

  candidates.sort((a, b) => a.sectorPlayers - b.sectorPlayers || a.tie - b.tie || a.club.id.localeCompare(b.club.id, "pt-BR"));

  return {
    status: "ready",
    athlete: saved.athlete,
    sector,
    offers: candidates.slice(0, OFFER_COUNT).map(({ club, sectorPlayers }, index) => ({
      clubId: club.id,
      clubName: club.name,
      sectorPlayers,
      months: age <= 20 ? 24 : 12,
      role: index < 2 ? "rotation" : "development",
    })),
  };
}
