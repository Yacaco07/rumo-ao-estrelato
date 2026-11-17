"use client";

import type { FormEvent } from "react";
import { CONTRACT_MONTHS, CONTRACT_ROLES, CONTRACT_ROLE_LABELS, type SignedContract } from "@/domain/career/contract";
import type { MarketAction, MarketOffer, MarketState } from "@/domain/career/market-schema";

export const formatMoney = new Intl.NumberFormat("pt-BR", {
  style: "currency", currency: "BRL", maximumFractionDigits: 0,
}).format;

function CounterForm({ offer, contract, busy, dispatch }: {
  offer: MarketOffer; contract: SignedContract; busy: boolean; dispatch: (action: MarketAction) => void;
}) {
  const loan = offer.loanTerms;
  const patience = offer.patience ?? 3;
  if (!patience) return <p>Limite de contrapropostas atingido.</p>;

  function counter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    dispatch({
      kind: "counter", offerId: offer.id, fee: Number(form.get("fee")), salary: Number(form.get("salary")),
      months: Number(form.get("months")) as SignedContract["months"], role: form.get("role") as SignedContract["role"],
      ...(loan ? { loanTerms: {
        duration: Number(form.get("loan-months")) as 6 | 12, salaryShare: Number(form.get("share")),
      } } : {}),
    });
  }

  return <details className="season-details">
    <summary>Contraproposta · {patience} tentativa(s)</summary>
    <form className="market-counter" onSubmit={counter} key={patience}>
      <label>Valor entre clubes (R$)<input required type="number" name="fee" min={0} max={100_000_000} step={100}
        defaultValue={offer.fee} readOnly={offer.kind === "renewal"} /></label>
      <label>Salário mensal (R$)<input required type="number" name="salary" min={1000} max={100_000} step={100}
        defaultValue={loan ? contract.monthlySalary : offer.terms.monthlySalary} readOnly={!!loan} /></label>
      <label>Prazo do contrato<select name="months" defaultValue={offer.terms.months}>
        {CONTRACT_MONTHS.map((months) => <option key={months} value={months}>{months} meses</option>)}
      </select></label>
      <label>Papel no elenco<select name="role" defaultValue={offer.terms.role === "development" ? "alternative" : offer.terms.role}>
        {CONTRACT_ROLES.map((role) => <option key={role} value={role}>{CONTRACT_ROLE_LABELS[role]}</option>)}
      </select></label>
      {loan && <>
        <label>Prazo do empréstimo<select name="loan-months" defaultValue={loan.duration}><option value={6}>6 meses</option><option value={12}>12 meses</option></select></label>
        <label>Salário pago pelo destino (%)<input required type="number" name="share" min={25} max={100} step={5} defaultValue={loan.salaryShare} /></label>
      </>}
      <button className="button button-outline button-small" disabled={busy}>Enviar contraproposta</button>
    </form>
  </details>;
}

export function MarketPanel({ market, contract, busy, dispatch }: {
  market: MarketState; contract: SignedContract; busy: boolean; dispatch: (action: MarketAction) => void;
}) {
  const offers = market.offers.filter(({ status }) => status === "open");

  return <section className="panel season-card season-section" aria-labelledby="career-market">
    <h2 id="career-market">Mercado e clube</h2>
    {market.freeAgent ? <p>Você está sem clube e pode negociar como agente livre.</p>
      : market.contractEnd && <p>Contrato vigente até <time dateTime={market.contractEnd}>{market.contractEnd.split("-").reverse().join("/")}</time>.</p>}
    <p>Insatisfação {market.dissatisfaction}%{market.promisedMinutes > 0 ? ` · Técnico avaliando seu espaço por ${market.promisedMinutes} rodada(s)` : ""}.</p>
    {market.loan && <p>Emprestado ao <strong>{market.loan.clubName}</strong> até <time dateTime={market.loan.dueOn}>{market.loan.dueOn.split("-").reverse().join("/")}</time>. Vínculo com {contract.clubName}.</p>}
    <div className="inline-actions">
      <button className="button button-outline" disabled={busy || !!market.freeAgent} onClick={() => dispatch({ kind: "talk" })}>Pedir mais minutos</button>
      <button className="button button-outline" disabled={busy || !!market.freeAgent || !!market.loan || market.request === "transfer"}
        onClick={() => dispatch({ kind: "request", request: "transfer" })}>Pedir transferência</button>
      <button className="button button-outline" disabled={busy || !!market.freeAgent || !!market.loan || market.request === "loan"}
        onClick={() => dispatch({ kind: "request", request: "loan" })}>Pedir empréstimo</button>
      <button className="button button-outline" disabled={busy || !!market.loan || offers.some(({ kind }) => kind === "renewal")}
        onClick={() => dispatch({ kind: "renew" })}>{market.freeAgent ? "Negociar com último clube" : "Solicitar renovação"}</button>
    </div>
    {market.request && <p>Pedido em análise: {market.request === "transfer" ? "transferência" : "empréstimo"}.</p>}
    {offers.length > 0 ? <>
      <h3>Propostas recebidas</h3>
      <ul className="offer-list market-offers">{offers.map((offer) => <li className="panel offer-card" key={offer.id}>
        <h4>{offer.terms.clubName}</h4>
        <p>{offer.kind === "transfer" ? "Compra" : offer.kind === "renewal" ? "Renovação" : "Empréstimo"} · {formatMoney(offer.fee)} entre clubes</p>
        <p>{offer.loanTerms ? `${offer.loanTerms.duration} meses · destino paga ${offer.loanTerms.salaryShare}% do salário`
          : `${formatMoney(offer.terms.monthlySalary)} por mês · ${offer.terms.months} meses`} · {CONTRACT_ROLE_LABELS[offer.terms.role]}</p>
        <p>{offer.fee >= offer.minimumFee ? "Diretoria de acordo com o valor." : "A diretoria recusou o valor."}</p>
        <div className="inline-actions">
          <button className="button button-dark button-small" disabled={busy || offer.fee < offer.minimumFee}
            onClick={() => dispatch({ kind: "accept", offerId: offer.id })}>Aceitar</button>
          <button className="button button-outline button-small" disabled={busy}
            onClick={() => dispatch({ kind: "reject", offerId: offer.id })}>Recusar</button>
        </div>
        <CounterForm offer={offer} contract={contract} busy={busy} dispatch={dispatch} />
      </li>)}</ul>
    </> : <p>Sem proposta disponível. O interesse dos clubes pode surgir ao avançar o calendário.</p>}
    {market.news.length > 0 && <ul className="season-details">{market.news.map((news, index) => <li key={index}>{news}</li>)}</ul>}
  </section>;
}
