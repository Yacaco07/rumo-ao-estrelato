"use client";

import { CONTRACT_ROLE_LABELS, type SignedContract } from "@/domain/career/contract";
import type { MarketAction, MarketState } from "@/domain/career/market-schema";

export const formatMoney = new Intl.NumberFormat("pt-BR", {
  style: "currency", currency: "BRL", maximumFractionDigits: 0,
}).format;

export function MarketPanel({ market, contract, busy, dispatch }: {
  market: MarketState; contract: SignedContract; busy: boolean; dispatch: (action: MarketAction) => void;
}) {
  const offers = market.offers.filter(({ status }) => status === "open");

  return <section className="panel season-card season-section" aria-labelledby="career-market">
    <h2 id="career-market">Mercado e clube</h2>
    <p>Insatisfação {market.dissatisfaction}%{market.promisedMinutes > 0 ? ` · Técnico avaliando seu espaço por ${market.promisedMinutes} rodada(s)` : ""}.</p>
    {market.loan && <p>Emprestado ao <strong>{market.loan.clubName}</strong> até <time dateTime={market.loan.dueOn}>{market.loan.dueOn.split("-").reverse().join("/")}</time>. Vínculo com {contract.clubName}.</p>}
    <div className="inline-actions">
      <button className="button button-outline" disabled={busy} onClick={() => dispatch({ kind: "talk" })}>Pedir mais minutos</button>
      <button className="button button-outline" disabled={busy || !!market.loan || market.request === "transfer"}
        onClick={() => dispatch({ kind: "request", request: "transfer" })}>Pedir transferência</button>
      <button className="button button-outline" disabled={busy || !!market.loan || market.request === "loan"}
        onClick={() => dispatch({ kind: "request", request: "loan" })}>Pedir empréstimo</button>
    </div>
    {market.request && <p>Pedido em análise: {market.request === "transfer" ? "transferência" : "empréstimo"}.</p>}
    {offers.length > 0 ? <>
      <h3>Propostas recebidas</h3>
      <ul className="offer-list market-offers">{offers.map((offer) => <li className="panel offer-card" key={offer.id}>
        <h4>{offer.terms.clubName}</h4>
        <p>{offer.kind === "transfer" ? "Compra" : "Empréstimo"} · {formatMoney(offer.fee)} entre clubes</p>
        <p>{offer.loanTerms ? `${offer.loanTerms.duration} meses · destino paga ${offer.loanTerms.salaryShare}% do salário`
          : `${formatMoney(offer.terms.monthlySalary)} por mês · ${offer.terms.months} meses`} · {CONTRACT_ROLE_LABELS[offer.terms.role]}</p>
        <p>{offer.fee >= offer.minimumFee ? "Diretoria de acordo com o valor." : "A diretoria recusou o valor."}</p>
        <div className="inline-actions">
          <button className="button button-dark button-small" disabled={busy || offer.fee < offer.minimumFee}
            onClick={() => dispatch({ kind: "accept", offerId: offer.id })}>Aceitar</button>
          <button className="button button-outline button-small" disabled={busy}
            onClick={() => dispatch({ kind: "reject", offerId: offer.id })}>Recusar</button>
        </div>
      </li>)}</ul>
    </> : <p>Sem proposta disponível. O interesse dos clubes pode surgir ao avançar o calendário.</p>}
    {market.news.length > 0 && <ul className="season-details">{market.news.map((news, index) => <li key={index}>{news}</li>)}</ul>}
  </section>;
}
