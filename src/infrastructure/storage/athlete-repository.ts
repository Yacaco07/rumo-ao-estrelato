import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { athleteDraftSchema, completeAthleteSchema, savedAthleteSchema, type AthleteDraft, type SavedAthlete } from "@/domain/athlete/athlete";

interface AthleteDatabase extends DBSchema {
  profiles: { key: string; value: SavedAthlete };
}

export class SaveError extends Error {
  constructor(public readonly code: "unavailable" | "invalid" | "incompatible" | "conflict", message: string) {
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

  return {
    async read(): Promise<SavedAthlete | null> {
      try { return parseSave(await (await database()).get("profiles", "athlete-profile")); }
      catch (error) { throw asSaveError(error); }
    },
    async save(athlete: AthleteDraft, status: SavedAthlete["status"], expectedRevision: number | null): Promise<SavedAthlete> {
      const validation = (status === "ready" ? completeAthleteSchema : athleteDraftSchema).safeParse(athlete);
      if (!validation.success) throw new SaveError("invalid", validation.error.issues[0].message);
      try {
        const db = await database();
        const tx = db.transaction("profiles", "readwrite");
        // Observe failures immediately; the returned promise never rejects unhandled.
        const committed = tx.done.then(() => null, (error: unknown) => asSaveError(error));
        try {
          const current = parseSave(await tx.store.get("athlete-profile"));
          if ((current?.revision ?? null) !== expectedRevision) throw new SaveError("conflict", "O perfil mudou em outra aba. Recarregue o perfil antes de salvar novamente.");
          const now = new Date().toISOString();
          const next = savedAthleteSchema.parse({ schemaVersion: 1, id: "athlete-profile", revision: (current?.revision ?? 0) + 1, status, createdAt: current?.createdAt ?? now, updatedAt: now, athlete: validation.data });
          await tx.store.put(next);
          const commitError = await committed;
          if (commitError) throw commitError;
          return next;
        } catch (error) {
          try { tx.abort(); } catch { /* The transaction may already have finished. */ }
          await committed;
          throw error;
        }
      } catch (error) { throw asSaveError(error); }
    },
    async remove(expectedRevision: number): Promise<void> {
      try {
        const tx = (await database()).transaction("profiles", "readwrite");
        const committed = tx.done.then(() => null, (error: unknown) => asSaveError(error));
        try {
          const current = parseSave(await tx.store.get("athlete-profile"));
          if (current?.revision !== expectedRevision) throw new SaveError("conflict", "O perfil mudou em outra aba. Recarregue antes de excluir.");
          await tx.store.delete("athlete-profile");
          const commitError = await committed;
          if (commitError) throw commitError;
        } catch (error) {
          try { tx.abort(); } catch { /* Already finished. */ }
          await committed;
          throw error;
        }
      } catch (error) { throw asSaveError(error); }
    },
    async close() { if (connection) (await connection).close(); connection = undefined; },
  };
}

export const athleteRepository = createAthleteRepository();
