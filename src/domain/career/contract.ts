import { z } from "zod";

export const CONTRACT_MONTHS = [12, 24, 36] as const;
export const SALARY_STEP = 100;
export const CONTRACT_ROLES = ["crucial", "rotation", "alternative"] as const;
export const contractRoleSchema = z.enum([...CONTRACT_ROLES, "development"]);

export const CONTRACT_ROLE_LABELS: Record<z.infer<typeof contractRoleSchema>, string> = {
  crucial: "Crucial",
  alternative: "Alternativo",
  development: "Alternativo",
  rotation: "Rotação",
};

const negotiableTermsSchema = z.object({
  monthlySalary: z.number().int().min(1000).max(100_000).multipleOf(SALARY_STEP),
  months: z.literal(CONTRACT_MONTHS),
  role: contractRoleSchema.optional(),
}).strict();

export const contractOfferSchema = negotiableTermsSchema.extend({
  clubId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  clubName: z.string().trim().min(1).max(600),
  catalogVersion: z.string().trim().min(1).max(60),
  role: contractRoleSchema,
});

export const signedContractSchema = contractOfferSchema.extend({ signedAt: z.iso.datetime() });

export type ContractOffer = z.infer<typeof contractOfferSchema>;
export type SignedContract = z.infer<typeof signedContractSchema>;

export function negotiateContract(original: ContractOffer, proposal: unknown) {
  const request = negotiableTermsSchema.safeParse(proposal);
  if (!request.success) return { status: "invalid" } as const;

  const { monthlySalary, months, role = original.role } = request.data;
  if (monthlySalary > original.monthlySalary + 1000) return { status: "rejected" } as const;

  const terms = { ...original, monthlySalary: Math.min(monthlySalary, original.monthlySalary + 400), months, role };
  const status = terms.monthlySalary === monthlySalary ? "accepted" : "countered";
  return { status, terms } as const;
}
