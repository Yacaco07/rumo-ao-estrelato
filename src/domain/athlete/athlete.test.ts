import { describe, expect, it } from "vitest";
import { adjustAttribute, allocatedPoints, athleteDraftSchema, attributeValue, changePosition, completeAthleteSchema, createEmptyDraft, remainingPoints, savedAthleteSchema } from "./athlete";
import { getPosition, POSITION_KEYS } from "./positions";

describe("Criação do atleta", () => {
  it.each(POSITION_KEYS)("oferece uma base válida com seis atributos para %s", (position) => {
    const athlete = changePosition(createEmptyDraft(), position);
    const profile = getPosition(position);
    expect(profile.attributes).toHaveLength(6);
    expect(new Set(profile.attributes).size).toBe(6);
    expect(remainingPoints(athlete.allocation)).toBe(10);
    expect(athleteDraftSchema.safeParse(athlete).success).toBe(true);
    for (const key of profile.attributes) {
      expect(attributeValue(athlete, key)).toBeGreaterThan(0);
      expect(attributeValue(athlete, key) + 10).toBeLessThanOrEqual(99);
    }
  });

  it("impede um décimo primeiro ponto sem alterar a base nem o objeto anterior", () => {
    const original = createEmptyDraft();
    let athlete = original;
    for (let point = 0; point < 12; point++) athlete = adjustAttribute(athlete, "shooting", 1);
    expect(allocatedPoints(athlete.allocation)).toBe(10);
    expect(attributeValue(athlete, "shooting")).toBe(70);
    expect(attributeValue(original, "shooting")).toBe(60);
    expect(original.allocation).toEqual({});
  });

  it("devolve um ponto retirado e não reduz um atributo abaixo da base", () => {
    let athlete = adjustAttribute(createEmptyDraft(), "pace", 1);
    athlete = adjustAttribute(athlete, "pace", -1);
    athlete = adjustAttribute(athlete, "pace", -1);
    expect(remainingPoints(athlete.allocation)).toBe(10);
    expect(attributeValue(athlete, "pace")).toBe(50);
  });

  it("troca para goleiro com novos atributos e zera extras", () => {
    const fieldPlayer = adjustAttribute(createEmptyDraft(), "shooting", 1);
    const goalkeeper = changePosition(fieldPlayer, "GK");
    expect(goalkeeper.allocation).toEqual({});
    expect(getPosition(goalkeeper.position).attributes).toContain("reflexes");
    expect(getPosition(goalkeeper.position).attributes).not.toContain("shooting");
    expect(adjustAttribute(goalkeeper, "shooting", 1)).toBe(goalkeeper);
    expect(changePosition(fieldPlayer, "ST")).toBe(fieldPlayer);
  });

  it.each([
    { allocation: { shooting: 11 } },
    { allocation: { pace: 6, shooting: 5 } },
    { allocation: { pace: -1 } },
    { allocation: { shooting: 0.5 } },
    { allocation: { reflexes: 1 } },
    { allocation: { invented: 1 } },
    { age: 15 }, { age: 31 }, { age: Number.NaN },
    { shirtNumber: 0 }, { shirtNumber: 100 },
  ])("rejeita dados inválidos %j", (patch) => {
    expect(athleteDraftSchema.safeParse({ ...createEmptyDraft(), ...patch }).success).toBe(false);
  });

  it("permite rascunho incompleto e exige identidade e exatamente 10 pontos para concluir", () => {
    const draft = createEmptyDraft();
    expect(athleteDraftSchema.safeParse(draft).success).toBe(true);
    expect(completeAthleteSchema.safeParse(draft).success).toBe(false);
    expect(completeAthleteSchema.safeParse({ ...draft, name: "  Ana Silva  ", allocation: { shooting: 9 } }).success).toBe(false);
    const completed = completeAthleteSchema.parse({ ...draft, name: "  Ana Silva  ", allocation: { shooting: 6, pace: 4 } });
    expect(completed.name).toBe("Ana Silva");
    expect(allocatedPoints(completed.allocation)).toBe(10);
    expect(completeAthleteSchema.safeParse({ ...completed, nationality: " " }).success).toBe(false);
  });

  it("não aceita que um save marque como concluído um perfil incompleto", () => {
    expect(savedAthleteSchema.safeParse({ schemaVersion: 1, id: "athlete-profile", revision: 1, status: "ready", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), athlete: createEmptyDraft() }).success).toBe(false);
  });
});
