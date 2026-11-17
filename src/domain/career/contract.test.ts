import { describe, expect, it } from "vitest";
import { contractOfferSchema, negotiateContract } from "./contract";

const original = contractOfferSchema.parse({
  clubId: "br-palmeiras",
  clubName: "Palmeiras",
  catalogVersion: "2026.11.17-01",
  monthlySalary: 4000,
  months: 24,
  role: "rotation",
});

describe("Contrapropostas", () => {
  it("aceita salário dentro da margem e altera o prazo", () => {
    expect(negotiateContract(original, { monthlySalary: 4200, months: 36 })).toEqual({
      status: "accepted", terms: { ...original, monthlySalary: 4200, months: 36 },
    });
  });

  it("permite negociar somente o papel no elenco", () => {
    expect(negotiateContract(original, { monthlySalary: 4000, months: 24, role: "development" })).toEqual({
      status: "accepted", terms: { ...original, role: "development" },
    });
  });

  it("retorna novos termos dentro do orçamento simulado e mantém o papel solicitado", () => {
    expect(negotiateContract(original, { monthlySalary: 4700, months: 12, role: "development" })).toEqual({
      status: "countered", terms: { ...original, monthlySalary: 4400, months: 12, role: "development" },
    });
  });

  it("recusa uma contraproposta acima do teto", () => {
    expect(negotiateContract(original, { monthlySalary: 5100, months: 24 })).toEqual({ status: "rejected" });
    expect(original.monthlySalary).toBe(4000);
  });

  it.each([{ monthlySalary: 4201, months: 24 }, { monthlySalary: 4200, months: 0 }, { monthlySalary: 4200, months: 24, role: "invalid" }])("rejeita termos inválidos", (request) => {
    expect(negotiateContract(original, request)).toEqual({ status: "invalid" });
  });
});
