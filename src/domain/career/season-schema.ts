import { z } from "zod";
import { POSITION_KEYS } from "@/domain/athlete/positions";
import { contractRoleSchema } from "./contract";

export const LEAGUE_SIZE = 20;
export const SEASON_ROUNDS = (LEAGUE_SIZE - 1) * 2;
export const TRAINING_TYPES = ["technical", "physical", "recovery"] as const;

const trainingSchema = z.enum(TRAINING_TYPES);
export type Training = z.infer<typeof trainingSchema>;

export const TRAINING_LABELS: Record<Training, string> = {
  technical: "Treino técnico",
  physical: "Treino físico",
  recovery: "Recuperação",
};

const clubSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().trim().min(1).max(600),
}).strict();

export const seasonSchema = z.object({
  rulesVersion: z.literal(1),
  year: z.number().int().min(2026).max(2100).optional(),
  date: z.iso.date().optional(),
  worldVersion: z.string().min(1).max(60),
  clubs: z.array(clubSchema).length(LEAGUE_SIZE).refine(
    (clubs) => new Set(clubs.map(({ id }) => id)).size === clubs.length,
    "O calendário requer clubes distintos.",
  ),
  player: z.object({
    clubId: z.string(),
    position: z.enum(POSITION_KEYS),
    role: contractRoleSchema,
    initialOverall: z.number().int().min(0).max(99),
  }).strict(),
  seed: z.number().int().min(0).max(0xffffffff),
  rounds: z.array(trainingSchema.nullable()).max(SEASON_ROUNDS),
  preparation: trainingSchema.nullable(),
}).strict().refine(({ clubs, player }) => clubs.some(({ id }) => id === player.clubId), "O clube do atleta deve participar da temporada.")
  .refine(({ rounds, preparation }) => rounds.length < SEASON_ROUNDS || preparation === null, "A temporada já terminou.");

export type Season = z.infer<typeof seasonSchema>;
export type SeasonClub = z.infer<typeof clubSchema>;

export const seasonActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("train"), training: trainingSchema }).strict(),
  z.object({ type: z.literal("play") }).strict(),
  z.object({ type: z.literal("advance"), until: z.union([z.literal("week"), z.literal("next"), z.iso.date()]) }).strict(),
]);

export type SeasonAction = z.infer<typeof seasonActionSchema>;
