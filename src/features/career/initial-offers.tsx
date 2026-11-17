"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { useAthlete } from "@/features/athlete/athlete-provider";
import { getPosition } from "@/domain/athlete/positions";
import { createInitialOffers, type OfferCatalog } from "@/domain/career/initial-offers";
import type { ContractOffer } from "@/domain/career/contract";
import { POSITION_GROUP_LABELS } from "@/domain/world/world-schema";
import { ContractNegotiation } from "./contract-negotiation";
import { ContractTerms } from "./contract-terms";

export function InitialOffers({ catalog }: { catalog: OfferCatalog }) {
  const { saved, loading, error, signContract } = useAthlete();
  const contract = saved?.contract;
  const [signing, setSigning] = useState(false);
  const [selection, setSelection] = useState<string | null>(null);
  const [negotiated, setNegotiated] = useState<Record<string, ContractOffer>>({});
  const result = createInitialOffers(saved, catalog);
  const selected = result.status === "ready" ? result.offers.find(({ clubId }) => clubId === selection) : undefined;

  async function submitSignature(terms: ContractOffer) {
    setSigning(true);
    try {
      await signContract(terms);
    } finally {
      setSigning(false);
    }
  }

  return <>
    <div className="page-heading">
      <div>
        <h1>{contract ? "Primeiro contrato" : "Propostas iniciais"}<span className="lime-text">.</span></h1>
        <p>{contract ? "Seu primeiro vínculo na carreira simulada." : "Compare cinco oportunidades simuladas na Série A."}</p>
      </div>
    </div>

    {loading ? <p className="loading-line" role="status">Buscando seu perfil salvo…</p>
      : error ? <p>Recarregue seu perfil para consultar as propostas.</p>
      : contract ? <section className="panel contract-panel" aria-labelledby="signed-club">
        <p role="status" className="notice notice-success">Contrato assinado e salvo neste navegador.</p>
        <h2 id="signed-club">{contract.clubName}</h2>
        <p>{saved.athlete.name} · {getPosition(saved.athlete.position).label}</p>
        <ContractTerms terms={contract} />
        {saved.market?.loan && <p>Emprestado ao {saved.market.loan.clubName} · até {saved.market.loan.dueOn.split("-").reverse().join("/")}.</p>}
        <Link href="/temporada" className="button button-dark">{saved.season ? "Continuar temporada" : "Entrar na temporada"}<Icon name="right" size={17} /></Link>
      </section>
      : result.status === "profile-required" ? <section className="panel offer-empty">
        <h2>Conclua seu perfil</h2>
        <p>Distribua os dez pontos e salve o atleta para gerar as propostas.</p>
        <Link href="/atleta" className="button button-dark">Abrir meu atleta<Icon name="arrow" size={17} /></Link>
      </section>
      : result.status === "insufficient-clubs" ? <section className="panel offer-empty" role="status">
        <h2>Clubes elegíveis insuficientes</h2>
        <p>A simulação precisa de cinco clubes com posições documentadas na relação consultada.</p>
        <Link href="/universo" className="text-link">Consultar o catálogo<Icon name="right" size={17} /></Link>
      </section>
      : <section aria-labelledby="offers-athlete">
        <header className="offer-profile">
          <div>
            <h2 id="offers-athlete">{result.athlete.name}</h2>
            <p>{getPosition(result.athlete.position).label} · {result.athlete.age} anos</p>
          </div>
          <Link href="/atleta" className="button button-outline">Ver perfil<Icon name="right" size={17} /></Link>
        </header>
        <ul className="offer-list" aria-label="Cinco propostas simuladas">
          {result.offers.map((offer) => <li className={`panel offer-card${selection === offer.clubId ? " selected" : ""}`} key={offer.clubId}>
            <div className="offer-club">
              <span className="outline-icon"><Icon name="ball" size={21} /></span>
              <h3>{offer.clubName}</h3>
            </div>
            <dl><div><dt>{POSITION_GROUP_LABELS[result.sector]} na relação</dt><dd>{offer.sectorPlayers}</dd></div></dl>
            <ContractTerms terms={negotiated[offer.clubId] ?? offer} />
            <button type="button" className="button button-dark" aria-pressed={selection === offer.clubId}
              aria-label={`Selecionar proposta de ${offer.clubName}`} disabled={signing} onClick={() => setSelection(offer.clubId)}>
              {selection === offer.clubId ? "Proposta selecionada" : "Selecionar proposta"}
            </button>
          </li>)}
        </ul>
        {selected && <ContractNegotiation key={selected.clubId} offer={selected}
          negotiated={negotiated[selected.clubId]}
          onTerms={(terms) => setNegotiated((previous) => ({ ...previous, [terms.clubId]: terms }))}
          onSign={submitSignature} signing={signing} />}
        <p className="offer-context">A simulação prioriza clubes com menos atletas do seu setor na relação publicada. <Link href="/universo" className="text-link">Consultar fontes dos elencos</Link></p>
      </section>}
  </>;
}
