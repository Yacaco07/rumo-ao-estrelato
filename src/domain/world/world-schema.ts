import { z } from "zod";

const id = z.string().regex(/^[a-z0-9]+(?:[-.][a-z0-9]+)*$/, "Use um identificador estável, sem espaços.");
const text = z.string().trim().min(1).max(600);
const date = z.iso.date();
const sourceFields = [
  "clubName", "competitionMembership", "playerName", "playerClub",
  "positionLabel", "shirtNumber", "nationality", "dateOfBirth",
] as const;
type SourceField = (typeof sourceFields)[number];

export const positionGroups = ["goalkeeper", "defender", "midfielder", "forward"] as const;
export type PositionGroup = (typeof positionGroups)[number];
export const POSITION_GROUP_LABELS: Record<PositionGroup, string> = {
  goalkeeper: "Goleiros", defender: "Defensores", midfielder: "Meio-campistas", forward: "Atacantes",
};

export function normalizeWorldText(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
}

// Normaliza apenas categorias explícitas da fonte, sem inferir uma posição de jogo.
export function positionGroupFromLabel(label: string | null): PositionGroup | null {
  if (label === null) return null;
  const labels: Record<string, PositionGroup> = {
    goleiro: "goalkeeper", zagueiro: "defender", "lateral-direito": "defender",
    "lateral-esquerdo": "defender", "meio-campista": "midfielder", volante: "midfielder",
    atacante: "forward",
  };
  return labels[normalizeWorldText(label)] ?? null;
}

const sourceSchema = z.object({
  id, publisher: text,
  url: z.url().refine((value) => new URL(value).protocol === "https:", "A fonte deve usar HTTPS."),
  kind: z.enum(["competition-list", "squad-list"]),
  subjectId: id,
  season: text.nullable(),
  accessedOn: date,
  updatedOn: date.nullable(),
  fields: z.array(z.enum(sourceFields)).min(1).refine((fields) => new Set(fields).size === fields.length, "Campos de fonte repetidos."),
  notes: text,
}).strict();

const competitionSchema = z.object({
  id, leagueId: id, name: text, season: text,
  countryCode: z.string().regex(/^[A-Z]{2}$/),
  expectedClubCount: z.number().int().positive().max(100),
  sourceId: id,
}).strict();

const clubSchema = z.object({
  id, name: text, competitionId: id,
  provenance: z.object({ name: id, competitionId: id }).strict(),
  roster: z.object({
    status: z.enum(["pending", "listed"]),
    sourceId: id.nullable(),
    sourceListedCount: z.number().int().positive().nullable(),
    registrationVerified: z.literal(false),
    notes: text,
  }).strict(),
  // Nenhum ativo é importado antes da revisão individual de direitos de uso.
  crest: z.null(),
}).strict();

const playerSchema = z.object({
  id, name: text, clubId: id,
  positionLabel: text.nullable(),
  positionGroup: z.enum(positionGroups).nullable(),
  shirtNumber: z.number().int().min(1).max(99).nullable(),
  nationality: text.nullable(),
  dateOfBirth: date.nullable(),
  provenance: z.object({
    name: id, clubId: id, positionLabel: id.nullable(),
    shirtNumber: id.nullable(), nationality: id.nullable(), dateOfBirth: id.nullable(),
  }).strict(),
}).strict();

