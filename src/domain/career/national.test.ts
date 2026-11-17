import { describe, expect, it } from "vitest";
import { createEmptyDraft } from "@/domain/athlete/athlete";
import { advanceNationalCareer, findNation, nationalEligible, nationalTournaments } from "./national";
import { nationalCareerSchema } from "./national-schema";
import { LEAGUE_SIZE, type Season } from "./season-schema";
import { readSeason } from "./season";

const clubs = Array.from({ length: LEAGUE_SIZE }, (_, index) => ({ id: `club-${index}`, name: `Clube ${index}` }));
const athlete = { ...createEmptyDraft(), name: "BH", nationality: "Brasil", position: "GK" as const };
const season: Season = {
  rulesVersion: 1, year: 2026, seed: 13, worldVersion: "test", clubs, rounds: [], preparation: null,
  player: { clubId: clubs[0].id, initialOverall: 60, position: "GK", role: "crucial" },
};
const base = readSeason(season);
const form = { ...base, stats: { ...base.stats, minutes: 600, average: 7.4 }, trust: 76 };
const empty = { matches: [], trophies: [] };

describe("Convocações de seleções", () => {
  it("identifica nacionalidade, forma e disponibilidade", () => {
    expect(findNation(" BRAZIL ")?.name).toBe("Brasil");
    expect(nationalEligible(athlete, base)).toBe(false);
    expect(nationalEligible(athlete, form)).toBe(true);
    expect(nationalEligible(athlete, { ...form, health: { injury: 1, suspension: 0 } })).toBe(false);
    expect(nationalEligible(athlete, { ...form, health: { injury: 0, suspension: 1 } })).toBe(false);
  });

  it("processa amistosos e a Copa com 48 participantes sem duplicar jogos", () => {
    const world = nationalTournaments(2026, "2026-10-10", season.seed)[0];
    expect(world.tables).toHaveLength(12);
    expect(world.tables.flatMap(({ rows }) => rows)).toHaveLength(48);
    expect(world.matches).toHaveLength(103);
    const data = advanceNationalCareer(empty, athlete, form, 2026, "2026-01-01", "2026-10-31", season.seed);
    expect(data.matches.some(({ competitionId }) => competitionId === "friendly")).toBe(true);
    expect(data.matches.some(({ competitionId }) => competitionId === "world-cup")).toBe(true);
    expect(data.matches.every(({ goals, saves, minutes }) => goals === 0 && saves >= 0 && minutes === 90)).toBe(true);
    expect(nationalCareerSchema.parse(data)).toEqual(data);
    expect(advanceNationalCareer(data, athlete, form, 2026, "2026-01-01", "2026-10-31", season.seed)).toEqual(data);
  });
});
