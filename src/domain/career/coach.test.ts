import { describe, expect, it } from "vitest";
import { initialTrust, selectAthlete, trainingTrust, updateTrust } from "./coach";

describe("Confiança e escalação", () => {
  it("prioriza Crucial e Rotação e permite ao Alternativo conquistar a vaga", () => {
    const preparation = { fatigue: 10, debut: false };
    expect(selectAthlete({ ...preparation, role: "crucial", trust: initialTrust("crucial") })).toBe("starter");
    expect(selectAthlete({ ...preparation, role: "rotation", trust: initialTrust("rotation") })).toBe("starter");
    const initial = initialTrust("alternative");
    expect(selectAthlete({ ...preparation, role: "alternative", trust: initial })).toBe("bench");
    let trust = initial;
    for (let match = 0; match < 4; match++) trust = updateTrust(trust + trainingTrust("technical", 12), 8, 0);
    expect(selectAthlete({ ...preparation, role: "alternative", trust })).toBe("starter");
  });

  it("protege o atleta fatigado, lesionado ou suspenso mesmo com papel Crucial", () => {
    const player = { role: "crucial", trust: 90, fatigue: 12, debut: false } as const;
    expect(selectAthlete({ ...player, absence: "injured" })).toBe("unavailable");
    expect(selectAthlete({ ...player, absence: "suspended" })).toBe("unavailable");
    expect(selectAthlete({ ...player, fatigue: 96 })).toBe("unavailable");
    expect(trainingTrust("recovery", 96)).toBeGreaterThan(trainingTrust("physical", 96));
  });
});
