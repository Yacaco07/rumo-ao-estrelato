import { describe, expect, it } from "vitest";
import { createEmptyDraft, savedAthleteSchema } from "@/domain/athlete/athlete";
import { CURRENT_WORLD } from "@/data/world/current-world";
import { applyCareerAction } from "./career-clock";
import { registrationAt } from "./registration";
import { createSeason, readSeason } from "./season";
import type { SeasonAction } from "./season-schema";

const createdAt = "2026-11-17T12:00:00Z";
const first = savedAthleteSchema.parse({
  schemaVersion: 1, id: "athlete-profile", revision: 1, createdAt, updatedAt: createdAt,
  status: "ready", athlete: { ...createEmptyDraft(), name: "BH", allocation: { shooting: 10 } },
  contract: {
    clubId: "br-palmeiras", clubName: "Palmeiras", catalogVersion: CURRENT_WORLD.version,
    months: 24, monthlySalary: 4400, role: "rotation", signedAt: createdAt,
  },
});
const profile = { ...first, contract: first.contract! };
const season = createSeason(profile, {
  worldVersion: CURRENT_WORLD.version, clubs: CURRENT_WORLD.clubs.map(({ id, name }) => ({ id, name })),
})!;
const initial = { ...profile, season };

function advance(state: typeof initial, action: SeasonAction) {
  const result = applyCareerAction(state, state.season, action);
  if (!result.ok) throw new Error(result.message);
  const next = { ...state, season: result.season, market: result.market, contract: result.contract, pastSeasons: result.pastSeasons };
  savedAthleteSchema.parse(next);
  return next;
}

describe("Mercado durante a carreira", () => {
  it("recebe, recusa e aceita transferência somente com anuência do clube", () => {
    const requested = advance(initial, { type: "market", action: { kind: "request", request: "transfer" } });
    const played = advance(requested, { type: "advance", until: "week" });
    const offered = played.market.offers;
    expect(offered).toHaveLength(3);
    expect(applyCareerAction(played, played.season, { type: "market", action: { kind: "accept", offerId: offered[2].id } }).ok).toBe(false);
    const refused = advance(played, { type: "market", action: { kind: "reject", offerId: offered[1].id } });
    const moved = advance(refused, { type: "market", action: { kind: "accept", offerId: offered[0].id } });
    expect(moved.contract.clubId).toBe(offered[0].terms.clubId);
    expect(registrationAt(moved.season, 1).clubId).toBe(moved.contract.clubId);
    expect(readSeason(moved.season).rounds[0]).toEqual(readSeason(played.season).rounds[0]);
    expect(moved.market.moves).toHaveLength(1);
  });

  it("inscreve atleta emprestado e devolve ao clube de origem no prazo", () => {
    const requested = advance(initial, { type: "market", action: { kind: "request", request: "loan" } });
    const played = advance(requested, { type: "advance", until: "week" });
    const loan = advance(played, { type: "market", action: { kind: "accept", offerId: played.market.offers[0].id } });
    expect(loan.contract).toEqual(profile.contract);
    expect(registrationAt(loan.season, 1).clubId).toBe(loan.market.loan?.clubId);
    const returned = advance(loan, { type: "advance", until: loan.market.loan!.dueOn });
    expect(returned.market.loan).toBeUndefined();
    expect(registrationAt(returned.season, returned.season.rounds.length).clubId).toBe(profile.contract.clubId);
    expect(returned.market.moves.map(({ kind }) => kind)).toEqual(["loan", "return"]);
  });
});
