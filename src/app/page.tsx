import { Home } from "@/features/athlete/home";
import { CURRENT_WORLD } from "@/data/world/current-world";
import { getWorldCoverage } from "@/domain/world/world-queries";

export default function Page() { return <Home worldSummary={getWorldCoverage(CURRENT_WORLD)} />; }
