import { z } from "zod";

export const nationalCareerSchema = z.object({
  matches: z.array(z.object({
    id: z.string().min(1).max(160),
    date: z.iso.date(),
    nation: z.string().min(1).max(120),
    opponent: z.string().min(1).max(120),
    competition: z.string().min(1).max(120),
    competitionId: z.string().min(1).max(80),
    minutes: z.number().int().min(0).max(90),
    goals: z.number().int().min(0).max(9),
    assists: z.number().int().min(0).max(9),
    saves: z.number().int().min(0).max(15),
    ownScore: z.number().int().min(0).max(9),
    opponentScore: z.number().int().min(0).max(9),
  }).strict().refine(({ goals, assists, ownScore, minutes, saves }) =>
    goals + assists <= ownScore && (minutes > 0 || goals + assists + saves === 0))).max(1500),
  trophies: z.array(z.object({
    id: z.string().min(1).max(100), year: z.number().int(), name: z.string().min(1).max(100),
  }).strict()).max(200),
}).strict().refine(({ matches, trophies }) => new Set(matches.map(({ id }) => id)).size === matches.length
  && new Set(trophies.map(({ id }) => id)).size === trophies.length);
export type NationalCareer = z.infer<typeof nationalCareerSchema>;
