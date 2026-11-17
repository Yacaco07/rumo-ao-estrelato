import { z } from "zod";

const id = z.string().min(1).max(110);
export const WORLD_POSITIONS = ["goalkeeper", "defender", "midfielder", "forward"] as const;

const worldPlayerSchema = z.object({
  id, name: z.string().min(1).max(600), clubId: id,
  position: z.enum(WORLD_POSITIONS),
  age: z.number().int().min(15).max(90).nullable(),
  overall: z.number().int().min(1).max(99),
  potential: z.number().int().min(1).max(99),
  sourcePlayerId: id.optional(),
}).strict();

const worldClubSchema = z.object({
  id, name: z.string().min(1).max(600), region: z.enum(["south-america", "europe", "asia"]),
  coach: z.object({ id, name: z.string().min(1).max(100) }).strict(),
  budget: z.number().int().min(0).max(100_000_000),
  objective: z.enum(["title", "first-half", "survival"]),
  needs: z.enum(WORLD_POSITIONS),
}).strict();

export const dynamicWorldSchema = z.object({
  version: z.literal(1),
  year: z.number().int().min(2026).max(2100),
  seed: z.number().int().min(0).max(0xffffffff),
  players: z.array(worldPlayerSchema).max(12_000),
  clubs: z.array(worldClubSchema).max(400),
  news: z.array(z.object({
    year: z.number().int().min(2026).max(2100),
    kind: z.enum(["transfer", "coach", "retirement", "debut"]),
    name: z.string().min(1).max(600),
    clubId: id,
    fromClubId: id.optional(),
    fee: z.number().int().min(0).optional(),
  }).strict()).max(140),
}).strict().superRefine(({ clubs, players }, ctx) => {
  const clubIds = new Set(clubs.map(({ id }) => id));
  if (clubIds.size !== clubs.length || new Set(clubs.map(({ coach }) => coach.id)).size !== clubs.length) {
    ctx.addIssue({ code: "custom", path: ["clubs"], message: "O mundo deve ter clubes e técnicos distintos." });
  }
  if (new Set(players.map(({ id }) => id)).size !== players.length || players.some(({ clubId }) => !clubIds.has(clubId))) {
    ctx.addIssue({ code: "custom", path: ["players"], message: "O mundo deve ter inscrições únicas em clubes existentes." });
  }
});

export type DynamicWorld = z.infer<typeof dynamicWorldSchema>;
export type WorldClub = z.infer<typeof worldClubSchema>;
export type WorldPlayer = z.infer<typeof worldPlayerSchema>;
