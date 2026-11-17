import { describe, expect, it } from "vitest";
import { createEmptyDraft, savedAthleteSchema } from "@/domain/athlete/athlete";
import { CURRENT_WORLD } from "@/data/world/current-world";
import { applyCareerAction } from "./career-clock";
import { careerHistory } from "./history";
import { createSeason } from "./season";
import type { SeasonAction } from "./season-schema";

const stamp = "2026-11-17T12:00:00Z";
const base = savedAthleteSchema.parse({
  schemaVersion: 1, id: "athlete-profile", revision: 1, createdAt: stamp, updatedAt: stamp,
  status: "ready", athlete: { ...createEmptyDraft(), name: "BH", age: 30, allocation: { shooting: 10 } },
  contract: { clubId: "br-flamengo", clubName: "Flamengo", catalogVersion: CURRENT_WORLD.version,
    role: "crucial", monthlySalary: 4400, months: 36, signedAt: stamp },
});
const profile = { ...base, contract: base.contract! };
const catalog = { worldVersion: CURRENT_WORLD.version, clubs: CURRENT_WORLD.clubs.map(({ id, name }) => ({ id, name })) };
type Profile = typeof profile & { season: NonNullable<typeof base.season> };
function advance(state: Profile, action: SeasonAction): Profile {
  const result = applyCareerAction(state, state.season, action);
  if (!result.ok) throw new Error(result.message);
  return { ...state, ...savedAthleteSchema.parse({
    ...state, season: result.season, contract: result.contract, market: result.market,
    pastSeasons: result.pastSeasons, retiredOn: result.retiredOn,
  }), contract: result.contract, season: result.season };
}

describe("Histórico de várias temporadas", () => {
  it("mantém idade, calendários e números de quatro edições ao reabrir", () => {
    let state = { ...profile, season: createSeason(profile, catalog)! };
    for (const year of [2026, 2027, 2028, 2029]) state = advance(state, { type: "advance", until: `${year}-10-30` });
    const history = careerHistory(state);
    expect(history.editions.map(({ age }) => age)).toEqual([30, 31, 32, 33, 34]);
    expect(history.editions.filter(({ complete }) => complete)).toHaveLength(4);
    expect(history.totals.appearances).toBeGreaterThan(0);
    expect(careerHistory(savedAthleteSchema.parse(JSON.parse(JSON.stringify(state))))).toEqual(history);
    const retired = advance(state, { type: "retire" });
    expect(retired.retiredOn).toBe("2029-10-30");
    expect(careerHistory(retired)).toEqual(history);
    expect(applyCareerAction(retired, retired.season, { type: "advance", until: "week" }).ok).toBe(false);
  });

  it("encerra a carreira no limite de idade e preserva a última edição", () => {
    const older = { ...profile, season: createSeason(profile, catalog, 2037)! };
    const retired = advance(older, { type: "advance", until: "2037-11-01" });
    expect(retired.retiredOn).toBeDefined();
    expect(careerHistory(retired).editions).toMatchObject([{ year: 2037, age: 41, complete: true }]);
  });
});
