import { attributeValue, type AthleteDraft } from "@/domain/athlete/athlete";
import { getPosition, type AttributeKey } from "@/domain/athlete/positions";
import { FIRST_SEASON_YEAR } from "./calendar";
import type { Season, Training, TrainingPlan } from "./season-schema";

type Attributes = TrainingPlan["attributes"];

export const TRAINING_EFFECT = {
  technical: { xp: 8, fatigue: 9, practice: 18 },
  physical: { xp: 11, fatigue: 16, practice: 24 },
  recovery: { xp: 0, fatigue: -25, practice: 0 },
} satisfies Record<Training, { xp: number; fatigue: number; practice: number }>;

export function defaultTrainingFocus(position: Season["player"]["position"]): AttributeKey {
  switch (position) {
    case "GK": return "reflexes";
    case "CB": return "defending";
    case "FB":
    case "WG": return "pace";
    case "DM":
    case "CM":
    case "AM": return "passing";
    case "ST": return "shooting";
  }
}

export function initialTrainingPlan(athlete: AthleteDraft): TrainingPlan {
  const attributes: Attributes = {};
  const ceilings: Attributes = {};
  const margin = athlete.age <= 20 ? 31 : athlete.age <= 24 ? 25 : 18;
  for (const key of getPosition(athlete.position).attributes) {
    attributes[key] = attributeValue(athlete, key);
    ceilings[key] = Math.min(99, attributes[key] + margin);
  }
  return { age: athlete.age, attributes, ceilings, practice: {} };
}

export function withTrainingPlan(season: Season, athlete: AthleteDraft): Season {
  if (season.trainingPlan) return season;
  const plan = initialTrainingPlan(athlete);
  const age = athlete.age + (season.year ?? FIRST_SEASON_YEAR) - FIRST_SEASON_YEAR;
  return { ...season, trainingPlan: { ...plan, age } };
}

export function nextTrainingPlan(plan: TrainingPlan, practice: Attributes): TrainingPlan {
  return { ...plan, age: plan.age + 1, practice };
}

export function gainPractice(plan: TrainingPlan, current: Attributes, key: AttributeKey, amount: number): Attributes {
  const initial = plan.attributes[key];
  if (initial === undefined) return current;
  const ceiling = plan.ceilings[key] ?? initial;
  const ageFactor = plan.age <= 22 ? 1.18 : plan.age <= 29 ? 1 : plan.age <= 34 ? 0.72 : 0.4;
  const points = Math.min((ceiling - initial) * 90, (current[key] ?? 0) + Math.floor(amount * ageFactor));
  return { ...current, [key]: points };
}

export function developedAttributes(plan: TrainingPlan, practice: Attributes): Attributes {
  const values: Attributes = {};
  for (const key of Object.keys(plan.attributes) as AttributeKey[]) {
    const initial = plan.attributes[key]!;
    values[key] = Math.min(plan.ceilings[key] ?? initial, initial + Math.floor((practice[key] ?? 0) / 90));
  }
  return values;
}

export function trainingPotential(plan: TrainingPlan) {
  const ceilings = Object.values(plan.ceilings);
  return ceilings.length ? Math.round(ceilings.reduce((total, level) => total + level, 0) / ceilings.length) : 0;
}
