import type { Season } from "./season-schema";

export function registrationAt(season: Season, round: number) {
  const latest = season.registrations?.findLast((registration) => registration.fromRound <= round);
  return latest ?? { clubId: season.player.clubId, role: season.player.role };
}

export function switchRegistration(season: Season, change: Pick<Season["player"], "clubId" | "role">): Season {
  const fromRound = season.rounds.length;
  return {
    ...season,
    registrations: [
      ...(season.registrations ?? []).filter((entry) => entry.fromRound < fromRound),
      { clubId: change.clubId, role: change.role, fromRound },
    ],
  };
}
