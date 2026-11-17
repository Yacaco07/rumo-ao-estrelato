import { addDays, firstRoundDate, FIRST_SEASON_YEAR } from "./calendar";
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
  const lastDeal = market.moves.findLast(({ kind }) => kind === "transfer" || kind === "renewal");
  const contractEnd = market.contractEnd ?? addMonths(lastDeal?.date ?? firstRoundDate(FIRST_SEASON_YEAR), contract.months);
  let result: MarketCareer = { ...career, market: { ...market, offers, contractEnd } };

  if (market.loan && (market.loan.dueOn <= date || contractEnd <= date)) {
    const { loan, ...after } = result.market;
    const move = { kind: "return", from: loan!.clubName, to: contract.clubName, date: loan!.dueOn < contractEnd ? loan!.dueOn : contractEnd, fee: 0 } as const;
    result = {
      ...career,
      season: switchRegistration(season, contract),
      market: marketNews({ ...after, moves: [...after.moves, move] }, `Empréstimo encerrado. Você voltou ao ${contract.clubName}.`),
    };
  }
  if (contractEnd > date || result.market.freeAgent) return result;

  const release = { kind: "release", from: contract.clubName, to: "Sem clube", date: contractEnd, fee: 0 } as const;
  return {
    ...result,
    season: switchRegistration(result.season, { ...contract, inactive: true }),
    market: marketNews({
      ...result.market, freeAgent: true, request: null, promisedMinutes: 0, lastSearch: undefined,
      offers: result.market.offers.map((offer) => offer.status === "open" ? { ...offer, status: "expired" } : offer),
      moves: [...result.market.moves, release],
    }, `Seu contrato com ${contract.clubName} acabou. Você pode negociar como agente livre.`),
  };

}

