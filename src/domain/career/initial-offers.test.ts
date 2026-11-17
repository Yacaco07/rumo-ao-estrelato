import { describe, expect, it } from "vitest";
import { CURRENT_WORLD } from "@/data/world/current-world";
import { createEmptyDraft, type SavedAthlete } from "@/domain/athlete/athlete";
import { getPosition, POSITION_KEYS, type Position } from "@/domain/athlete/positions";
import { buildOfferCatalog, createInitialOffers } from "./initial-offers";

const catalog = buildOfferCatalog(CURRENT_WORLD);

function profile(position: Position, age = 17): SavedAthlete {
  return {
    schemaVersion: 1,
    id: "athlete-profile",
    revision: 1,
    status: "ready",
    createdAt: "2026-11-17T12:00:00Z",
    updatedAt: "2026-11-17T12:00:00Z",
    athlete: {
      ...createEmptyDraft(),
      name: "Alex",
      position,
      age,
      allocation: { [getPosition(position).attributes[0]]: 10 },
    },
  };
}

describe("Propostas iniciais", () => {
  it("usa relações da Série A e exclui as duas listas da competição", () => {
    expect(catalog.clubs).toHaveLength(18);
    expect(catalog.clubs.map(({ id }) => id)).not.toContain("br-corinthians");
    expect(catalog.clubs.map(({ id }) => id)).not.toContain("br-athletico-paranaense");
    expect(catalog.clubs.find(({ id }) => id === "br-remo")?.positionCounts.goalkeeper).toBe(
      CURRENT_WORLD.players.filter(({ clubId, positionGroup }) => clubId === "br-remo" && positionGroup === "goalkeeper").length,
    );
  });

  it("exclui relações pendentes ou com posição desconhecida", () => {
    const clubs = CURRENT_WORLD.clubs.map((club) => club.id === "br-flamengo"
      ? { ...club, roster: { ...club.roster, status: "pending" as const } } : club);
    const players = CURRENT_WORLD.players.map((player) => player.clubId === "br-palmeiras"
      ? { ...player, positionGroup: null } : player);
    const candidates = buildOfferCatalog({ ...CURRENT_WORLD, clubs, players });
    expect(candidates.clubs).toHaveLength(16);
  });

  it.each(POSITION_KEYS)("mapeia %s e seleciona cinco clubes distintos com menor concorrência no setor", (position) => {
    const sectors = ["goalkeeper", "defender", "defender", "midfielder", "midfielder", "midfielder", "forward", "forward"] as const;
    const sector = sectors[POSITION_KEYS.indexOf(position)];
    const result = createInitialOffers(profile(position), catalog);
    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;

    expect(result.sector).toBe(sector);
    expect(new Set(result.offers.map(({ clubId }) => clubId)).size).toBe(5);
    const expectedCounts = catalog.clubs.map(({ positionCounts }) => positionCounts[sector]).sort((a, b) => a - b).slice(0, 5);
    expect(result.offers.map(({ sectorPlayers }) => sectorPlayers)).toEqual(expectedCounts);
  });

  it("desempata de forma estável e produz termos simulados válidos", () => {
    const athlete = profile("CM", 23);
    const result = createInitialOffers(athlete, catalog);
    const reordered = { ...catalog, clubs: [...catalog.clubs].reverse() };
    expect(createInitialOffers(athlete, reordered)).toEqual(result);
    expect(result).toMatchObject({ offers: [
      { months: 12, role: "crucial" }, { months: 12, role: "rotation" },
      { months: 12, role: "rotation" }, { months: 12, role: "alternative" }, { months: 12, role: "alternative" },
    ] });
  });

  it("aguarda a conclusão do atleta e requer cinco candidatos", () => {
    expect(createInitialOffers(null, catalog)).toEqual({ status: "profile-required" });
    expect(createInitialOffers({ ...profile("GK"), status: "draft" }, catalog)).toEqual({ status: "profile-required" });
    expect(createInitialOffers(profile("GK"), { ...catalog, clubs: catalog.clubs.slice(0, 4) }))
      .toEqual({ status: "insufficient-clubs" });
  });
});
