import type { Metadata } from "next";
import { LEAGUES } from "@/data/universe";
import { CURRENT_WORLD } from "@/data/world/current-world";
import { WorldExplorer } from "@/features/world/world-explorer";

export const metadata: Metadata = { title: "O universo" };

export default function UniversePage() {
  return <>
    <div className="page-heading"><div><p className="eyebrow">MUITOS CAMINHOS. UMA CARREIRA.</p><h1>O futebol ganha nomes<span className="lime-text">.</span></h1><p>Explore o primeiro recorte real do universo de Rumo ao Estrelato.</p></div><span className="chapter-pill"><span className="status-dot" />ETAPA 02 · O UNIVERSO</span></div>
    <WorldExplorer world={CURRENT_WORLD} />
    <details className="planned-universe"><summary><span><span className="eyebrow">O CAMINHO À FRENTE</span><strong>14 ligas no projeto</strong></span><span>Ver o universo planejado +</span></summary><p>O catálogo atual cobre os participantes da Série A 2026 e uma primeira relação de elenco. As outras ligas e os demais elencos serão pesquisados em etapas. No Brasil, não haverá estaduais.</p><div className="league-regions">{(["América do Sul", "Europa", "Ásia"] as const).map((continent) => <section key={continent} className="panel region-panel"><div className="section-heading"><h2>{continent}</h2><span className="small-muted">{LEAGUES.filter((league) => league.continent === continent).length} LIGAS</span></div><div className="league-list">{LEAGUES.filter((league) => league.continent === continent).map((league) => <div className="league-row" key={league.id}><span className="country-code">{league.countryCode}</span><div><h3>{league.name}</h3><p>{league.country}</p></div><span className="league-status">{league.id === "br-a" ? "Catálogo parcial" : "Planejada"}</span></div>)}</div></section>)}</div></details>
  </>;
}