function searchOffers(career: MarketCareer, date: string): MarketState {
  const { season, contract, market } = career;
  const round = season.rounds.length;
  const due = market.freeAgent || market.request !== null || round % 6 === 0;
  if (!due || market.loan || market.offers.some((offer) => offer.status === "open") ||
    (market.lastSearch && addDays(market.lastSearch, 14) > date)) return market;

  const seed = `${season.seed}:${date}:mercado`;
  const candidates = [...season.clubs, ...(season.brazilB ?? [])].filter(({ id }) => id !== contract.clubId)
    .map((club) => ({ club, rank: hash(`${seed}:${club.id}`) }))
    .sort((a, b) => a.rank - b.rank || a.club.id.localeCompare(b.club.id, "en")).slice(0, 3);
  const offers = candidates.map(({ club }, index): MarketOffer | null => {
    const wantsLoan = market.request === "loan" || (market.request === null && index === 1);
    const loanDuration = index === 1 ? 12 : 6;
    const canLoan = !market.freeAgent && market.contractEnd && addMonths(date, loanDuration) <= market.contractEnd;
    if (market.request === "loan" && !canLoan) return null;
    const kind = wantsLoan && canLoan ? "loan" : "transfer";
    const base = contract.monthlySalary;
    const minimumFee = market.freeAgent ? 0 : Math.ceil(base * (kind === "loan" ? 4 : market.request === "transfer" ? 22 : 30) / 100) * 100;
    const fee = market.freeAgent ? 0 : minimumFee + (index === 2 ? -1000 : (index + 1) * 1200);
    const role = index === 0 ? "rotation" : "alternative";
    return {
      id: `${date}:${club.id}`, originClubId: contract.clubId, kind,
      terms: { clubId: club.id, clubName: club.name, catalogVersion: season.worldVersion, monthlySalary: Math.min(100_000, base + index * 200), months: 24, role },
      fee, minimumFee, expiresOn: addDays(date, 28), status: "open",
      patience: 3, budget: {
        fee: market.freeAgent ? 0 : Math.max(fee, minimumFee) + 5000,
        salary: Math.min(100_000, base + 600 + index * 200),
      },
      ...(kind === "loan" ? { loanTerms: { duration: loanDuration, salaryShare: 60 } } : {}),
    };
  }).filter((offer) => offer !== null);
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
  if (action.kind === "renew") {
    if (market.loan || (!market.freeAgent && market.contractEnd && addMonths(date, 6) < market.contractEnd)) {
      return { ok: false, message: "A renovação abre nos seis meses finais do vínculo." };
    }
    if (market.offers.some(({ status, kind }) => status === "open" && kind === "renewal")) {
      return { ok: false, message: "Uma proposta de renovação já está aberta." };
    }
    const monthlySalary = Math.min(100_000, contract.monthlySalary + 300);
    const offer: MarketOffer = {
      id: `renovacao:${date}:${contract.clubId}`, originClubId: contract.clubId, kind: "renewal",
      terms: { clubId: contract.clubId, clubName: contract.clubName, catalogVersion: contract.catalogVersion, months: 24, role: contract.role, monthlySalary },
      fee: 0, minimumFee: 0, expiresOn: addDays(date, 21), status: "open",
      patience: 3, budget: { fee: 0, salary: Math.min(100_000, monthlySalary + 500) },
    };
    const offers = [offer, ...market.offers.filter(({ id }) => id !== offer.id)].slice(0, 12);
    return update(marketNews({ ...market, offers }, `${contract.clubName} enviou uma proposta de contrato.`));
  }
  if (action.kind === "talk") {
    if (market.freeAgent) return { ok: false, message: "Você precisa estar vinculado a um clube para falar com o treinador." };
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
    if (market.freeAgent) return { ok: false, message: "Como agente livre, você recebe ofertas sem precisar entrar na lista." };
    if (market.loan) return { ok: false, message: "O pedido volta a ficar disponível ao encerrar o empréstimo atual." };
    if (market.request === action.request) return { ok: false, message: "Esse pedido já está com a diretoria." };
    if (action.request === "loan" && market.contractEnd && addMonths(date, 6) > market.contractEnd) {
      return { ok: false, message: "Seu contrato termina antes do empréstimo mínimo de seis meses." };
    }
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
  if (action.kind === "counter") {
    if ((offer.kind === "loan") !== !!action.loanTerms) return { ok: false, message: "Confira as condições do empréstimo." };
    if (offer.loanTerms && action.salary !== contract.monthlySalary) return { ok: false, message: "O empréstimo mantém o salário firmado com o clube de origem." };
    if (offer.patience === 0) return { ok: false, message: "As contrapropostas chegaram ao limite deste clube." };
    const budget = offer.budget ?? { fee: Math.max(offer.fee, offer.minimumFee) + 5000, salary: Math.min(100_000, offer.terms.monthlySalary + 600) };
    const patience = Math.max(0, (offer.patience ?? 3) - 1);
    const loanImpossible = action.loanTerms && market.contractEnd && addMonths(date, action.loanTerms.duration) > market.contractEnd;
    const excessive = action.salary > budget.salary + 1500 || action.fee > budget.fee + 20000 || loanImpossible;
    const withdrawn = patience === 0 && excessive;
    const nextOffer: MarketOffer = excessive
      ? { ...offer, patience, budget, status: withdrawn ? "rejected" : "open" }
      : {
        ...offer, patience, budget, fee: Math.max(offer.minimumFee, Math.min(action.fee, budget.fee)),
        terms: { ...offer.terms, monthlySalary: Math.min(action.salary, budget.salary), months: action.months, role: action.role },
        ...(action.loanTerms ? { loanTerms: action.loanTerms } : {}),
      };
    const message = withdrawn ? `${offer.terms.clubName} encerrou a negociação.`
      : excessive ? `${offer.terms.clubName} recusou a contraproposta e manteve os termos.`
      : nextOffer.fee !== action.fee || nextOffer.terms.monthlySalary !== action.salary
        ? `${offer.terms.clubName} respondeu com novas condições.`
        : `${offer.terms.clubName} aceitou as condições solicitadas. Revise e confirme se quiser fechar.`;
    return update(marketNews({ ...market, offers: market.offers.map((candidate) => candidate.id === offer.id ? nextOffer : candidate) }, message));
  }
  if (offer.fee < offer.minimumFee) return { ok: false, message: "O clube atual recusou a negociação pelo valor oferecido." };
  if (offer.loanTerms && market.contractEnd && addMonths(date, offer.loanTerms.duration) > market.contractEnd) {
    return { ok: false, message: "O empréstimo ultrapassa o fim do vínculo. Negocie uma duração menor." };
  }
  const registration = switchRegistration(season, { clubId: offer.terms.clubId, role: offer.terms.role });
  const move = { kind: offer.kind, from: contract.clubName, to: offer.terms.clubName, date, fee: offer.fee };
  const next = marketNews({
    ...market, request: null, promisedMinutes: 0, dissatisfaction: 0, moves: [...market.moves, move],
    offers: market.offers.map((candidate) => candidate.id === offer.id ? { ...candidate, status: "accepted" }
      : candidate.status === "open" ? { ...candidate, status: "expired" } : candidate),
  }, offer.kind === "renewal" ? `Você assinou um novo contrato com ${offer.terms.clubName}.`
    : `Você acertou ${offer.kind === "loan" ? "um empréstimo" : "uma transferência"} com ${offer.terms.clubName}.`);

  if (offer.kind === "loan" && offer.loanTerms) {
    return { ok: true, career: { season: registration, contract, market: { ...next, loan: {
      clubId: offer.terms.clubId, clubName: offer.terms.clubName, role: offer.terms.role,
      startedOn: date, dueOn: addMonths(date, offer.loanTerms.duration), terms: offer.loanTerms,
    } } } };
  }
  const { freeAgent: _released, ...employed } = next;
  return { ok: true, career: {
    season: registration,
    market: { ...employed, contractEnd: addMonths(date, offer.terms.months) },
    contract: { ...offer.terms, signedAt: `${date}T00:00:00.000Z` },
  } };
}
