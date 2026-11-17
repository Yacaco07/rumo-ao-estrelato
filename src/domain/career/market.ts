import { addDays } from "./calendar";
import { hash } from "./random";
import { registrationAt, switchRegistration } from "./registration";
import type { SignedContract } from "./contract";
import type { MarketAction, MarketOffer, MarketState } from "./market-schema";
import type { Season } from "./season-schema";
import type { readSeason } from "./season";

export function emptyMarket(): MarketState {
  return { dissatisfaction: 0, request: null, promisedMinutes: 0, offers: [], news: [], moves: [] };
}

export type MarketCareer = { market: MarketState; season: Season; contract: SignedContract };
type LastRound = ReturnType<typeof readSeason>["last"];

export function addMonths(date: string, months: number): string {
  const value = new Date(date + "T00:00:00Z");
  const day = value.getUTCDate();
  value.setUTCDate(1);
  value.setUTCMonth(value.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth() + 1, 0)).getUTCDate();
  value.setUTCDate(Math.min(day, lastDay));
  return value.toISOString().slice(0, 10);
}

export function marketNews(market: MarketState, message: string): MarketState {
  return { ...market, news: [message, ...market.news].slice(0, 8) };
}

export function effectiveContract({ contract, market }: MarketCareer) {
  const loan = market.loan;
  return loan ? { ...contract, clubId: loan.clubId, clubName: loan.clubName, role: loan.role } : contract;
}

export function settleMarket(career: MarketCareer, date: string): MarketCareer {
  const { season, contract, market } = career;
  const offers = market.offers.map((offer) => offer.status === "open" && offer.expiresOn < date
    ? { ...offer, status: "expired" as const } : offer);
  if (!market.loan || market.loan.dueOn > date) return { ...career, market: { ...market, offers } };

  const { loan, ...after } = market;
  const move = { kind: "return", from: loan.clubName, to: contract.clubName, date, fee: 0 } as const;
  return {
    ...career,
    season: switchRegistration(season, contract),
    market: marketNews({ ...after, offers, moves: [...after.moves, move] }, `Empréstimo encerrado. Você voltou ao ${contract.clubName}.`),
  };
}

function searchOffers(career: MarketCareer, date: string): MarketState {
  const { season, contract, market } = career;
  const round = season.rounds.length;
  const due = market.request !== null || round % 6 === 0;
  if (!due || market.loan || market.offers.some((offer) => offer.status === "open") ||
    (market.lastSearch && addDays(market.lastSearch, 14) > date)) return market;

  const seed = `${season.seed}:${date}:mercado`;
  const candidates = season.clubs.filter(({ id }) => id !== contract.clubId)
    .map((club) => ({ club, rank: hash(`${seed}:${club.id}`) }))
    .sort((a, b) => a.rank - b.rank || a.club.id.localeCompare(b.club.id, "en")).slice(0, 3);
  const offers: MarketOffer[] = candidates.map(({ club }, index) => {
    const kind = market.request ?? (index === 1 ? "loan" : "transfer");
    const base = contract.monthlySalary;
    const minimumFee = Math.ceil(base * (kind === "loan" ? 4 : market.request === "transfer" ? 22 : 30) / 100) * 100;
    const fee = minimumFee + (index === 2 ? -1000 : (index + 1) * 1200);
    const role = index === 0 ? "rotation" : "alternative";
    return {
      id: `${date}:${club.id}`, originClubId: contract.clubId, kind,
      terms: { clubId: club.id, clubName: club.name, catalogVersion: season.worldVersion, monthlySalary: Math.min(100_000, base + index * 200), months: 24, role },
      fee, minimumFee, expiresOn: addDays(date, 28), status: "open",
      ...(kind === "loan" ? { loanTerms: { duration: index === 1 ? 12 : 6, salaryShare: 60 } } : {}),
    };
  });
  return offers.length ? marketNews({ ...market, lastSearch: date, offers: [...offers, ...market.offers].slice(0, 12) },
    `${offers.length} clubes demonstraram interesse. Confira as condições no mercado.`) : market;
}

