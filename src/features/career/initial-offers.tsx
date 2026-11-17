"use client";

import Link from "next/link";
import { Icon } from "@/components/icon";
import { useAthlete } from "@/features/athlete/athlete-provider";
import { getPosition } from "@/domain/athlete/positions";
import { createInitialOffers, type OfferCatalog } from "@/domain/career/initial-offers";
import { POSITION_GROUP_LABELS } from "@/domain/world/world-schema";

export function InitialOffers({ catalog }: { catalog: OfferCatalog }) {
  const { saved, loading, error } = useAthlete();
  const result = createInitialOffers(saved, catalog);

  return <>
    <div className="page-heading">
      <div>
        <h1>Propostas iniciais<span className="lime-text">.</span></h1>
        <p>Compare cinco oportunidades simuladas na Série A.</p>
      </div>
    </div>

    {loading ? <p className="loading-line" role="status">Buscando seu perfil salvo…</p>
      : error ? <p>Recarregue seu perfil para consultar as propostas.</p>
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
          {result.offers.map((offer) => <li className="panel offer-card" key={offer.clubId}>
            <div className="offer-club">
              <span className="outline-icon"><Icon name="ball" size={21} /></span>
              <h3>{offer.clubName}</h3>
            </div>
            <dl>
              <div><dt>{POSITION_GROUP_LABELS[result.sector]} na relação</dt><dd>{offer.sectorPlayers}</dd></div>
              <div><dt>Papel simulado</dt><dd>{offer.role === "rotation" ? "Rotação" : "Desenvolvimento"}</dd></div>
              <div><dt>Duração simulada</dt><dd>{offer.months} meses</dd></div>
            </dl>
          </li>)}
        </ul>
        <p className="offer-context">A simulação prioriza clubes com menos atletas do seu setor na relação publicada. Papel e duração são parâmetros do jogo. <Link href="/universo" className="text-link">Consultar fontes dos elencos</Link></p>
      </section>}
  </>;
}
