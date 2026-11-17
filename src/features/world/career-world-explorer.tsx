"use client";

import { getPosition } from "@/domain/athlete/positions";
import type { WorldSnapshot } from "@/domain/world/world-schema";
import { useAthlete } from "@/features/athlete/athlete-provider";
import { WorldExplorer } from "./world-explorer";

export function CareerWorldExplorer({ world }: { world: WorldSnapshot }) {
  const { saved } = useAthlete();
  return <WorldExplorer world={world} careerPlayer={saved?.contract && !saved.retiredOn && !saved.market?.freeAgent ? {
    clubId: saved.market?.loan?.clubId ?? saved.contract.clubId,
    name: saved.athlete.name,
    position: getPosition(saved.athlete.position).label,
  } : undefined} />;
}
