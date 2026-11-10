import { normalizeWorldText, type WorldClub, type WorldSnapshot } from "./world-schema";

export type RosterFilter = "all" | "listed" | "pending";

export function filterWorldClubs(world: WorldSnapshot, query: string, rosterFilter: RosterFilter = "all"): WorldClub[] {
  const search = normalizeWorldText(query);
  return world.clubs.filter((club) => normalizeWorldText(club.name).includes(search)
    && (rosterFilter === "all" || club.roster.status === rosterFilter))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export function getClubPlayers(world: WorldSnapshot, clubId: string) {
  return world.players.filter((player) => player.clubId === clubId);
}

export function getWorldCoverage(world: WorldSnapshot) {
  return {
    competitions: world.competitions.length,
    clubs: world.clubs.length,
    players: world.players.length,
    listedRosters: world.clubs.filter((club) => club.roster.status === "listed").length,
    pendingRosters: world.clubs.filter((club) => club.roster.status === "pending").length,
  };
}