export const worldSnapshotSchema = z.object({
  schemaVersion: z.literal(1),
  id, version: id,
  asOfDate: date,
  reviewedOn: date,
  reviewedBy: text,
  gameplayReady: z.literal(false),
  sources: z.array(sourceSchema).min(1),
  competitions: z.array(competitionSchema).min(1),
  clubs: z.array(clubSchema).min(1),
  players: z.array(playerSchema),
}).strict().superRefine((world, ctx) => {
  const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: "custom", path, message });
  const sources = new Map(world.sources.map((source) => [source.id, source]));
  const competitions = new Map(world.competitions.map((competition) => [competition.id, competition]));
  const clubs = new Map(world.clubs.map((club) => [club.id, club]));

  for (const collection of ["sources", "competitions", "clubs", "players"] as const) {
    const seen = new Set<string>();
    world[collection].forEach((entity, index) => {
      if (seen.has(entity.id)) issue([collection, index, "id"], "Identificador repetido.");
      seen.add(entity.id);
    });
  }
  if (world.reviewedOn < world.asOfDate) issue(["reviewedOn"], "A revisão não pode anteceder a data de corte.");

  world.sources.forEach((source, index) => {
    if (source.accessedOn > world.asOfDate) issue(["sources", index, "accessedOn"], "Fonte consultada após a data de corte.");
    if (source.updatedOn && source.updatedOn > source.accessedOn) issue(["sources", index, "updatedOn"], "Atualização posterior à consulta.");
    const subjectExists = source.kind === "competition-list" ? competitions.has(source.subjectId) : clubs.has(source.subjectId);
    if (!subjectExists) issue(["sources", index, "subjectId"], "Assunto da fonte inexistente.");
  });

  function checkSource(sourceId: string, field: SourceField, subjectId: string, kind: "competition-list" | "squad-list", path: (string | number)[]) {
    const source = sources.get(sourceId);
    if (!source) { issue(path, "Fonte inexistente."); return; }
    if (source.kind !== kind || source.subjectId !== subjectId || !source.fields.includes(field)) issue(path, "Esta fonte não fundamenta o campo desta entidade.");
  }

  world.competitions.forEach((competition, index) => {
    checkSource(competition.sourceId, "competitionMembership", competition.id, "competition-list", ["competitions", index, "sourceId"]);
    const source = sources.get(competition.sourceId);
    if (source && source.season !== competition.season) issue(["competitions", index, "season"], "Temporada diferente da fonte da competição.");
    if (world.clubs.filter((club) => club.competitionId === competition.id).length !== competition.expectedClubCount) issue(["competitions", index, "expectedClubCount"], "Quantidade de participantes diferente da cobertura declarada.");
  });

  const clubNames = new Set<string>();
  world.clubs.forEach((club, index) => {
    if (!competitions.has(club.competitionId)) issue(["clubs", index, "competitionId"], "Competição inexistente.");
    const nameKey = `${club.competitionId}:${normalizeWorldText(club.name)}`;
    if (clubNames.has(nameKey)) issue(["clubs", index, "name"], "Clube duplicado na mesma competição.");
    clubNames.add(nameKey);
    checkSource(club.provenance.name, "clubName", club.competitionId, "competition-list", ["clubs", index, "provenance", "name"]);
    checkSource(club.provenance.competitionId, "competitionMembership", club.competitionId, "competition-list", ["clubs", index, "provenance", "competitionId"]);
    const count = world.players.filter((player) => player.clubId === club.id).length;
    if (club.roster.status === "pending") {
      if (club.roster.sourceId !== null || club.roster.sourceListedCount !== null || count !== 0) issue(["clubs", index, "roster"], "Cobertura pendente não pode declarar lista ou jogadores verificados.");
    } else {
      if (!club.roster.sourceId || club.roster.sourceListedCount === null || count !== club.roster.sourceListedCount) issue(["clubs", index, "roster"], "Relação publicada incompatível com os jogadores importados.");
      if (club.roster.sourceId) checkSource(club.roster.sourceId, "playerClub", club.id, "squad-list", ["clubs", index, "roster", "sourceId"]);
    }
  });

  const playerNames = new Set<string>();
  const numbers = new Set<string>();
  world.players.forEach((player, index) => {
    if (!clubs.has(player.clubId)) issue(["players", index, "clubId"], "Clube inexistente.");
    const nameKey = `${player.clubId}:${normalizeWorldText(player.name)}`;
    if (playerNames.has(nameKey)) issue(["players", index, "name"], "Jogador duplicado na relação do clube.");
    playerNames.add(nameKey);
    checkSource(player.provenance.name, "playerName", player.clubId, "squad-list", ["players", index, "provenance", "name"]);
    checkSource(player.provenance.clubId, "playerClub", player.clubId, "squad-list", ["players", index, "provenance", "clubId"]);
    for (const field of ["positionLabel", "shirtNumber", "nationality", "dateOfBirth"] as const) {
      const sourceId = player.provenance[field];
      if ((player[field] === null) !== (sourceId === null)) issue(["players", index, "provenance", field], "Um fato precisa de fonte; um campo desconhecido deve permanecer sem fonte.");
      if (sourceId) checkSource(sourceId, field, player.clubId, "squad-list", ["players", index, "provenance", field]);
    }
    if (player.positionGroup !== positionGroupFromLabel(player.positionLabel)) issue(["players", index, "positionGroup"], "Categoria não corresponde à posição explícita da fonte.");
    if (player.dateOfBirth && player.dateOfBirth > world.asOfDate) issue(["players", index, "dateOfBirth"], "Nascimento posterior à data de corte.");
    if (player.shirtNumber !== null) {
      const numberKey = `${player.clubId}:${player.shirtNumber}`;
      if (numbers.has(numberKey)) issue(["players", index, "shirtNumber"], "Camisa repetida no elenco principal do mesmo clube.");
      numbers.add(numberKey);
    }
  });
});

export type WorldSnapshot = z.infer<typeof worldSnapshotSchema>;
export type WorldClub = WorldSnapshot["clubs"][number];
export type WorldPlayer = WorldSnapshot["players"][number];
export type WorldSource = WorldSnapshot["sources"][number];

export function parseWorldSnapshot(input: unknown): WorldSnapshot {
  return worldSnapshotSchema.parse(input);
}
