import type { ContractOffer } from "./contract";
import type { Absence } from "./match";
import type { Training } from "./season-schema";

export function initialTrust(role: ContractOffer["role"]): number {
  return role === "crucial" ? 68 : role === "rotation" ? 57 : 43;
}

export type Selection = "starter" | "bench" | "unavailable";

export function selectAthlete(input: {
  trust: number; role: ContractOffer["role"]; fatigue: number; debut: boolean; absence?: Absence;
}): Selection {
  if (input.absence || input.fatigue > 84 || input.trust < 28) return "unavailable";
  const roleBonus = input.role === "crucial" ? 8 : input.role === "rotation" ? 4 : 0;
  const score = input.trust + roleBonus - Math.max(0, input.fatigue - 20) / 3;
  return score >= 60 || input.debut && input.trust >= 43 ? "starter" : "bench";
}

export function trainingTrust(training: Training | null, fatigue: number): number {
  if (!training) return 0;
  if (training === "recovery") return fatigue >= 45 ? 2 : 0;
  return fatigue < 65 ? 2 : -1;
}

export function updateTrust(trust: number, rating: number | null, red: number): number {
  const change = rating === null ? 0 : Math.round((rating - 6.15) * 2.5) - red * 3;
  return Math.max(24, Math.min(100, trust + change));
}

export const SELECTION_LABELS: Record<Selection, string> = {
  starter: "Titular",
  bench: "Banco de reservas",
  unavailable: "Fora da convocação",
};
