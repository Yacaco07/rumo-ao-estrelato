import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { athleteDraftSchema, completeAthleteSchema, savedAthleteSchema, type AthleteDraft, type SavedAthlete } from "@/domain/athlete/athlete";

import { applyCareerAction } from "@/domain/career/career-clock";
import { createSeason, type SeasonCatalog } from "@/domain/career/season";
import type { SeasonAction } from "@/domain/career/season-schema";
import { contractOfferSchema, type ContractOffer } from "@/domain/career/contract";

interface AthleteDatabase extends DBSchema {
  profiles: { key: string; value: SavedAthlete };
}

export class SaveError extends Error {
  constructor(public readonly code: "unavailable" | "invalid" | "incompatible" | "conflict" | "locked", message: string) {
    super(message);
    this.name = "SaveError";
  }
}

function parseSave(raw: unknown): SavedAthlete | null {
  if (raw === undefined) return null;
  if (raw && typeof raw === "object" && "schemaVersion" in raw && raw.schemaVersion !== 1) {
    throw new SaveError("incompatible", "Este perfil usa uma versão diferente. Seus dados foram preservados.");
  }
  const result = savedAthleteSchema.safeParse(raw);
  if (!result.success) throw new SaveError("invalid", "Não foi possível validar o perfil salvo. Seus dados foram preservados.");
  return result.data;
}

function asSaveError(error: unknown): SaveError {
  if (error instanceof SaveError) return error;
  return new SaveError("unavailable", "Não foi possível acessar o salvamento neste navegador. Verifique o espaço e as permissões e tente novamente.");
}

export function createAthleteRepository(databaseName = "rumo-ao-estrelato") {
  let connection: Promise<IDBPDatabase<AthleteDatabase>> | undefined;

  async function database() {
    if (typeof indexedDB === "undefined") throw new SaveError("unavailable", "O salvamento local não está disponível neste navegador.");
    connection ??= openDB<AthleteDatabase>(databaseName, 1, {
      upgrade(db) { db.createObjectStore("profiles", { keyPath: "id" }); },
      blocking() { void connection?.then((db) => db.close()); connection = undefined; },
      terminated() { connection = undefined; },
    }).catch((error: unknown) => { connection = undefined; throw asSaveError(error); });
    return connection;
  }

  async function update<T extends SavedAthlete | null>(
    expectedRevision: number | null,
    change: (current: SavedAthlete | null) => T,
  ): Promise<T> {
    try {
      const tx = (await database()).transaction("profiles", "readwrite");
      const committed = tx.done.then(() => null, (error: unknown) => asSaveError(error));
      try {
        const current = parseSave(await tx.store.get("athlete-profile"));
        if ((current?.revision ?? null) !== expectedRevision) {
          throw new SaveError("conflict", "O perfil mudou em outra aba. Recarregue o perfil antes de continuar.");
        }
        const next = change(current);
        if (next) await tx.store.put(next);
        else await tx.store.delete("athlete-profile");
        const commitError = await committed;
        if (commitError) throw commitError;
        return next;
      } catch (error) {
        try { tx.abort(); } catch { /* The transaction may already have finished. */ }
        await committed;
        throw error;
      }
    } catch (error) { throw asSaveError(error); }
  }

  return {
    async read(): Promise<SavedAthlete | null> {
      try { return parseSave(await (await database()).get("profiles", "athlete-profile")); }
      catch (error) { throw asSaveError(error); }
    },
    async save(athlete: AthleteDraft, status: SavedAthlete["status"], expectedRevision: number | null): Promise<SavedAthlete> {
      const validation = (status === "ready" ? completeAthleteSchema : athleteDraftSchema).safeParse(athlete);
      if (!validation.success) throw new SaveError("invalid", validation.error.issues[0].message);

      return update(expectedRevision, (current) => {
        if (current?.contract) throw new SaveError("locked", "O perfil já está vinculado ao primeiro contrato.");
        const now = new Date().toISOString();
        return savedAthleteSchema.parse({
          schemaVersion: 1, id: "athlete-profile", revision: (current?.revision ?? 0) + 1,
          status, createdAt: current?.createdAt ?? now, updatedAt: now, athlete: validation.data,
        });
      });
    },
    async signContract(offer: ContractOffer, expected: Pick<SavedAthlete, "revision" | "createdAt">): Promise<SavedAthlete> {
      const validated = contractOfferSchema.safeParse(offer);
      if (!validated.success) throw new SaveError("invalid", "Confira os termos do primeiro contrato.");

      return update(expected.revision, (current) => {
        if (current?.status !== "ready" || current.createdAt !== expected.createdAt) {
          throw new SaveError("conflict", "O perfil foi alterado. Recarregue antes de assinar.");
        }
        if (current.contract) throw new SaveError("locked", "O primeiro contrato já foi assinado.");
        const now = new Date().toISOString();
        return savedAthleteSchema.parse({
          ...current,
          revision: current.revision + 1,
          updatedAt: now,
          contract: { ...validated.data, signedAt: now },
        });
      });
    },
    async playSeason(action: SeasonAction, catalog: SeasonCatalog, expected: Pick<SavedAthlete, "revision" | "createdAt">): Promise<SavedAthlete> {
      return update(expected.revision, (current) => {
        if (!current?.contract || current.createdAt !== expected.createdAt) {
          throw new SaveError("conflict", "Recarregue o perfil e confira seu contrato antes de jogar.");
        }
        const season = current.season ?? createSeason({ ...current, contract: current.contract }, catalog);
        if (!season) throw new SaveError("invalid", "O catálogo disponível não permite montar esta temporada.");
        const result = applyCareerAction({ ...current, contract: current.contract }, season, action);
        if (!result.ok) throw new SaveError("invalid", result.message);

        return savedAthleteSchema.parse({
          ...current, season: result.season, pastSeasons: result.pastSeasons, market: result.market, contract: result.contract, revision: current.revision + 1, updatedAt: new Date().toISOString(),
        });
      });
    },
    async remove(expectedRevision: number): Promise<void> {
      await update(expectedRevision, () => null);
    },
    async close() { if (connection) (await connection).close(); connection = undefined; },
  };
}

export const athleteRepository = createAthleteRepository();
