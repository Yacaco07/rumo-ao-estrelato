import type { Metadata } from "next";
import { CURRENT_WORLD } from "@/data/world/current-world";
import { BRAZIL_B_CLUBS } from "@/domain/career/world-competitions";
import { CompetitionCentre } from "@/features/career/competition-centre";

export const metadata: Metadata = { title: "Competições" };

export default function CompetitionsPage() {
  const clubs = CURRENT_WORLD.clubs.map(({ id, name }) => ({ id, name }));
  return <CompetitionCentre catalog={{ worldVersion: CURRENT_WORLD.version, clubs, brazilB: BRAZIL_B_CLUBS }} />;
}
