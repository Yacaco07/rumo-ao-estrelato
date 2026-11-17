import type { Metadata } from "next";
import { CURRENT_WORLD } from "@/data/world/current-world";
import { BRAZIL_B_CLUBS } from "@/domain/career/world-competitions";
import { CareerHistory } from "@/features/career/career-history";

export const metadata: Metadata = { title: "História da carreira" };

export default function CareerPage() {
  const clubs = CURRENT_WORLD.clubs.map(({ id, name }) => ({ id, name }));
  return <CareerHistory catalog={{ worldVersion: CURRENT_WORLD.version, clubs, brazilB: BRAZIL_B_CLUBS }} />;
}
