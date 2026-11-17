import { describe, expect, it } from "vitest";
import { createEmptyDraft, type SavedAthlete } from "@/domain/athlete/athlete";
import { CURRENT_WORLD } from "@/data/world/current-world";
import { applyCareerAction, careerDate, seasonYear } from "./career-clock";
import { createSeason, readSeason } from "./season";

const createdAt = "2026-11-17T12:00:00Z";
const profile = {
  schemaVersion: 1,
  id: "athlete-profile",
  revision: 1,
  status: "ready",
  createdAt,
  updatedAt: createdAt,
  athlete: { ...createEmptyDraft(), name: "Alex", allocation: { shooting: 10 } },
  contract: {
    clubId: "br-palmeiras", clubName: "Palmeiras", catalogVersion: CURRENT_WORLD.version,
    months: 24, monthlySalary: 4400, role: "rotation", signedAt: createdAt,
  },
} satisfies SavedAthlete;

const season = createSeason(profile, {
  worldVersion: CURRENT_WORLD.version, clubs: CURRENT_WORLD.clubs.map(({ id, name }) => ({ id, name })),
})!;

describe("Relógio da carreira", () => {
  it("processa exatamente as partidas até a data e nunca volta", () => {
    const result = applyCareerAction(profile, season, { type: "advance", until: "2026-02-09" });
    if (!result.ok) throw new Error(result.message);
    expect(result.season.rounds).toEqual([null, null]);
    expect(careerDate(result.season)).toBe("2026-02-09");
    expect(applyCareerAction(profile, result.season, { type: "advance", until: "2026-02-09" }).ok).toBe(false);
    const next = applyCareerAction(profile, result.season, { type: "advance", until: "next" });
    if (!next.ok) throw new Error(next.message);
    expect(next.season.rounds).toHaveLength(3);
    expect(readSeason(next.season).last?.date).toBe("2026-02-15");
  });

  it("arquiva a edição em 38 rodadas e atravessa semanas sem jogos", () => {
    const result = applyCareerAction(profile, season, { type: "advance", until: "2026-10-18" });
    if (!result.ok) throw new Error(result.message);
    expect(result.pastSeasons).toHaveLength(1);
    expect(result.pastSeasons[0].rounds).toHaveLength(38);
    expect(seasonYear(result.season)).toBe(2027);
    expect(result.season.rounds).toHaveLength(0);
    const next = applyCareerAction({ ...profile, pastSeasons: result.pastSeasons }, result.season, { type: "advance", until: "week" });
    if (!next.ok) throw new Error(next.message);
    expect(next.season.rounds).toHaveLength(0);
    expect(next.pastSeasons).toHaveLength(1);
    expect(careerDate(next.season)).toBe("2026-10-25");
  });
});
