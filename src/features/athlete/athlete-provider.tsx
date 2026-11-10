"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AthleteDraft, SavedAthlete } from "@/domain/athlete/athlete";
import { athleteRepository } from "@/infrastructure/storage/athlete-repository";

type ProfileContext = {
  saved: SavedAthlete | null; loading: boolean; error: string | null;
  dirty: boolean; setDirty: (value: boolean) => void;
  saveProfile: (athlete: AthleteDraft, status: SavedAthlete["status"]) => Promise<SavedAthlete>;
  removeProfile: () => Promise<void>;
};

const Context = createContext<ProfileContext | null>(null);

export function AthleteProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<SavedAthlete | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let active = true;
    athleteRepository.read().then((value) => { if (active) setSaved(value); })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : "Não foi possível ler o perfil salvo."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function saveProfile(athlete: AthleteDraft, status: SavedAthlete["status"]) {
    if (error) throw new Error(error);
    const result = await athleteRepository.save(athlete, status, saved?.revision ?? null);
    setSaved(result); setDirty(false);
    return result;
  }

  async function removeProfile() {
    if (error) throw new Error(error);
    if (saved) await athleteRepository.remove(saved.revision);
    setSaved(null); setDirty(false);
  }

  return <Context.Provider value={{ saved, loading, error, dirty, setDirty, saveProfile, removeProfile }}>{children}</Context.Provider>;
}

export function useAthlete() {
  const context = useContext(Context);
  if (!context) throw new Error("AthleteProvider ausente.");
  return context;
}
