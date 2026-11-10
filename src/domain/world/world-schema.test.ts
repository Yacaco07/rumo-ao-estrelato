import { describe, expect, it } from "vitest";
import rawWorld from "@/data/world/br-serie-a-2026.json";
import { parseWorldSnapshot, positionGroupFromLabel, worldSnapshotSchema, type WorldSnapshot } from "./world-schema";
import { filterWorldClubs, getWorldCoverage } from "./world-queries";

function fixture(): WorldSnapshot {
  return {
    schemaVersion: 1, id: "test-world", version: "1", asOfDate: "2026-11-10", reviewedOn: "2026-11-10",
    reviewedBy: "Fixture de teste; entidades fictícias", gameplayReady: false,
    sources: [
      { id: "test-competition-source", publisher: "Fonte de teste", url: "https://example.test/competition", kind: "competition-list", subjectId: "test-competition", season: "2026", accessedOn: "2026-11-10", updatedOn: null, fields: ["clubName", "competitionMembership"], notes: "Fixture" },
      { id: "test-roster-source", publisher: "Fonte de teste", url: "https://example.test/roster", kind: "squad-list", subjectId: "test-alpha", season: null, accessedOn: "2026-11-10", updatedOn: null, fields: ["playerName", "playerClub", "positionLabel", "shirtNumber"], notes: "Fixture" },
    ],
    competitions: [{ id: "test-competition", leagueId: "test-league", name: "Liga de teste", season: "2026", countryCode: "BR", expectedClubCount: 2, sourceId: "test-competition-source" }],
    clubs: [
      { id: "test-alpha", name: "Álpha", competitionId: "test-competition", provenance: { name: "test-competition-source", competitionId: "test-competition-source" }, roster: { status: "listed", sourceId: "test-roster-source", sourceListedCount: 2, registrationVerified: false, notes: "Fixture" }, crest: null },
      { id: "test-beta", name: "Beta", competitionId: "test-competition", provenance: { name: "test-competition-source", competitionId: "test-competition-source" }, roster: { status: "pending", sourceId: null, sourceListedCount: null, registrationVerified: false, notes: "Fixture" }, crest: null },
    ],
    players: [
      { id: "test-player-1", name: "Atleta Um", clubId: "test-alpha", positionLabel: "Goleiro", positionGroup: "goalkeeper", shirtNumber: 1, nationality: null, dateOfBirth: null, provenance: { name: "test-roster-source", clubId: "test-roster-source", positionLabel: "test-roster-source", shirtNumber: "test-roster-source", nationality: null, dateOfBirth: null } },
      { id: "test-player-2", name: "Atleta Dois", clubId: "test-alpha", positionLabel: "Atacante", positionGroup: "forward", shirtNumber: 10, nationality: null, dateOfBirth: null, provenance: { name: "test-roster-source", clubId: "test-roster-source", positionLabel: "test-roster-source", shirtNumber: "test-roster-source", nationality: null, dateOfBirth: null } },
    ],
  };
}

