import { describe, expect, it } from "vitest";
import { createEmptyDraft, type SavedAthlete } from "@/domain/athlete/athlete";
import { CURRENT_WORLD } from "@/data/world/current-world";
import { COMPETITION_MEMBERS } from "@/data/world/competition-members";
import { applyCareerAction } from "./career-clock";
import { createSeason, readSeason } from "./season";
import { BRAZIL_B_CLUBS, worldCompetitions } from "./world-competitions";
import { brazilPlayoffs } from "./brazil-playoffs";

const date = "2026-11-17T12:00:00Z";
const profile = {
  schemaVersion: 1, id: "athlete-profile", revision: 1, status: "ready", createdAt: date, updatedAt: date,
  athlete: { ...createEmptyDraft(), name: "Alex", allocation: { shooting: 10 } },
  contract: { clubId: "br-palmeiras", clubName: "Palmeiras", catalogVersion: CURRENT_WORLD.version,
    role: "rotation", monthlySalary: 4400, months: 36, signedAt: date },
} satisfies SavedAthlete;
const catalog = { worldVersion: CURRENT_WORLD.version, clubs: CURRENT_WORLD.clubs.map(({ id, name }) => ({ id, name })), brazilB: BRAZIL_B_CLUBS };
const season = createSeason(profile, catalog)!;

describe("Competições ligadas ao calendário", () => {
  it("usa os participantes verificados e decide as competições de clubes até o fechamento", () => {
    expect(COMPETITION_MEMBERS.reduce((sum, league) => sum + league.clubs.length, 0)).toBe(238);
    const early = worldCompetitions(season, "2026-03-01");
    expect(early.find((view) => view.id === "champions")?.winner).toBeUndefined();
    const closed = worldCompetitions(season, "2026-10-23");
    for (const name of ["copa-brasil", "champions", "conference", "libertadores", "sudamericana", "afc-elite", "afc-two", "intercontinental", "ar-1"]) {
      expect(closed.find(({ id }) => id === name)?.winner).toBeDefined();
    }
    const matches = closed.flatMap(({ matches }) => matches);
    expect(new Set(matches.map(({ id }) => id)).size).toBe(matches.length);
    expect(matches.every(({ score }) => score)).toBe(true);
    expect(matches.filter(({ penalties }) => penalties).every(({ score, winnerId }) =>
      score?.homeGoals === score?.awayGoals && winnerId)).toBe(true);
    const byClubDay = matches.flatMap(({ date, home, away }) => [`${date}:${home.id}`, `${date}:${away.id}`]);
    expect(new Set(byClubDay).size).toBe(byClubDay.length);
  });

  it("integra as duas séries e só promove depois do playoff", () => {
    const lastRound = applyCareerAction(profile, season, { type: "advance", until: "2026-10-18" });
    if (!lastRound.ok) throw new Error(lastRound.message);
    expect(lastRound.season.year).toBe(2026);
    const tables = readSeason(lastRound.season).divisions;
    expect(tables.second).toHaveLength(20);
    expect(tables.second.every(({ played }) => played === 38)).toBe(true);
    const playoff = brazilPlayoffs(lastRound.season, "2026-10-18", tables.second);
    expect(playoff.view.matches).toHaveLength(4);
    expect(playoff.promoted).toHaveLength(2);
    const settled = applyCareerAction({ ...profile, market: lastRound.market }, lastRound.season, { type: "advance", until: "week" });
    if (!settled.ok) throw new Error(settled.message);
    expect(settled.season.year).toBe(2027);
    expect(settled.season.clubs.filter(({ id }) => catalog.brazilB.some((club) => club.id === id))).toHaveLength(4);
    expect(settled.season.brazilB?.filter(({ id }) => catalog.clubs.some((club) => club.id === id))).toHaveLength(4);
    expect(settled.season.qualifications?.champions?.length).toBeGreaterThan(0);
  });

  it("gera o Mundial quadrienal com calendário independente do campeão do próprio ano", () => {
    const worldCup = (year: number) => worldCompetitions({ ...season, year }, `${year}-10-31`).find(({ id }) => id === "club-world-cup");
    expect(worldCup(2027)).toBeUndefined();
    expect(worldCup(2029)?.winner).toBeDefined();
    expect(worldCup(2033)?.tables).toHaveLength(4);
  });
});
