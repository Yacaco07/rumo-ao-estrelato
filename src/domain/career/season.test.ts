import { describe, expect, it } from "vitest";
import { createEmptyDraft } from "@/domain/athlete/athlete";
import { CURRENT_WORLD } from "@/data/world/current-world";
import { applySeasonAction, buildCalendar, createSeason, readSeason, type SeasonProfile } from "./season";
import { seasonSchema, SEASON_ROUNDS } from "./season-schema";

const catalog = {
  worldVersion: CURRENT_WORLD.version,
  clubs: CURRENT_WORLD.clubs.map(({ id, name }) => ({ id, name })),
};
const profile: SeasonProfile = {
  createdAt: "2026-11-17T12:00:00.000Z",
  athlete: { ...createEmptyDraft(), name: "Alex", allocation: { shooting: 10 } },
  contract: {
    clubId: "br-palmeiras", clubName: "Palmeiras", catalogVersion: CURRENT_WORLD.version,
    months: 24, monthlySalary: 4400, role: "development",
  },
};

describe("Primeira temporada", () => {
  it("organiza 380 confrontos únicos em 38 rodadas com ida e volta", () => {
    const calendar = buildCalendar(catalog.clubs);
    expect(calendar).toHaveLength(38);
    for (const round of calendar) {
      expect(round).toHaveLength(10);
      expect(new Set(round.flatMap(({ home, away }) => [home.id, away.id])).size).toBe(20);
    }
    const matches = calendar.flat();
    const pairings = new Set(matches.map(({ home, away }) => `${home.id}:${away.id}`));
    expect(pairings.size).toBe(380);
    for (const { home, away } of matches) expect(pairings.has(`${away.id}:${home.id}`)).toBe(true);
    for (const club of catalog.clubs) expect(matches.filter(({ home }) => home.id === club.id)).toHaveLength(19);
  });

  it("valida participantes e registra uma preparação por rodada", () => {
    expect(createSeason(profile, { ...catalog, clubs: catalog.clubs.slice(1) })).toBeNull();
    expect(createSeason({ ...profile, contract: { ...profile.contract, clubId: "br-missing" } }, catalog)).toBeNull();
    const season = createSeason(profile, catalog)!;
    const trained = applySeasonAction(season, { type: "train", training: "physical" });
    if (!trained.ok) throw new Error(trained.message);
    expect(readSeason(trained.season)).toMatchObject({ xp: 11, fatigue: 16 });
    expect(applySeasonAction(trained.season, { type: "train", training: "recovery" }).ok).toBe(false);
    const played = applySeasonAction(trained.season, { type: "play" });
    if (!played.ok) throw new Error(played.message);
    expect(played.season).toMatchObject({ rounds: ["physical"], preparation: null });
    expect(readSeason(played.season)).toEqual(readSeason(seasonSchema.parse(played.season)));
  });

  it.each(["ST", "GK"] as const)("simula toda a temporada de %s e conserva placares e pontos", (position) => {
    const fixtureProfile: SeasonProfile = {
      ...profile,
      athlete: { ...profile.athlete, position, allocation: position === "GK" ? { reflexes: 10 } : { shooting: 10 } },
    };
    const initial = createSeason(fixtureProfile, catalog)!;
    let season = initial;
    for (let index = 0; index < SEASON_ROUNDS; index++) {
      const trained = applySeasonAction(season, { type: "train", training: index % 3 === 0 ? "recovery" : "technical" });
      if (!trained.ok) throw new Error(trained.message);
      const played = applySeasonAction(trained.season, { type: "play" });
      if (!played.ok) throw new Error(played.message);
      season = played.season;
    }
    const recap = readSeason(season);
    expect(recap.last?.number).toBe(38);
    expect(recap.next).toBeUndefined();
    expect(recap.rounds.every(({ played }) => played?.results.length === 10)).toBe(true);
    expect(recap.rounds[0].played?.appearance.minutes).toBeGreaterThan(0);
    expect(recap.stats.appearances).toBeGreaterThan(0);
    expect(recap.overall).toBeGreaterThan(readSeason(initial).overall);
    expect(recap.fatigue).toBeGreaterThanOrEqual(0);
    expect(recap.fatigue).toBeLessThanOrEqual(100);
    expect(applySeasonAction(season, { type: "play" }).ok).toBe(false);
    expect(recap.standings.reduce((sum, row) => sum + row.scored - row.conceded, 0)).toBe(0);

    for (const row of recap.standings) {
      expect(row.played).toBe(38);
      expect(row.wins + row.draws + row.losses).toBe(38);
      expect(row.points).toBe(row.wins * 3 + row.draws);
    }
    for (const { played } of recap.rounds) {
      const { appearance, match } = played!;
      const [scored, conceded] = match.home.id === profile.contract.clubId ? [match.homeGoals, match.awayGoals] : [match.awayGoals, match.homeGoals];
      expect(appearance.goals + appearance.assists).toBeLessThanOrEqual(scored);
      expect(appearance.minutes).toBeLessThanOrEqual(90);
      if (appearance.cleanSheet) expect(conceded).toBe(0);
      if (appearance.minutes === 0) expect(appearance.rating).toBeNull();
    }
  });
});