describe("Importação do universo", () => {
  it("valida o snapshot distribuído sem completar dados desconhecidos", () => {
    const world = parseWorldSnapshot(rawWorld);
    expect(world.gameplayReady).toBe(false);
    expect(world.players.every((player) => player.nationality === null && player.dateOfBirth === null)).toBe(true);
    expect(world.clubs.every((club) => club.crest === null && !club.roster.registrationVerified)).toBe(true);
    expect(world.players.every((player) => player.clubId === "br-palmeiras")).toBe(true);
    expect(getWorldCoverage(world).pendingRosters + getWorldCoverage(world).listedRosters).toBe(world.clubs.length);
  });

  it("aceita uma relação publicada sem inventar temporada ou atualização da fonte", () => {
    const world = parseWorldSnapshot(fixture());
    expect(world.sources[1].season).toBeNull();
    expect(world.sources[1].updatedOn).toBeNull();
    expect(world.clubs[1].roster.sourceListedCount).toBeNull();
  });

  const invalid: [string, (world: WorldSnapshot) => void][] = [
    ["IDs repetidos", (world) => { world.players[1].id = world.players[0].id; }],
    ["fontes repetidas", (world) => { world.sources.push(world.sources[0]); }],
    ["clube sem competição", (world) => { world.clubs[0].competitionId = "missing"; }],
    ["jogador sem clube", (world) => { world.players[0].clubId = "missing"; }],
    ["fonte inexistente", (world) => { world.players[0].provenance.name = "missing"; }],
    ["fonte de outro assunto", (world) => { world.players[0].provenance.name = "test-competition-source"; }],
    ["fato sem fonte", (world) => { world.players[0].nationality = "Brasil"; }],
    ["campo desconhecido com fonte", (world) => { world.players[0].provenance.dateOfBirth = "test-roster-source"; }],
    ["fonte sem o campo declarado", (world) => { world.sources[1].fields = ["playerClub"]; }],
    ["fonte consultada após o corte", (world) => { world.sources[0].accessedOn = "2026-11-11"; }],
    ["atualização posterior à consulta", (world) => { world.sources[0].updatedOn = "2026-11-11"; }],
    ["revisão anterior ao corte", (world) => { world.reviewedOn = "2026-11-09"; }],
    ["temporada divergente", (world) => { world.sources[0].season = "2025"; }],
    ["cobertura de clubes incorreta", (world) => { world.competitions[0].expectedClubCount = 3; }],
    ["lista de jogadores incompleta", (world) => { world.clubs[0].roster.sourceListedCount = 3; }],
    ["elenco pendente com lista", (world) => { world.clubs[0].roster.status = "pending"; }],
    ["camisa repetida no clube", (world) => { world.players[1].shirtNumber = 1; }],
    ["camisa fora do intervalo", (world) => { world.players[0].shirtNumber = 0; }],
    ["posição inferida indevidamente", (world) => { world.players[1].positionGroup = "midfielder"; }],
    ["nome duplicado com diferenças de acento e caixa", (world) => { world.players[1].name = "ATLETA ÚM"; }],
    ["URL não segura", (world) => { world.sources[0].url = "javascript:alert(1)"; }],
    ["campo extra sem contrato", (world) => { Object.assign(world.players[0], { salary: 50000 }); }],
    ["liberação indevida de carreira", (world) => { Object.assign(world, { gameplayReady: true }); }],
  ];

  it.each(invalid)("rejeita %s", (_name, mutate) => {
    const world = fixture();
    mutate(world);
    expect(worldSnapshotSchema.safeParse(world).success).toBe(false);
  });

  it("permite a mesma camisa em clubes diferentes", () => {
    const world = fixture();
    world.sources.push({ ...world.sources[1], id: "test-beta-source", subjectId: "test-beta" });
    world.clubs[0].roster.sourceListedCount = 1;
    world.clubs[1].roster = { status: "listed", sourceId: "test-beta-source", sourceListedCount: 1, registrationVerified: false, notes: "Fixture" };
    world.players[1] = { ...world.players[1], clubId: "test-beta", shirtNumber: 1, provenance: { name: "test-beta-source", clubId: "test-beta-source", positionLabel: "test-beta-source", shirtNumber: "test-beta-source", nationality: null, dateOfBirth: null } };
    expect(worldSnapshotSchema.safeParse(world).success).toBe(true);
  });

  it("mantém camisa e posição desconhecidas como null", () => {
    const world = fixture();
    Object.assign(world.players[0], { shirtNumber: null, positionLabel: null, positionGroup: null });
    Object.assign(world.players[0].provenance, { shirtNumber: null, positionLabel: null });
    expect(parseWorldSnapshot(world).players[0].shirtNumber).toBeNull();
  });

  it("não transforma uma categoria ampla em posição específica", () => {
    expect(positionGroupFromLabel("Atacante")).toBe("forward");
    expect(positionGroupFromLabel("Goleiro")).toBe("goalkeeper");
    expect(positionGroupFromLabel("Função desconhecida")).toBeNull();
  });
});

describe("Consulta do catálogo", () => {
  it("combina texto e cobertura, ignorando acentos e preservando o snapshot", () => {
    const world = fixture();
    const original = JSON.stringify(world);
    expect(filterWorldClubs(world, "ALPHA", "listed").map((club) => club.id)).toEqual(["test-alpha"]);
    expect(filterWorldClubs(world, "alpha", "pending")).toEqual([]);
    expect(filterWorldClubs(world, "", "pending").map((club) => club.id)).toEqual(["test-beta"]);
    expect(filterWorldClubs(world, "inexistente")).toEqual([]);
    expect(JSON.stringify(world)).toBe(original);
  });

  it("separa cobertura desconhecida de relação publicada", () => {
    const coverage = getWorldCoverage(fixture());
    expect(coverage).toMatchObject({ clubs: 2, listedRosters: 1, pendingRosters: 1, players: 2 });
  });
});
