import type { Metadata } from "next";
import Link from "next/link";
import { COMPETITION_MEMBERS } from "@/data/world/competition-members";
import { LEAGUES } from "@/data/universe";
import { CURRENT_WORLD } from "@/data/world/current-world";
import { CareerWorldExplorer } from "@/features/world/career-world-explorer";

export const metadata: Metadata = { title: "O universo" };

export default function UniversePage() {
  return <>
    <div className="page-heading"><div><p className="eyebrow">MUITOS CAMINHOS. UMA CARREIRA.</p><h1>O futebol ganha nomes<span className="lime-text">.</span></h1><p>Explore o primeiro recorte real do universo de Rumo ao Estrelato.</p></div><span className="chapter-pill"><span className="status-dot" />ETAPA 02 · O UNIVERSO</span></div>
    <CareerWorldExplorer world={CURRENT_WORLD} />
    <details className="planned-universe"><summary><span><span className="eyebrow">O CAMINHO À FRENTE</span><strong>14 ligas na simulação</strong></span><span>Ver ligas e fontes +</span></summary><p>A Série A 2026 tem jogadores pesquisados. As outras 13 ligas têm participantes e edição documentados. Consulte as listas de cada liga e acompanhe as classificações simuladas na sua carreira.</p><div className="league-regions">{(["América do Sul", "Europa", "Ásia"] as const).map((continent) => <section key={continent} className="panel region-panel"><div className="section-heading"><h2>{continent}</h2><span className="small-muted">{LEAGUES.filter((league) => league.continent === continent).length} LIGAS</span></div><div className="league-list">{LEAGUES.filter((league) => league.continent === continent).map((league) => <div className="league-row" key={league.id}><span className="country-code">{league.countryCode}</span><div><h3>{league.name}</h3><p>{league.country}</p></div><span className="league-status">{league.id === "br-a" ? "Clubes e jogadores" : "Participantes documentados"}</span></div>)}</div></section>)}</div><div className="season-section">
      <div className="inline-actions"><Link className="button button-dark" href="/competicoes">Ver competições da carreira</Link><Link className="button button-outline" href="/mundo">Ver elencos simulados</Link></div>
      {COMPETITION_MEMBERS.map((league) => <details className="panel season-card season-section season-details" key={league.id}>
        <summary>{league.name} · {league.edition} · {league.clubs.length} clubes</summary>
        <p>Elencos a pesquisar. Consulta em {league.accessedOn.split("-").reverse().join("/")}.</p>
        <ul>{league.clubs.map(({ id, name }) => <li key={id}>{name}</li>)}</ul>
        {league.publishers.map((source) => <p key={source.url}><a className="text-link" href={source.url} target="_blank" rel="noreferrer">{source.name}</a></p>)}
      </details>)}
    </div></details>
  </>;
}
