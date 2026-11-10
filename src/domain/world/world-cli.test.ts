import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import rawWorld from "@/data/world/br-serie-a-2026.json";

const script = resolve("scripts/verify-world.mjs");

describe("Verificador de snapshot", () => {
  it("valida o catálogo padrão mesmo executado fora do diretório do projeto", () => {
    const result = spawnSync(process.execPath, [script], { encoding: "utf8", cwd: tmpdir() });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Snapshot válido");
  });

  it("rejeita referências inválidas sem alterar o arquivo de entrada", () => {
    const directory = mkdtempSync(join(tmpdir(), "rae-world-"));
    try {
      const candidate = structuredClone(rawWorld);
      candidate.players[0].clubId = "missing-club";
      const input = JSON.stringify(candidate);
      const file = join(directory, "candidate.json");
      writeFileSync(file, input);
      const result = spawnSync(process.execPath, [script, file], { encoding: "utf8" });
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("players.0.clubId");
      expect(result.stderr).toContain("Snapshot rejeitado");
      expect(readFileSync(file, "utf8")).toBe(input);
    } finally { rmSync(directory, { recursive: true, force: true }); }
  });
});
