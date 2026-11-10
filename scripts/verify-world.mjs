import { readFileSync, statSync } from "node:fs";
import { parseWorldSnapshot } from "../src/domain/world/world-schema.ts";

const file = process.argv[2] ?? new URL("../src/data/world/br-serie-a-2026.json", import.meta.url);

try {
  if (statSync(file).size > 5_000_000) throw new Error("Snapshot maior que o limite de revisão de 5 MB.");
  const world = parseWorldSnapshot(JSON.parse(readFileSync(file, "utf8")));
  const listed = world.clubs.filter((club) => club.roster.status === "listed").length;
  const competitionLists = world.clubs.filter((club) => club.roster.status === "listed" && club.roster.scope === "competition-athletes").length;
  console.log(`Snapshot válido: ${world.id} · versão ${world.version}`);
  console.log(`${world.clubs.length} clubes · ${world.players.length} jogadores listados · ${listed} relação(ões) consultada(s)`);
  console.log(`${listed - competitionLists} relações de clubes · ${competitionLists} listas de atletas da competição (podem incluir base)`);
  console.log(`Campos desconhecidos: ${world.players.filter((player) => player.positionLabel === null).length} posições · ${world.players.filter((player) => player.shirtNumber === null).length} camisas`);
  console.log(`Data de corte: ${world.asOfDate} · ${world.sources.length} fontes · inscrições e carreiras ainda não liberadas`);
} catch (error) {
  console.error("Snapshot rejeitado; nenhum arquivo foi alterado.");
  if (error && Array.isArray(error.issues)) {
    for (const issue of error.issues) console.error(`${issue.path.join(".")}: ${issue.message}`);
  } else console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
