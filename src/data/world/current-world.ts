import rawSnapshot from "./br-serie-a-2026.json";
import { parseWorldSnapshot } from "@/domain/world/world-schema";

// Apenas o snapshot revisado entra na interface. Não há consulta de dados vivos no jogo.
export const CURRENT_WORLD = parseWorldSnapshot(rawSnapshot);
