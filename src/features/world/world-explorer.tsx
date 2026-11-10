"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { filterWorldClubs, getClubPlayers, getWorldCoverage, type RosterFilter } from "@/domain/world/world-queries";
import { POSITION_GROUP_LABELS, positionGroups, type PositionGroup, type WorldSnapshot, type WorldSource } from "@/domain/world/world-schema";

function formatDate(value: string) { return value.split("-").reverse().join("/"); }

function SourceLink({ source }: { source: WorldSource }) {
  return <div className="catalog-source">
    <a href={source.url} target="_blank" rel="noreferrer">{source.publisher}<Icon name="arrow" size={13} /></a>
    <span>Consulta: {formatDate(source.accessedOn)}{source.updatedOn ? ` · Atualização informada: ${formatDate(source.updatedOn)}` : " · Atualização não informada pela fonte"}</span>
  </div>;
}

export function WorldExplorer({ world }: { world: WorldSnapshot }) {
  const coverage = getWorldCoverage(world);
  const [query, setQuery] = useState("");
  const [rosterFilter, setRosterFilter] = useState<RosterFilter>("all");
  const [selectedId, setSelectedId] = useState(world.clubs.find((club) => club.roster.status === "listed")?.id ?? world.clubs[0].id);
  const [positionFilter, setPositionFilter] = useState<PositionGroup | "unknown" | "all">("all");
  const filtered = filterWorldClubs(world, query, rosterFilter);
  const selected = filtered.find((club) => club.id === selectedId) ?? filtered[0] ?? null;
  const competition = world.competitions.find((item) => item.id === selected?.competitionId) ?? world.competitions[0];
  const players = selected ? getClubPlayers(world, selected.id) : [];
  const visiblePlayers = players.filter((player) => positionFilter === "all" || (positionFilter === "unknown" ? player.positionGroup === null : player.positionGroup === positionFilter));
  const membershipSource = world.sources.find((source) => source.id === selected?.provenance.competitionId);
  const rosterSources = world.sources.filter((source) => source.kind === "squad-list" && source.subjectId === selected?.id);
  const competitionAthletes = selected?.roster.scope === "competition-athletes";
  const hasFilters = query !== "" || rosterFilter !== "all";

  return <>
    <section className="catalog-banner" aria-labelledby="catalog-title">
      <div><span className="catalog-kicker"><span className="status-dot" />SÉRIE A · FONTES CONSULTADAS</span><h2 id="catalog-title">Brasil. Série A. {competition.season}<span>.</span></h2><p>Os primeiros clubes e jogadores já têm nome.<br />A construção do seu universo começa por aqui.</p><span className="catalog-date"><Icon name="clock" size={13} />Dados consultados em {formatDate(world.asOfDate)}</span></div>
      <div className="catalog-numbers"><div><strong>{coverage.clubs}</strong><span>clubes identificados</span></div><div><strong>{coverage.listedRosters}</strong><span>{coverage.listedRosters === 1 ? "relação consultada" : "relações consultadas"}</span></div><div><strong>{coverage.players}</strong><span>jogadores listados</span></div></div>
    </section>
    <div className="catalog-scope"><Icon name="info" size={17} /><p>Catálogo para consulta. {coverage.pendingRosters > 0 ? `Há ${coverage.pendingRosters} elencos aguardando pesquisa.` : "Todos os clubes têm fontes consultadas; o alcance das listas e os campos pendentes estão indicados por clube."} Inscrições, contratos e propostas continuam nas próximas etapas.</p></div>
    <section className="catalog-section" aria-labelledby="clubs-title">
      <div className="section-heading catalog-section-title"><div><span className="eyebrow">CONHEÇA SEU FUTURO CAMINHO</span><h2 id="clubs-title">Explore os clubes.</h2></div><span className="subtle-badge">Participantes conforme a CBF</span></div>
      <div className="catalog-toolbar">
        <div className="catalog-search"><label htmlFor="club-search">Buscar clube</label><div><Icon name="search" size={17} /><input id="club-search" type="search" value={query} placeholder="Nome do clube" onChange={(event) => { setQuery(event.target.value); setPositionFilter("all"); }} /></div></div>
        <div className="catalog-filter"><label htmlFor="roster-coverage">Cobertura do elenco</label><select id="roster-coverage" value={rosterFilter} onChange={(event) => { setRosterFilter(event.target.value as RosterFilter); setPositionFilter("all"); }}><option value="all">Todos os clubes</option><option value="listed">Com relação publicada</option><option value="pending">Aguardando pesquisa</option></select></div>
        {hasFilters && <button className="text-button" onClick={() => { setQuery(""); setRosterFilter("all"); setPositionFilter("all"); }}>Limpar filtros</button>}
      </div>
      <div className="catalog-result-heading"><p role="status">{filtered.length} de {coverage.clubs} clubes</p><span>Ordem alfabética</span></div>
      <div className="catalog-mobile-selector"><label htmlFor="mobile-club">Clube</label><select id="mobile-club" disabled={!selected} value={selected?.id ?? ""} onChange={(event) => { setSelectedId(event.target.value); setPositionFilter("all"); }}>{filtered.length ? filtered.map((club) => <option value={club.id} key={club.id}>{club.name}</option>) : <option value="">Nenhum clube encontrado</option>}</select></div>
      <div className="catalog-layout">
        <div className="catalog-clubs">
          {filtered.length ? <ul aria-label="Clubes encontrados">{filtered.map((club) => <li key={club.id}><button type="button" className={`catalog-club ${selected?.id === club.id ? "selected" : ""}`} aria-label={`Ver ${club.name}`} aria-pressed={selected?.id === club.id} aria-controls="club-details" onClick={() => { setSelectedId(club.id); setPositionFilter("all"); }}><span className="club-monogram" aria-hidden="true">{club.name.slice(0, 2).toLocaleUpperCase("pt-BR")}</span><span className="club-button-copy"><strong>{club.name}</strong><span>{club.roster.status === "listed" ? `${club.roster.sourceListedCount} jogadores listados` : "Elenco a pesquisar"}</span></span><Icon name="right" size={15} /></button></li>)}</ul> : <div className="catalog-empty"><Icon name="search" size={27} /><h3>Nenhum clube encontrado.</h3><p>Tente outro nome ou limpe os filtros.</p><button className="button button-outline button-small" onClick={() => { setQuery(""); setRosterFilter("all"); }}>Mostrar todos os clubes</button></div>}
        </div>
        <section id="club-details" className={`panel club-detail ${selected ? "" : "no-selection"}`} aria-label="Detalhes do clube">
          {selected ? <>
            <header className="club-detail-header"><span className="eyebrow">{competition.name.toLocaleUpperCase("pt-BR")} · {competition.season}</span><h3>{selected.name}</h3><span className={`roster-coverage-tag ${selected.roster.status}`}><span className="status-dot" />{selected.roster.status === "listed" ? (competitionAthletes ? "Atletas listados pela CBF" : "Relação do clube consultada") : "Pesquisa do elenco pendente"}</span></header>
            {selected.roster.status === "listed" ? <div className="club-roster">
              {competitionAthletes && <p className="roster-no-results">Esta lista da competição pode incluir atletas da base. Não representa um elenco principal completo. Posições e camisas não confirmadas permanecem desconhecidas.</p>}
              <div className="roster-heading"><div><h4>Jogadores listados</h4><p>{visiblePlayers.length} de {players.length} nomes na relação consultada</p></div><div className="roster-position-filter"><label htmlFor="player-position">Posição</label><select id="player-position" value={positionFilter} onChange={(event) => setPositionFilter(event.target.value as PositionGroup | "unknown" | "all")}><option value="all">Todas as posições</option>{positionGroups.map((group) => <option key={group} value={group}>{POSITION_GROUP_LABELS[group]}</option>)}<option value="unknown">Posição a confirmar</option></select></div></div>
              {visiblePlayers.length ? <div className="roster-table-wrap"><table className="roster-table"><caption className="sr-only">Relação consultada de {selected.name}, consultada em {formatDate(world.asOfDate)}</caption><thead><tr><th scope="col">Camisa</th><th scope="col">Jogador</th><th scope="col">Posição publicada</th></tr></thead><tbody>{visiblePlayers.map((player) => <tr key={player.id}><td>{player.shirtNumber === null ? "A confirmar" : String(player.shirtNumber).padStart(2, "0")}</td><th scope="row">{player.name}</th><td>{player.positionLabel ?? "A confirmar"}</td></tr>)}</tbody></table></div> : <p className="roster-no-results" role="status">Nenhum jogador listado nesta posição.</p>}
              <div className="roster-note"><Icon name="info" size={15} /><p>{selected.roster.notes}</p></div>
            </div> : <div className="pending-roster"><span className="pending-roster-icon"><Icon name="person" size={28} /></span><h4>O elenco está no próximo capítulo.</h4><p>Este clube está confirmado entre os participantes. Sua relação de jogadores ainda aguarda pesquisa em fontes oficiais.</p><span>JOGADORES: A PESQUISAR</span></div>}
            <footer className="club-detail-sources"><span className="eyebrow">CONFIRA A ORIGEM DOS DADOS</span>{membershipSource && <SourceLink source={membershipSource} />}{rosterSources.map((source) => <SourceLink key={source.id} source={source} />)}</footer>
          </> : <div className="catalog-empty"><Icon name="ball" size={27} /><h3>Um clube, muitas possibilidades.</h3><p>Ajuste a busca para consultar os participantes.</p></div>}
        </section>
      </div>
    </section>
    <section className="catalog-footnote"><Icon name="shield" size={20} /><div><strong>Dados com origem. Um mundo em construção.</strong><p>Este catálogo representa a consulta de {formatDate(world.asOfDate)}. Novas consultas podem alterar estas relações. As outras ligas continuam em pesquisa.</p></div></section>
  </>;
}
