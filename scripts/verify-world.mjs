import { readFileSync, statSync } from "node:fs";
import { leagueMembershipSchema } from "../src/domain/world/league-membership.ts";
import { parseWorldSnapshot } from "../src/domain/world/world-schema.ts";

const file = process.argv[2] ?? new URL("../src/data/world/br-serie-a-2026.json", import.meta.url);

try {
  if (statSync(file).size > 5_000_000) throw new Error("Snapshot maior que o limite de revisão de 5 MB.");
  const world = parseWorldSnapshot(JSON.parse(readFileSync(file, "utf8")));
  if (!process.argv[2]) {
    const extra = leagueMembershipSchema.parse(JSON.parse(readFileSync(new URL("../src/data/world/competition-members-2026.json", import.meta.url), "utf8")));
    const original = new Set(world.clubs.map(({ id }) => id));
    if (extra.some(({ clubs }) => clubs.some(({ id }) => original.has(id)))) throw new Error("Clube repetido entre a Série A e as ligas adicionais.");
    console.log(`${extra.length} ligas adicionais · ${extra.reduce((total, league) => total + league.clubs.length, 0)} clubes · fontes de participação registradas`);
  }
  const listed = world.clubs.filter((club) => club.roster.status === "listed").length;
  const competitionLists = world.clubs.filter((club) => club.roster.status === "listed" && club.roster.scope === "competition-athletes").length;
  console.log(`Snapshot válido: ${world.id} · versão ${world.version}`);
  console.log(`${world.clubs.length} clubes · ${world.players.length} jogadores listados · ${listed} relação(ões) consultada(s)`);
  console.log(`${listed - competitionLists} relações de clubes · ${competitionLists} listas de atletas da competição (podem incluir base)`);
  const observations = world.players.filter((player) => player.shirtObservation).length;
  console.log(`Campos a confirmar: ${world.players.filter((player) => player.positionLabel === null).length} posições · ${world.players.filter((player) => player.shirtNumber === null).length} camisas do elenco · ${observations} camisas documentadas em partidas`);
  console.log(`Data de corte: ${world.asOfDate} · ${world.sources.length} fontes · inscrições a verificar · catálogo em revisão para partidas`);
} catch (error) {
  console.error("Snapshot rejeitado; nenhum arquivo foi alterado.");
  if (error && Array.isArray(error.issues)) {
    for (const issue of error.issues) console.error(`${issue.path.join(".")}: ${issue.message}`);
  } else console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
