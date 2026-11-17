import { z } from "zod";
import { contractOfferSchema, contractRoleSchema } from "./contract";

const offerId = z.string().min(1).max(160);
const currency = z.number().int().min(0).max(100_000_000).multipleOf(100);
const clubId = z.string().min(1).max(80);
const clubName = z.string().min(1).max(600);
const request = z.enum(["transfer", "loan"]);
const loanTerms = z.object({
  duration: z.literal([6, 12]),
  salaryShare: z.number().int().min(25).max(100).multipleOf(5),
}).strict();

const offerSchema = z.object({
  id: offerId,
  originClubId: clubId,
  kind: request,
  terms: contractOfferSchema,
  fee: currency,
  minimumFee: currency,
  expiresOn: z.iso.date(),
  status: z.enum(["open", "accepted", "rejected", "expired"]),
  loanTerms: loanTerms.optional(),
}).strict().refine((offer) => (offer.kind === "loan") === !!offer.loanTerms, "Obrigatório informar as condições do empréstimo.");

export const marketSchema = z.object({
  dissatisfaction: z.number().int().min(0).max(100),
  request: request.nullable(),
  promisedMinutes: z.number().int().min(0).max(4),
  talkedOn: z.iso.date().optional(),
  offers: z.array(offerSchema).max(12),
  news: z.array(z.string().min(1).max(1500)).max(8),
  lastSearch: z.iso.date().optional(),
  loan: z.object({
    clubId, clubName, startedOn: z.iso.date(), dueOn: z.iso.date(),
    role: contractRoleSchema,
    terms: loanTerms,
  }).strict().refine((loan) => loan.dueOn > loan.startedOn).optional(),
  moves: z.array(z.object({
    kind: z.enum(["transfer", "loan", "return"]),
    from: clubName,
    to: clubName,
    date: z.iso.date(),
    fee: currency,
  }).strict()).max(500),
}).strict();
export type MarketState = z.infer<typeof marketSchema>;
export type MarketOffer = z.infer<typeof offerSchema>;

export const marketActionSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("talk") }).strict(),
  z.object({ kind: z.literal("request"), request }).strict(),
  z.object({ kind: z.literal("accept"), offerId }).strict(),
  z.object({ kind: z.literal("reject"), offerId }).strict(),
]);
export type MarketAction = z.infer<typeof marketActionSchema>;
