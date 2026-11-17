"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAthlete } from "@/features/athlete/athlete-provider";
import { nationalTournaments } from "@/domain/career/national";
import { brazilPlayoffs } from "@/domain/career/brazil-playoffs";
import { buildCalendar, roundDate } from "@/domain/career/calendar";
import { careerDate, seasonYear } from "@/domain/career/career-clock";
import { createSeason, readSeason, type SeasonCatalog } from "@/domain/career/season";
import { worldCompetitions } from "@/domain/career/world-competitions";
import type { CompetitionMatch, CompetitionView, TableRow } from "@/domain/career/competition-engine";

function Table({ title, rows }: { title: string; rows: TableRow[] }) {
  return <div className="season-table-wrap" tabIndex={0} role="region" aria-label={title}>
    <table className="season-table">
      <caption>{title}</caption>
      <thead><tr>{["Pos.", "Clube", "Pts", "J", "V", "E", "D", "GP", "GC", "SG"].map((label) =>
        <th key={label} scope="col">{label}</th>)}</tr></thead>
      <tbody>{rows.map((row, i) => <tr key={row.club.id}>
        <td>{i + 1}</td><th scope="row">{row.club.name}</th><td>{row.points}</td><td>{row.played}</td>
        <td>{row.wins}</td><td>{row.draws}</td><td>{row.losses}</td><td>{row.scored}</td><td>{row.conceded}</td><td>{row.scored - row.conceded}</td>
      </tr>)}</tbody>
    </table>
  </div>;
}

export function CompetitionCentre({ catalog }: { catalog: SeasonCatalog }) {
  const { saved, loading } = useAthlete();
  const [id, setId] = useState("br-a");
  const [filter, setFilter] = useState("");
  const model = useMemo(() => {
    if (!saved?.contract) return null;
    const season = saved.season ? { ...saved.season, brazilB: saved.season.brazilB ?? catalog.brazilB }
      : createSeason({ ...saved, contract: saved.contract }, catalog);
    if (!season) return null;
    const date = careerDate(season);
    const year = seasonYear(season);
    const { divisions, rounds } = readSeason(season);
    const played = new Map(rounds.flatMap(({ number, played }) => (played?.allResults ?? []).map((match) =>
      [`${number}:${match.home.id}:${match.away.id}`, match] as const)));
    function leagueSchedule(clubs: SeasonCatalog["clubs"]): CompetitionMatch[] {
      return buildCalendar(clubs).flatMap((games, index) => games.map((game) => {
        const id = `${index + 1}:${game.home.id}:${game.away.id}` as const;
        const result = played.get(id);
        return { ...game, date: roundDate(year, index), id, phase: `Rodada ${index + 1}`, score: result ?? null };
      }));
    }
    const domestic: CompetitionView[] = [
      { id: "br-a", name: "Campeonato Brasileiro Série A", matches: leagueSchedule(season.clubs),
        tables: [{ name: "Classificação", rows: divisions.first }], winner: rounds[37]?.played ? divisions.first[0]?.club : undefined },
      { id: "br-b", name: "Campeonato Brasileiro Série B", matches: season.brazilB ? leagueSchedule(season.brazilB) : [],
        tables: [{ name: "Classificação", rows: divisions.second }], winner: rounds[37]?.played ? divisions.second[0]?.club : undefined },
    ];
    if (rounds[37]?.played && divisions.second.length) domestic.push(brazilPlayoffs(season, date, divisions.second).view);
    return { year: seasonYear(season), date, views: [...domestic, ...worldCompetitions(season, date), ...nationalTournaments(year, date, season.seed)] };
  }, [saved, catalog]);

  const heading = <div className="page-heading">
    <div><h1>Competições<span className="lime-text">.</span></h1><p>{model ? `Edição simulada de ${model.year}` : "As partidas avançam com o calendário da carreira."}</p></div>
    <Link href="/temporada" className="button button-outline">Minha temporada</Link>
  </div>;
  if (loading) return <>{heading}<p role="status">Carregando competições…</p></>;
  if (!model) return <>{heading}<p>Assine um contrato para acompanhar a edição da sua carreira.</p><Link href="/propostas" className="text-link">Abrir propostas</Link></>;
  const selected = model.views.find((view) => view.id === id) ?? model.views[0];
  const normalFilter = filter.trim().toLocaleLowerCase("pt-BR");
  const matches = selected.matches.filter((match) => `${match.home.name} ${match.away.name} ${match.phase}`.toLocaleLowerCase("pt-BR").includes(normalFilter));

  return <>
    {heading}
    <section className="panel season-card" aria-labelledby="competition-selected">
      <div className="field calendar-advance">
        <label htmlFor="competition-select">Competição</label>
        <select id="competition-select" value={selected.id} onChange={(event) => { setId(event.target.value); setFilter(""); }}>
          {model.views.map((view) => <option key={view.id} value={view.id}>{view.name}</option>)}
        </select>
      </div>
      <h2 id="competition-selected">{selected.name}</h2>
      <p>{selected.winner ? <>Campeão simulado · <strong>{selected.winner.name}</strong></> : `Calendário em ${model.date.split("-").reverse().join("/")}`}</p>
      {selected.tables.map(({ name, rows }) => <Table key={name} title={name} rows={rows} />)}
      {selected.matches.length > 0 && <details className="season-details season-section" open={!selected.tables.length}>
        <summary>Jogos e fases</summary>
        <div className="field calendar-advance"><label htmlFor="competition-filter">Filtrar por clube ou fase</label>
          <input id="competition-filter" type="search" value={filter} onChange={(event) => setFilter(event.target.value)} /></div>
        {matches.length ? <ul>{matches.slice().sort((a, b) => a.date.localeCompare(b.date)).map((match) =>
          <li key={match.id}>
            <time dateTime={match.date}>{match.date.split("-").reverse().join("/")}</time>
            {match.phase} · {match.home.name} {match.score ? `${match.score.homeGoals} × ${match.score.awayGoals}` : "×"} {match.away.name}
            {match.penalties && ` (${match.penalties.home} × ${match.penalties.away} nos pênaltis)`}
          </li>)}</ul> : <p>Nenhum confronto corresponde ao filtro.</p>}
      </details>}
    </section>
  </>;
}
