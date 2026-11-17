import { openDB } from "idb";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CURRENT_WORLD } from "@/data/world/current-world";
import { createEmptyDraft } from "@/domain/athlete/athlete";
import { createAthleteRepository } from "./athlete-repository";

describe("Persistência IndexedDB", () => {
  let databaseName: string;
  let repository: ReturnType<typeof createAthleteRepository>;

  beforeEach(() => {
    databaseName = `rae-test-${crypto.randomUUID()}`;
    repository = createAthleteRepository(databaseName);
  });
  afterEach(async () => { vi.unstubAllGlobals(); vi.restoreAllMocks(); await repository.close(); });

  it("começa sem perfil e recupera rascunho após fechar e reabrir a conexão", async () => {
    expect(await repository.read()).toBeNull();
    const draft = { ...createEmptyDraft(), name: "BH Gonçalves", position: "GK" as const, allocation: { reflexes: 4 } };
    const first = await repository.save(draft, "draft", null);
    await repository.close();
    const reopened = createAthleteRepository(databaseName);
    expect(await reopened.read()).toEqual(first);
    await reopened.close();
    expect(first.athlete).toEqual(draft);
    expect(first.revision).toBe(1);
  });

  it("conclui, atualiza a revisão e mantém a data de criação", async () => {
    const first = await repository.save(createEmptyDraft(), "draft", null);
    const next = await repository.save({ ...first.athlete, name: "Ana", allocation: { shooting: 10 } }, "ready", first.revision);
    expect(next.status).toBe("ready");
    expect(next.revision).toBe(2);
    expect(next.createdAt).toBe(first.createdAt);
    expect(await repository.read()).toEqual(next);
  });

  it("não grava nem substitui um perfil com dados inválidos", async () => {
    const first = await repository.save(createEmptyDraft(), "draft", null);
    await expect(repository.save({ ...first.athlete, allocation: { pace: 10, shooting: 1 } }, "draft", first.revision)).rejects.toMatchObject({ code: "invalid" });
    await expect(repository.save(first.athlete, "ready", first.revision)).rejects.toMatchObject({ code: "invalid" });
    expect(await repository.read()).toEqual(first);
  });

  it("impede que uma aba desatualizada sobrescreva ou exclua o perfil da outra aba", async () => {
    const first = await repository.save(createEmptyDraft(), "draft", null);
    const anotherTab = createAthleteRepository(databaseName);
    const latest = await anotherTab.save({ ...first.athlete, name: "Outra aba" }, "draft", first.revision);
    await expect(repository.save({ ...first.athlete, name: "Obsoleto" }, "draft", first.revision)).rejects.toMatchObject({ code: "conflict" });
    await expect(repository.remove(first.revision)).rejects.toMatchObject({ code: "conflict" });
    expect(await repository.read()).toEqual(latest);
    await anotherTab.close();
  });

  it("serializa duas primeiras gravações concorrentes e aceita somente uma", async () => {
    const results = await Promise.allSettled([
      repository.save({ ...createEmptyDraft(), name: "Primeiro" }, "draft", null),
      repository.save({ ...createEmptyDraft(), name: "Segundo" }, "draft", null),
    ]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    const failed = results.find((result) => result.status === "rejected");
    expect(failed && failed.status === "rejected" && failed.reason.code).toBe("conflict");
    expect((await repository.read())?.revision).toBe(1);
  });

  it("fecha um único primeiro contrato em abas concorrentes e protege o vínculo", async () => {
    const athlete = await repository.save(
      { ...createEmptyDraft(), name: "Alex", allocation: { shooting: 10 } }, "ready", null,
    );
    const offer = {
      clubId: "br-remo", clubName: "Remo", catalogVersion: "2026.11.17-01",
      monthlySalary: 4000, months: 24, role: "rotation",
    } as const;
    const anotherTab = createAthleteRepository(databaseName);

    try {
      const results = await Promise.allSettled([
        repository.signContract(offer, athlete),
        anotherTab.signContract({ ...offer, monthlySalary: 4500 }, athlete),
      ]);
      expect(results.filter(({ status }) => status === "fulfilled")).toHaveLength(1);
      expect(results.find(({ status }) => status === "rejected")).toMatchObject({ reason: { code: "conflict" } });
      const signed = (await repository.read())!;
      expect(signed.contract?.clubId).toBe(offer.clubId);
      await expect(repository.signContract(offer, signed)).rejects.toMatchObject({ code: "locked" });
      await expect(repository.save(athlete.athlete, "ready", signed.revision)).rejects.toMatchObject({ code: "locked" });
      expect(await anotherTab.read()).toEqual(signed);
    } finally {
      await anotherTab.close();
    }
  });

  it("avança uma única rodada quando duas abas usam a mesma revisão", async () => {
    const athlete = await repository.save(
      { ...createEmptyDraft(), name: "Alex", allocation: { shooting: 10 } }, "ready", null,
    );
    const signed = await repository.signContract({
      clubId: "br-remo", clubName: "Remo", catalogVersion: CURRENT_WORLD.version,
      monthlySalary: 4000, months: 24, role: "rotation",
    }, athlete);
    const catalog = { worldVersion: CURRENT_WORLD.version, clubs: CURRENT_WORLD.clubs.map(({ id, name }) => ({ id, name })) };
    const anotherTab = createAthleteRepository(databaseName);

    try {
      const outcomes = await Promise.allSettled([
        repository.playSeason({ type: "play" }, catalog, signed),
        anotherTab.playSeason({ type: "play" }, catalog, signed),
      ]);
      expect(outcomes.filter(({ status }) => status === "fulfilled")).toHaveLength(1);
      expect(outcomes.find(({ status }) => status === "rejected")).toMatchObject({ reason: { code: "conflict" } });
      expect((await repository.read())?.season?.rounds).toEqual([null]);
    } finally {
      await anotherTab.close();
    }
  });

  it.each([1, 99])("preserva save corrompido ou de versão incompatível (%i)", async (schemaVersion) => {
    await repository.read();
    const direct = await openDB(databaseName, 1);
    const bad = { id: "athlete-profile", schemaVersion, athlete: { name: "Preservar" } };
    await direct.put("profiles", bad);
    const code = schemaVersion === 99 ? "incompatible" : "invalid";
    await expect(repository.read()).rejects.toMatchObject({ code });
    await expect(repository.save(createEmptyDraft(), "draft", null)).rejects.toMatchObject({ code });
    expect(await direct.get("profiles", "athlete-profile")).toEqual(bad);
    direct.close();
  });

  it("exclui somente a revisão esperada", async () => {
    const saved = await repository.save(createEmptyDraft(), "draft", null);
    await repository.remove(saved.revision);
    expect(await repository.read()).toBeNull();
  });

  it("valida, recupera e protege o backup contra sobrescrita concorrente", async () => {
    const data = await repository.save({ ...createEmptyDraft(), name: "Alex", allocation: { shooting: 10 } }, "ready", null);
    const backup = JSON.parse(JSON.stringify(data));
    await expect(repository.restore({ schemaVersion: 99 }, data.revision)).rejects.toMatchObject({ code: "invalid" });
    await expect(repository.restore(backup, null)).rejects.toMatchObject({ code: "conflict" });
    expect(await repository.read()).toEqual(data);
    await repository.remove(data.revision);
    const restored = await repository.restore(backup, null);
    expect(restored.athlete).toEqual(data.athlete);
    expect(restored.revision).toBeGreaterThan(data.revision);
    expect(await repository.read()).toEqual(restored);
  });

  it("informa indisponibilidade sem alegar sucesso", async () => {
    vi.stubGlobal("indexedDB", undefined);
    await expect(repository.read()).rejects.toMatchObject({ code: "unavailable" });
    await expect(repository.save(createEmptyDraft(), "draft", null)).rejects.toMatchObject({ code: "unavailable" });
  });

  it("preserva o perfil anterior quando a gravação falha por falta de espaço", async () => {
    const first = await repository.save({ ...createEmptyDraft(), name: "Preservar" }, "draft", null);
    vi.spyOn(IDBObjectStore.prototype, "put").mockImplementation(() => { throw new DOMException("Storage full", "QuotaExceededError"); });
    await expect(repository.save({ ...first.athlete, name: "Não gravado" }, "draft", first.revision)).rejects.toMatchObject({ code: "unavailable" });
    expect(await repository.read()).toEqual(first);
  });
});
