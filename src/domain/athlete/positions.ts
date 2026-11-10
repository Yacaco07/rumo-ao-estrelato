export const EXTRA_POINTS = 10;

export const ATTRIBUTE_KEYS = [
  "pace", "shooting", "passing", "dribbling", "defending", "physical",
  "reflexes", "diving", "handling", "positioning", "kicking", "oneOnOne",
] as const;

export type AttributeKey = (typeof ATTRIBUTE_KEYS)[number];

export const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  pace: "Ritmo", shooting: "Finalização", passing: "Passe", dribbling: "Controle",
  defending: "Defesa", physical: "Físico", reflexes: "Reflexos", diving: "Mergulho",
  handling: "Segurança", positioning: "Posicionamento", kicking: "Reposição", oneOnOne: "Um contra um",
};

type PositionProfile = {
  label: string;
  short: string;
  description: string;
  attributes: readonly AttributeKey[];
  base: Partial<Record<AttributeKey, number>>;
  pitch: { x: number; y: number };
};

const FIELD_ATTRIBUTES = ["pace", "shooting", "passing", "dribbling", "defending", "physical"] as const;

// Parâmetros originais de balanceamento. Não são ratings de atletas reais.
export const POSITIONS = {
  GK: { label: "Goleiro", short: "GOL", description: "O último obstáculo. O primeiro passe.", attributes: ["reflexes", "diving", "handling", "positioning", "kicking", "oneOnOne"], base: { reflexes: 55, diving: 50, handling: 48, positioning: 52, kicking: 40, oneOnOne: 49 }, pitch: { x: 50, y: 86 } },
  CB: { label: "Zagueiro", short: "ZAG", description: "Antecipação, força e liderança na defesa.", attributes: FIELD_ATTRIBUTES, base: { pace: 40, shooting: 25, passing: 40, dribbling: 30, defending: 58, physical: 57 }, pitch: { x: 50, y: 70 } },
  FB: { label: "Lateral", short: "LAT", description: "Intensidade de uma área à outra.", attributes: FIELD_ATTRIBUTES, base: { pace: 58, shooting: 28, passing: 46, dribbling: 44, defending: 48, physical: 46 }, pitch: { x: 17, y: 63 } },
  DM: { label: "Volante", short: "VOL", description: "Equilíbrio para defender e construir.", attributes: FIELD_ATTRIBUTES, base: { pace: 40, shooting: 30, passing: 54, dribbling: 38, defending: 56, physical: 52 }, pitch: { x: 50, y: 56 } },
  CM: { label: "Meia central", short: "MC", description: "O ritmo do jogo passa pelos seus pés.", attributes: FIELD_ATTRIBUTES, base: { pace: 43, shooting: 40, passing: 59, dribbling: 50, defending: 36, physical: 42 }, pitch: { x: 50, y: 45 } },
  AM: { label: "Meia ofensivo", short: "MEI", description: "Visão para transformar espaço em chance.", attributes: FIELD_ATTRIBUTES, base: { pace: 45, shooting: 48, passing: 58, dribbling: 57, defending: 24, physical: 38 }, pitch: { x: 50, y: 33 } },
  WG: { label: "Ponta", short: "PON", description: "Velocidade, drible e um contra um.", attributes: FIELD_ATTRIBUTES, base: { pace: 61, shooting: 46, passing: 40, dribbling: 59, defending: 24, physical: 40 }, pitch: { x: 80, y: 23 } },
  ST: { label: "Atacante", short: "ATA", description: "O instinto de estar onde o gol acontece.", attributes: FIELD_ATTRIBUTES, base: { pace: 50, shooting: 60, passing: 34, dribbling: 48, defending: 23, physical: 55 }, pitch: { x: 50, y: 17 } },
} as const satisfies Record<string, PositionProfile>;

export const POSITION_KEYS = ["GK", "CB", "FB", "DM", "CM", "AM", "WG", "ST"] as const;
export type Position = (typeof POSITION_KEYS)[number];

export function getPosition(position: Position): PositionProfile {
  return POSITIONS[position];
}
