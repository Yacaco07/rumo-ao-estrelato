import { describe, expect, it } from "vitest";
import { CURRENT_WORLD } from "@/data/world/current-world";
import { advanceDynamicWorld, createDynamicWorld, worldStrengths } from "./dynamic-world";
import { dynamicWorldSchema } from "./dynamic-world-schema";
import { BRAZIL_B_CLUBS } from "./world-competitions";
import type { Season } from "./season-schema";

const season: Season = {
  rulesVersion: 1, worldVersion: CURRENT_WORLD.version, seed: 123, year: 2026,
  clubs: CURRENT_WORLD.clubs.map(({ id, name }) => ({ id, name })), brazilB: BRAZIL_B_CLUBS,
  rounds: [], preparation: null, player: { clubId: "br-palmeiras", position: "GK", initialOverall: 55, role: "rotation" },
};

describe("Mundo dinâmico", () => {
  it("aplica transferências, envelhecimento, aposentadorias e técnicos uma vez por edição", () => {
    const original = createDynamicWorld(season);
    expect(original.clubs).toHaveLength(258);
    expect(dynamicWorldSchema.parse(original)).toEqual(original);
    const next = advanceDynamicWorld(original, 2027);
    expect(dynamicWorldSchema.parse(next)).toEqual(next);
    expect(advanceDynamicWorld(next, 2027)).toBe(next);
    expect(advanceDynamicWorld(original, 2027)).toEqual(next);
    expect(next.news.some(({ kind }) => kind === "debut")).toBe(true);
    expect(next.news.some(({ kind }) => kind === "retirement")).toBe(true);
    expect(next.news.some(({ kind }) => kind === "coach")).toBe(true);
    expect(next.news.some(({ kind }) => kind === "transfer")).toBe(true);
    expect(next.players.some((player) => player.sourcePlayerId && player.age === null)).toBe(true);
    const oldList = new Map(original.players.map((player) => [player.id, player]));
    for (const player of next.players) {
      const oldPlayer = oldList.get(player.id);
      if (oldPlayer && oldPlayer.age !== null) expect(player.age).toBe(oldPlayer.age + 1);
      expect(player.overall).toBeLessThanOrEqual(player.potential);
    }
    expect(worldStrengths(next)).not.toEqual(worldStrengths(original));
  });

  it("mantém elencos reconhecíveis e inscrições únicas após doze temporadas", () => {
    let world = createDynamicWorld(season);
    for (let year = 2027; year <= 2038; year++) world = advanceDynamicWorld(world, year);
    expect(dynamicWorldSchema.safeParse(world).success).toBe(true);
    expect(new Set(world.players.map(({ clubId }) => clubId)).size).toBe(258);
    expect(world.news.length).toBeLessThanOrEqual(140);
    expect(world.players.some(({ id }) => id.includes(":2038:"))).toBe(true);
    expect(JSON.stringify(world).length).toBeLessThan(2_000_000);
  });
});
