import { z } from "zod";

const clubSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1).max(600),
}).strict();

const counts: Record<string, number> = {
  "br-b": 20, "ar-1": 30, "en-1": 20, "es-1": 20, "de-1": 18, "it-1": 20, "fr-1": 18,
  "sa-1": 18, "jp-1": 20, "kr-1": 12, "ae-1": 14, "qa-1": 12, "cn-1": 16,
};

export const leagueMembershipSchema = z.array(z.object({
  id: z.string(),
  name: z.string().min(1),
  edition: z.string().regex(/^2026(?:\/27)?$/),
  accessedOn: z.iso.date(),
  publishers: z.array(z.object({ name: z.string().min(1), url: z.url().refine((url) => url.startsWith("https://")) }).strict()).min(1),
  clubs: z.array(clubSchema),
}).strict()).length(Object.keys(counts).length).superRefine((leagues, ctx) => {
  const seen = new Set<string>();
  const clubs = new Set<string>();
  for (const [index, league] of leagues.entries()) {
    if (seen.has(league.id) || league.clubs.length !== counts[league.id]) {
      ctx.addIssue({ code: "custom", path: [index], message: "Liga repetida ou quantidade de clubes inesperada." });
    }
    seen.add(league.id);
    for (const club of league.clubs) {
      if (clubs.has(club.id)) ctx.addIssue({ code: "custom", path: [index, "clubs"], message: "Identificador de clube repetido." });
      clubs.add(club.id);
    }
  }
});

export type LeagueMembership = z.infer<typeof leagueMembershipSchema>[number];
