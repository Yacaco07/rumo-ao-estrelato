export type LeagueScope = { id: string; name: string; country: string; countryCode: string; continent: "América do Sul" | "Europa" | "Ásia" };

// Lista de escopo fornecida pelo projeto; não é um snapshot de dados esportivos.
export const LEAGUES: readonly LeagueScope[] = [
  { id: "br-a", name: "Série A", country: "Brasil", countryCode: "BR", continent: "América do Sul" },
  { id: "br-b", name: "Série B", country: "Brasil", countryCode: "BR", continent: "América do Sul" },
  { id: "ar-1", name: "Liga Profesional Argentina", country: "Argentina", countryCode: "AR", continent: "América do Sul" },
  { id: "en-1", name: "Premier League", country: "Inglaterra", countryCode: "GB", continent: "Europa" },
  { id: "es-1", name: "La Liga", country: "Espanha", countryCode: "ES", continent: "Europa" },
  { id: "de-1", name: "Bundesliga", country: "Alemanha", countryCode: "DE", continent: "Europa" },
  { id: "it-1", name: "Serie A", country: "Itália", countryCode: "IT", continent: "Europa" },
  { id: "fr-1", name: "Ligue 1", country: "França", countryCode: "FR", continent: "Europa" },
  { id: "sa-1", name: "Saudi Pro League", country: "Arábia Saudita", countryCode: "SA", continent: "Ásia" },
  { id: "jp-1", name: "J1 League", country: "Japão", countryCode: "JP", continent: "Ásia" },
  { id: "kr-1", name: "K League 1", country: "Coreia do Sul", countryCode: "KR", continent: "Ásia" },
  { id: "ae-1", name: "UAE Pro League", country: "Emirados Árabes Unidos", countryCode: "AE", continent: "Ásia" },
  { id: "qa-1", name: "Qatar Stars League", country: "Catar", countryCode: "QA", continent: "Ásia" },
  { id: "cn-1", name: "Chinese Super League", country: "China", countryCode: "CN", continent: "Ásia" },
];
