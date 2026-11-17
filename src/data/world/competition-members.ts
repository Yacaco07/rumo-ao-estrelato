import { leagueMembershipSchema } from "@/domain/world/league-membership";
import participants from "./competition-members-2026.json";

export const COMPETITION_MEMBERS = leagueMembershipSchema.parse(participants);
