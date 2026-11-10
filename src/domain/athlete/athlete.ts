import { z } from "zod";
import { ATTRIBUTE_KEYS, EXTRA_POINTS, getPosition, POSITION_KEYS, type AttributeKey, type Position } from "./positions";

export const athleteDraftSchema = z.object({
  name: z.string().trim().max(32, "Use até 32 caracteres no nome."),
  nationality: z.string().trim().max(56, "Use até 56 caracteres na nacionalidade."),
  age: z.number({ error: "Informe uma idade válida." }).int("Use uma idade em anos inteiros.").min(16, "A idade inicial deve ser de 16 a 30 anos.").max(30, "A idade inicial deve ser de 16 a 30 anos."),
  preferredFoot: z.enum(["right", "left", "both"]),
  shirtNumber: z.number({ error: "Informe um número de camisa válido." }).int("Use um número inteiro na camisa.").min(1, "Escolha um número de 1 a 99.").max(99, "Escolha um número de 1 a 99."),
  position: z.enum(POSITION_KEYS),
  allocation: z.partialRecord(z.enum(ATTRIBUTE_KEYS), z.number().int().min(0).max(EXTRA_POINTS)),
}).strict().superRefine((athlete, ctx) => {
  const allowed = getPosition(athlete.position).attributes;
  for (const key of Object.keys(athlete.allocation) as AttributeKey[]) {
    if (!allowed.includes(key)) ctx.addIssue({ code: "custom", path: ["allocation", key], message: "Este atributo não pertence à posição escolhida." });
  }
  if (allocatedPoints(athlete.allocation) > EXTRA_POINTS) {
    ctx.addIssue({ code: "custom", path: ["allocation"], message: "Você pode distribuir no máximo 10 pontos extras." });
  }
});

export type AthleteDraft = z.infer<typeof athleteDraftSchema>;
export type Allocation = AthleteDraft["allocation"];

export const completeAthleteSchema = athleteDraftSchema.superRefine((athlete, ctx) => {
  if (athlete.name.length < 2) ctx.addIssue({ code: "custom", path: ["name"], message: "Informe um nome com pelo menos 2 caracteres." });
  if (athlete.nationality.length < 2) ctx.addIssue({ code: "custom", path: ["nationality"], message: "Informe sua nacionalidade." });
  if (allocatedPoints(athlete.allocation) !== EXTRA_POINTS) ctx.addIssue({ code: "custom", path: ["allocation"], message: "Distribua os 10 pontos antes de concluir o perfil." });
});

export const savedAthleteSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.literal("athlete-profile"),
  revision: z.number().int().positive(),
  status: z.enum(["draft", "ready"]),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  athlete: athleteDraftSchema,
}).strict().superRefine((save, ctx) => {
  if (save.status === "ready" && !completeAthleteSchema.safeParse(save.athlete).success) {
    ctx.addIssue({ code: "custom", path: ["athlete"], message: "O perfil concluído está incompleto." });
  }
});

export type SavedAthlete = z.infer<typeof savedAthleteSchema>;

export function createEmptyDraft(): AthleteDraft {
  return { name: "", nationality: "Brasil", age: 17, preferredFoot: "right", shirtNumber: 1, position: "ST", allocation: {} };
}

export function allocatedPoints(allocation: Allocation): number {
  return Object.values(allocation).reduce((sum, points) => sum + (points ?? 0), 0);
}

export function remainingPoints(allocation: Allocation): number {
  return EXTRA_POINTS - allocatedPoints(allocation);
}

export function adjustAttribute(athlete: AthleteDraft, key: AttributeKey, change: 1 | -1): AthleteDraft {
  if (!getPosition(athlete.position).attributes.includes(key)) return athlete;
  const current = athlete.allocation[key] ?? 0;
  if ((change === 1 && remainingPoints(athlete.allocation) === 0) || current + change < 0) return athlete;
  return { ...athlete, allocation: { ...athlete.allocation, [key]: current + change } };
}

export function changePosition(athlete: AthleteDraft, position: Position): AthleteDraft {
  return position === athlete.position ? athlete : { ...athlete, position, allocation: {} };
}

export function attributeValue(athlete: AthleteDraft, key: AttributeKey): number {
  return (getPosition(athlete.position).base[key] ?? 0) + (athlete.allocation[key] ?? 0);
}

export function averageRating(athlete: AthleteDraft): number {
  const keys = getPosition(athlete.position).attributes;
  return Math.round(keys.reduce((sum, key) => sum + attributeValue(athlete, key), 0) / keys.length);
}