export function marketAfterRound(career: MarketCareer, date: string, last: LastRound): MarketState {
  let market = career.market;
  const appearance = last?.played?.appearance;
  if (appearance && !appearance.absence) {
    const { role } = registrationAt(career.season, career.season.rounds.length - 1);
    const minimum = role === "crucial" ? 65 : role === "rotation" ? 42 : 20;
    const missedExpectation = appearance.minutes < minimum;
    const change = missedExpectation ? (market.promisedMinutes ? 13 : 8) : -6;
    const dissatisfaction = Math.max(0, Math.min(100, market.dissatisfaction + change));
    market = { ...market, dissatisfaction, promisedMinutes: Math.max(0, market.promisedMinutes - 1) };
    if (dissatisfaction >= 65 && career.market.dissatisfaction < 65) {
      market = marketNews(market, "A falta de minutos aumentou sua insatisfação com o clube.");
    }
  }
  return searchOffers({ ...career, market }, date);
}

type MarketResult = { ok: true; career: MarketCareer } | { ok: false; message: string };

export function useMarket(career: MarketCareer, action: MarketAction, date: string): MarketResult {
  const { season, contract, market } = settleMarket(career, date);
  const current = { season, contract, market };
  function update(next: MarketState): MarketResult { return { ok: true, career: { ...current, market: next } }; }
  if (action.kind === "talk") {
    if (market.talkedOn && addDays(market.talkedOn, 21) > date) return { ok: false, message: "A comissão já respondeu ao seu pedido recente." };
    const eligible = market.dissatisfaction >= 25;
    if (eligible) current.season = { ...season, coachTalkRounds: Array.from(new Set([...(season.coachTalkRounds ?? []), season.rounds.length])) };
    return update(marketNews({
      ...market, talkedOn: date, promisedMinutes: eligible ? 4 : 0,
      dissatisfaction: Math.max(0, market.dissatisfaction - (eligible ? 10 : 0)),
    }, eligible ? "O treinador aceitou avaliar mais minutos nas próximas quatro rodadas."
      : "O treinador pediu que você siga trabalhando para conquistar espaço."));
  }
  if (action.kind === "request") {
    if (market.loan) return { ok: false, message: "O pedido volta a ficar disponível ao encerrar o empréstimo atual." };
    if (market.request === action.request) return { ok: false, message: "Esse pedido já está com a diretoria." };
    const label = action.request === "loan" ? "empréstimo" : "transferência";
    const offers = market.offers.map((offer) => offer.status === "open" ? { ...offer, status: "expired" as const } : offer);
    return update(marketNews({ ...market, offers, request: action.request, lastSearch: undefined }, `Você solicitou inclusão na lista de ${label}.`));
  }
  const offer = market.offers.find(({ id }) => id === action.offerId);
  if (!offer || offer.status !== "open" || offer.originClubId !== contract.clubId || market.loan) {
    return { ok: false, message: "A proposta já não está disponível." };
  }
  if (action.kind === "reject") {
    return update(marketNews({ ...market, offers: market.offers.map((candidate) =>
      candidate.id === offer.id ? { ...candidate, status: "rejected" } : candidate) }, `Você recusou a proposta do ${offer.terms.clubName}.`));
  }
  if (offer.fee < offer.minimumFee) return { ok: false, message: "O clube atual recusou a negociação pelo valor oferecido." };
  const registration = switchRegistration(season, { clubId: offer.terms.clubId, role: offer.terms.role });
  const move = { kind: offer.kind, from: contract.clubName, to: offer.terms.clubName, date, fee: offer.fee };
  const next = marketNews({
    ...market, request: null, promisedMinutes: 0, dissatisfaction: 0, moves: [...market.moves, move],
    offers: market.offers.map((candidate) => candidate.id === offer.id ? { ...candidate, status: "accepted" }
      : candidate.status === "open" ? { ...candidate, status: "expired" } : candidate),
  }, `Você acertou ${offer.kind === "loan" ? "um empréstimo" : "uma transferência"} com ${offer.terms.clubName}.`);

  if (offer.kind === "loan" && offer.loanTerms) {
    return { ok: true, career: { season: registration, contract, market: { ...next, loan: {
      clubId: offer.terms.clubId, clubName: offer.terms.clubName, role: offer.terms.role,
      startedOn: date, dueOn: addMonths(date, offer.loanTerms.duration), terms: offer.loanTerms,
    } } } };
  }
  return { ok: true, career: { season: registration, market: next, contract: { ...offer.terms, signedAt: `${date}T00:00:00.000Z` } } };
}
