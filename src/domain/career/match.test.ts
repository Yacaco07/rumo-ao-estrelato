import { describe, expect, it } from "vitest";
import { buildCalendar, readSeason } from "./season";
import { LEAGUE_SIZE, SEASON_ROUNDS, type Season } from "./season-schema";

const clubs = Array.from({ length: LEAGUE_SIZE }, (_, index) => ({ id: `club-${index}`, name: `Clube ${index}` }));
const season: Season = {
  rulesVersion: 1,
  clubs,
  worldVersion: "test",
  player: { clubId: clubs[0].id, position: "GK", initialOverall: 65, role: "rotation" },
  rounds: Array(SEASON_ROUNDS).fill("physical"),
  preparation: null,
  seed: 662,
};

describe("Partidas e lances", () => {
  it("conserva todos os gols, assistências, notas e cartões por rodada", () => {
    const edition = readSeason({ ...season, detailedFrom: 0 });
    for (const { played } of edition.rounds) {
      const { appearance, events, match } = played!;
      expect(events.filter((event) => event.kind === "goal" && event.clubId === match.home.id)).toHaveLength(match.homeGoals);
      expect(events.filter((event) => event.kind === "goal" && event.clubId === match.away.id)).toHaveLength(match.awayGoals);
      expect(events.filter((event) => event.kind === "save")).toHaveLength(appearance.saves);
      expect(events.filter((event) => event.assist)).toHaveLength(appearance.assists);
      expect(events.filter((event) => event.kind === "goal" && event.player)).toHaveLength(appearance.goals);
      expect(events.every(({ minute }, index) => minute >= 1 && minute <= 90 && (!index || events[index - 1].minute <= minute))).toBe(true);
      if (appearance.absence) {
        expect(appearance).toMatchObject({ minutes: 0, rating: null, goals: 0, assists: 0, saves: 0 });
        expect(events.every((event) => !event.player && !event.assist)).toBe(true);
      }
    }
  });

  it("suspende a próxima partida e impede minutos durante toda a lesão", () => {
    const results = Array.from({ length: 6 }, (_, index) =>
      readSeason({ ...season, seed: season.seed + index, detailedFrom: 0, startingSuspension: 1 }));
    expect(results.every(({ rounds }) => rounds[0].played?.appearance.absence === "suspended")).toBe(true);
    for (const { rounds } of results) {
      rounds.forEach(({ played }, index) => {
        for (let offset = 1; offset <= (played?.appearance.injuryGames ?? 0) && index + offset < SEASON_ROUNDS; offset++) {
          expect(rounds[index + offset].played?.appearance).toMatchObject({ absence: "injured", minutes: 0 });
        }
        if (played?.appearance.red && rounds[index + 1]) {
          expect(rounds[index + 1].played?.appearance).toMatchObject({ absence: "suspended", minutes: 0 });
        }
      });
    }
    expect(results.some(({ rounds }) => rounds.some(({ played }) => played?.appearance.injuryGames))).toBe(true);
    expect(results.some(({ rounds }) => rounds.some(({ played }) => played?.appearance.red))).toBe(true);
  });

  it("preserva os resultados de partidas antigas ao começar a usar lances novos", () => {
    const before = readSeason(season);
    const after = readSeason({ ...season, detailedFrom: 8 });
    expect(after.rounds.slice(0, 8)).toEqual(before.rounds.slice(0, 8));
    expect(after.rounds[0].fixture).toEqual(buildCalendar(clubs)[0][0]);
  });
});
