"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { InitialOffer } from "@/domain/career/initial-offers";
import { CONTRACT_MONTHS, CONTRACT_ROLE_LABELS, contractRoleSchema, negotiateContract, SALARY_STEP, type ContractOffer } from "@/domain/career/contract";
import { ContractTerms } from "./contract-terms";

export function ContractNegotiation({
  offer, negotiated, onTerms, onSign, signing,
}: {
  offer: InitialOffer;
  negotiated?: ContractOffer;
  onTerms: (terms: ContractOffer) => void;
  onSign: (terms: ContractOffer) => Promise<void>;
  signing: boolean;
}) {
  const { sectorPlayers: _count, ...original } = offer;
  const terms = negotiated ?? original;
  const heading = useRef<HTMLHeadingElement>(null);
  const [salary, setSalary] = useState(String(terms.monthlySalary));
  const [months, setMonths] = useState(terms.months);
  const [role, setRole] = useState(terms.role);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const edited = Number(salary) !== terms.monthlySalary || months !== terms.months || role !== terms.role;

  useEffect(() => { heading.current?.focus(); }, []);

  function submitCounteroffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const reply = negotiateContract(original, { monthlySalary: Number(salary), months, role });
    setError("");
    if (reply.status === "invalid") {
      setError("Escolha um prazo e um papel válidos e informe um salário em múltiplos de R$ 100.");
      return;
    }
    if (reply.status === "rejected") {
      setFeedback("O clube recusou a contraproposta. Os termos disponíveis continuam abaixo.");
      setSalary(String(terms.monthlySalary));
      setMonths(terms.months);
      setRole(terms.role);
      return;
    }
    onTerms(reply.terms);
    setSalary(String(reply.terms.monthlySalary));
    setMonths(reply.terms.months);
    setRole(reply.terms.role);
    setFeedback(reply.status === "accepted" ? "O clube aceitou sua contraproposta." : "O clube retornou com novos termos.");
  }

  async function sign() {
    if (signing || edited) return;
    setError("");
    try {
      await onSign(terms);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Não foi possível salvar o contrato.");
    }
  }

  return <section className="panel contract-panel" aria-labelledby="negotiation-heading">
    <h2 id="negotiation-heading" ref={heading} tabIndex={-1}>Negociação com {offer.clubName}</h2>
    <h3>Termos disponíveis</h3>
    <ContractTerms terms={terms} />
    {feedback && <p className="notice notice-success" role="status">{feedback}</p>}
    {error && <p className="notice notice-error" role="alert">{error}</p>}

    {confirm ? <div>
      <p>Confirme estes termos para vincular seu atleta a {offer.clubName}.</p>
      <div className="inline-actions">
        <button className="button button-dark" disabled={signing} onClick={() => void sign()}>{signing ? "Salvando contrato…" : "Confirmar assinatura"}</button>
        <button className="button button-outline" disabled={signing} onClick={() => { setConfirm(false); setError(""); }}>Voltar a negociar</button>
      </div>
    </div> : <form onSubmit={submitCounteroffer}>
      <div className="contract-fields">
        <div className="field">
          <label htmlFor="contract-salary">Salário mensal solicitado (R$)</label>
          <input id="contract-salary" type="number" min={1000} max={100000} step={SALARY_STEP} required value={salary} onChange={(event) => setSalary(event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="contract-months">Duração solicitada</label>
          <select id="contract-months" value={months} onChange={(event) => setMonths(Number(event.target.value) as ContractOffer["months"])}>
            {CONTRACT_MONTHS.map((option) => <option key={option} value={option}>{option} meses</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="contract-role">Papel no elenco</label>
          <select id="contract-role" value={role} onChange={(event) => setRole(event.target.value as ContractOffer["role"])}>
            {contractRoleSchema.options.map((option) => <option key={option} value={option}>{CONTRACT_ROLE_LABELS[option]}</option>)}
          </select>
        </div>
      </div>
      <div className="inline-actions">
        <button type="submit" className="button button-outline" disabled={!edited}>Enviar contraproposta</button>
        <button type="button" className="button button-dark" disabled={edited} onClick={() => { setConfirm(true); setError(""); }}>Revisar assinatura</button>
      </div>
      {edited && <p className="offer-context">Envie a contraproposta para o clube responder antes de assinar.</p>}
    </form>}
  </section>;
}
