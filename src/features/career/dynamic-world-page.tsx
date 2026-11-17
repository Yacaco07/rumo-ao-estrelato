"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { objectiveLabel } from "@/domain/career/dynamic-world";
import { POSITION_GROUP_LABELS } from "@/domain/world/world-schema";
import { useAthlete } from "@/features/athlete/athlete-provider";
import { formatMoney } from "./market-panel";

export function DynamicWorldPage() {
  const { saved, loading } = useAthlete();
  const [selected, setSelected] = useState("");
  const world = saved?.world;
  const userClub = saved?.market?.loan?.clubId ?? saved?.contract?.clubId;
  const club = world?.clubs.find(({ id }) => id === (selected || userClub)) ?? world?.clubs[0];
  const roster = useMemo(() => world?.players.filter(({ clubId }) => clubId === club?.id)
    .sort((a, b) => a.position.localeCompare(b.position) || b.overall - a.overall) ?? [], [world, club?.id]);
  const news = world?.news.slice(0, 40) ?? [];

  function clubName(id: string | undefined) {
    return world?.clubs.find((club) => club.id === id)?.name ?? "clube";
  }

  return <>
    <div className="page-heading"><div><h1>Mundo da carreira<span className="lime-text">.</span></h1>
      <p>{world ? `Elencos e movimentações simulados · ${world.year}` : "Elencos e movimentações da sua carreira."}</p></div>
      <Link href="/temporada" className="button button-outline">Minha temporada</Link>
    </div>
    {loading ? <p role="status">Carregando o mundo…</p> : world && club ? <>
      <section className="panel season-card" aria-labelledby="world-club">
        <div className="field calendar-advance">
          <label htmlFor="world-club-select">Clube</label>
          <select id="world-club-select" value={club.id} onChange={(event) => setSelected(event.target.value)}>
            {world.clubs.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
          </select>
        </div>
        <h2 id="world-club">{club.name}</h2>
        <p>Técnico simulado · {club.coach.name}</p>
        <p>Objetivo · {objectiveLabel[club.objective]} · Prioridade no mercado · {POSITION_GROUP_LABELS[club.needs]}</p>
        <p>Orçamento simulado · {formatMoney(club.budget)}</p>
        <div className="season-table-wrap" tabIndex={0} role="region" aria-label="Elenco simulado">
          <table className="season-table"><caption>Elenco da carreira</caption>
            <thead><tr>{["Atleta", "Posição", "Idade", "Geral", "Origem"].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead>
            <tbody>
              {club.id === userClub && saved && !saved.market?.freeAgent && !saved.retiredOn &&
                <tr className="current"><th scope="row">{saved.athlete.name}</th><td>{saved.athlete.position}</td>
                  <td>{saved.season?.trainingPlan?.age ?? saved.athlete.age}</td><td>—</td><td>Seu atleta</td></tr>}
              {roster.map((player) => <tr key={player.id}><th scope="row">{player.name}</th>
                <td>{POSITION_GROUP_LABELS[player.position]}</td><td>{player.age ?? "A confirmar"}</td><td>{player.overall}</td>
                <td>{player.sourcePlayerId ? "Catálogo inicial" : "Atleta gerado"}</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel season-card season-section season-details" aria-labelledby="world-news">
        <h2 id="world-news">Movimentações pelo mundo</h2>
        {news.length ? <ul>{news.map((item, index) => <li key={index}>
          <strong>{item.year}</strong> · {item.name} · {item.kind === "retirement" ? `Aposentou-se no ${clubName(item.clubId)}`
            : item.kind === "debut" ? `Promovido da base do ${clubName(item.clubId)}`
              : item.kind === "coach" ? `Assumiu o ${clubName(item.clubId)} como técnico`
                : `${clubName(item.fromClubId)} → ${clubName(item.clubId)} · ${formatMoney(item.fee ?? 0)}`}
        </li>)}</ul> : <p>As movimentações de outros clubes aparecem na virada da edição.</p>}
      </section>
    </> : <section className="panel season-card"><h2>Inicie a carreira</h2>
      <p>A primeira ação na temporada cria o mundo que evolui junto com seu atleta.</p><Link className="button button-dark" href="/temporada">Abrir temporada</Link>
    </section>}
  </>;
}
