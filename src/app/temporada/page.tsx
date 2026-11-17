import type { Metadata } from "next";
import { CURRENT_WORLD } from "@/data/world/current-world";
import { SeasonPage } from "@/features/career/season-page";

export const metadata: Metadata = { title: "Temporada" };

export default function Page() {
  const competition = CURRENT_WORLD.competitions.find(({ leagueId }) => leagueId === "br-a");
  const clubs = CURRENT_WORLD.clubs.filter(({ competitionId }) => competitionId === competition?.id).map(({ id, name }) => ({ id, name }));
  return <SeasonPage catalog={{ worldVersion: CURRENT_WORLD.version, clubs }} />;
}
