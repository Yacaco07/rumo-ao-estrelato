"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { useAthlete } from "@/features/athlete/athlete-provider";
import { SELECTION_LABELS } from "@/domain/career/coach";
import { CONTRACT_ROLE_LABELS } from "@/domain/career/contract";
import type { MatchEvent } from "@/domain/career/match";
import { addDays } from "@/domain/career/calendar";
import { careerDate, latestAdvanceDate, seasonYear } from "@/domain/career/career-clock";
import { ATTRIBUTE_LABELS, getPosition, type AttributeKey } from "@/domain/athlete/positions";
import { defaultTrainingFocus, TRAINING_EFFECT, withTrainingPlan } from "@/domain/career/training";
import { createSeason, readSeason, type SeasonCatalog } from "@/domain/career/season";
import { SEASON_ROUNDS, TRAINING_LABELS, TRAINING_TYPES, type SeasonAction } from "@/domain/career/season-schema";

const formatDate = (value: string) => value.split("-").reverse().join("/");
const formatRating = (value: number | null) => value?.toFixed(1).replace(".", ",") ?? "—";
function eventText(event: MatchEvent, club: string, athlete: string) {
  switch (event.kind) {
    case "goal": return event.player ? `Gol de ${athlete}` : event.assist ? `Gol do ${club}, assistência de ${athlete}` : `Gol do ${club}`;
    case "save": return `Defesa de ${athlete}`;
    case "yellow": return `Amarelo para ${athlete}`;
    case "red": return `Expulsão de ${athlete}`;
    case "injury": return `${athlete} se lesionou`;
    case "sub-in": return `${athlete} entrou`;
    case "sub-out": return `${athlete} saiu`;
  }
}

export function SeasonPage({ catalog }: { catalog: SeasonCatalog }) {
  const { saved, loading, error, playSeason } = useAthlete();
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [focus, setFocus] = useState<AttributeKey>();
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const [focusResult, setFocusResult] = useState(false);

  useEffect(() => {
    if (!focusResult) return;
    resultHeading.current?.focus();
    setFocusResult(false);
  }, [focusResult]);

  async function action(command: SeasonAction) {
    if (busy) return;
    setBusy(true);
    setFailure("");
    try {
      await playSeason(command, catalog);
      if (command.type !== "train") { setFocusResult(true); setTargetDate(""); }
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "Não foi possível salvar a temporada.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="loading-line" role="status">Carregando a temporada…</p>;
  if (error) return <h1>Temporada</h1>;
  if (!saved?.contract) return <>
    <div className="page-heading"><div><h1>Temporada</h1><p>Assine um contrato para entrar em campo.</p></div></div>
    <Link href="/propostas" className="button button-dark">Abrir propostas<Icon name="right" size={17} /></Link>
  </>;

  const profile = { ...saved, contract: saved.contract };
  const storedSeason = saved.season ?? createSeason(profile, catalog);
  if (!storedSeason) return <div className="notice notice-error" role="alert">O catálogo ainda não permite montar a temporada do seu clube.</div>;

  const season = withTrainingPlan(storedSeason, saved.athlete);
  const { rounds, next, last, standings, stats, overall, fatigue, condition, xp, attributes, potential, health, trust, selection } = readSeason(season);
  const allowedAttributes = getPosition(season.player.position).attributes;
  const trainingFocus = focus && allowedAttributes.includes(focus) ? focus : defaultTrainingFocus(season.player.position);
  const lastMatch = last?.played;
  const date = careerDate(season);
  const previous = saved.pastSeasons?.at(-1);
  const previousEdition = previous ? readSeason(previous) : null;
  const { clubId, position } = season.player;
  const isKeeper = position === "GK";

  return <>
    <div className="page-heading">
      <div><p className="eyebrow">SÉRIE A · TEMPORADA SIMULADA {seasonYear(season)}</p><h1>{saved.contract.clubName}<span className="lime-text">.</span></h1><p>{saved.athlete.name} · {season.rounds.length} de {SEASON_ROUNDS} rodadas disputadas</p><p>Data da carreira <time dateTime={date}>{formatDate(date)}</time></p></div>
      <Link href="/propostas" className="button button-outline">Meu contrato<Icon name="right" size={17} /></Link>
    </div>
    {failure && <div className="notice notice-error" role="alert">
      <p>{failure}</p>
      {failure.includes("outra aba") && <button className="text-button" onClick={() => window.location.reload()}>Recarregar jogo</button>}
    </div>}
    <div className="season-grid">
      <section className="panel season-card" aria-labelledby="next-fixture">
        {next ? <>
          <p className="eyebrow">RODADA {next.number} · {formatDate(next.date)}</p>
          <h2 id="next-fixture">{next.fixture.home.name} × {next.fixture.away.name}</h2>
          <p>Provável escalação: <strong>{SELECTION_LABELS[selection]}</strong> · Papel {CONTRACT_ROLE_LABELS[season.player.role]}</p>
          {health.injury > 0 && <p role="status">Lesionado · fora por {health.injury} jogo(s).</p>}
          {health.suspension > 0 && <p role="status">Suspenso · {health.suspension} jogo(s) a cumprir.</p>}
          <div className="season-preparation">
            <h3>Preparação da rodada</h3>
            {season.preparation ? <p role="status">{TRAINING_LABELS[season.preparation]} registrado{season.selectedFocus ? ` · ${ATTRIBUTE_LABELS[season.selectedFocus]}` : ""}.</p>
              : <>
                <div className="field calendar-advance">
                  <label htmlFor="train-focus">Atributo a desenvolver</label>
                  <select id="train-focus" value={trainingFocus} onChange={(e) => setFocus(e.target.value as AttributeKey)} disabled={busy}>
                    {allowedAttributes.map((key) => <option key={key} value={key}>{ATTRIBUTE_LABELS[key]}</option>)}
                  </select>
                </div>
                <div className="season-training">
                {TRAINING_TYPES.map((training) => <button key={training} className="button button-outline" disabled={busy || (health.injury > 0 && training !== "recovery")}
                  onClick={() => void action(training === "recovery" ? { type: "train", training } : { type: "train", training, focus: trainingFocus })}>
                  <strong>{TRAINING_LABELS[training]}</strong>
                  <span>{training === "recovery" ? "−25 fadiga" : `+${TRAINING_EFFECT[training].xp} XP · +${TRAINING_EFFECT[training].fatigue} fadiga`}</span>
                </button>)}
                </div>
              </>}
          </div>
          <div className="inline-actions">
            <button className="button button-lime" disabled={busy} onClick={() => void action({ type: "advance", until: "week" })}>
              {busy ? "Salvando…" : "Próxima semana"}<Icon name="right" size={17} />
            </button>
            <button className="button button-outline" disabled={busy} onClick={() => void action({ type: "advance", until: "next" })}>
              Até o próximo jogo
            </button>
          </div>
          <form className="calendar-advance" onSubmit={(e) => {
            e.preventDefault();
            void action({ type: "advance", until: targetDate });
          }}>
            <div className="field">
              <label htmlFor="advance-date">Avançar até a data</label>
              <input id="advance-date" type="date" min={addDays(date, 1)} max={latestAdvanceDate(season)} required value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)} />
            </div>
            <button className="button button-outline" disabled={busy || !targetDate}>Avançar</button>
          </form>
        </> : <>
          <h2 id="next-fixture">Temporada encerrada</h2>
          <p>Campeão simulado: <strong>{standings[0].club.name}</strong></p>
          <p>{saved.contract.clubName} terminou em {standings.findIndex(({ club }) => club.id === clubId) + 1}º lugar.</p>
          <button className="button button-lime" disabled={busy} onClick={() => void action({ type: "advance", until: "week" })}>Próxima semana</button>
        </>}
      </section>
      <section className="panel season-card" aria-labelledby="season-athlete">
        <h2 id="season-athlete">Meu desempenho</h2>
        <dl className="season-stats">
          <div><dt>Geral</dt><dd>{overall}</dd></div><div><dt>Potencial</dt><dd>{potential}</dd></div>
          <div><dt>Condição</dt><dd>{condition}%</dd></div><div><dt>Fadiga</dt><dd>{fatigue}%</dd></div>
          <div><dt>Experiência</dt><dd>{xp} XP</dd></div><div><dt>Jogos</dt><dd>{stats.appearances}</dd></div>
          <div><dt>Confiança do técnico</dt><dd>{trust}%</dd></div><div><dt>Como titular</dt><dd>{stats.starts}</dd></div>
          <div><dt>Minutos</dt><dd>{stats.minutes}</dd></div><div><dt>Nota média</dt><dd>{formatRating(stats.average)}</dd></div>
          <div><dt>Amarelos</dt><dd>{stats.yellowCards}</dd></div><div><dt>Vermelhos</dt><dd>{stats.redCards}</dd></div>
          {isKeeper ? <><div><dt>Defesas</dt><dd>{stats.saves}</dd></div><div><dt>Jogos sem sofrer gol</dt><dd>{stats.cleanSheets}</dd></div></>
            : <><div><dt>Gols</dt><dd>{stats.goals}</dd></div><div><dt>Assistências</dt><dd>{stats.assists}</dd></div></>}
        </dl>
        <details className="season-details season-section">
          <summary>Atributos por posição</summary>
          <dl className="season-stats">{allowedAttributes.map((key) => <div key={key}>
            <dt>{ATTRIBUTE_LABELS[key]}</dt><dd>{attributes?.[key]}</dd>
          </div>)}</dl>
        </details>
      </section>
    </div>
    {(lastMatch || previousEdition) && <section className="panel season-card season-section" aria-labelledby="career-news">
      <h2 id="career-news">Notícias da carreira</h2>
      {lastMatch && <p>{lastMatch.match.home.name} {lastMatch.match.homeGoals} × {lastMatch.match.awayGoals} {lastMatch.match.away.name} pela rodada {last.number}.</p>}
      {previousEdition && previous && <p>{previousEdition.standings[0].club.name} venceu a edição de {seasonYear(previous)}. A edição de {seasonYear(season)} está no calendário.</p>}
    </section>}
    {lastMatch && <section className="panel season-card season-section" aria-labelledby="last-result">
      <h2 id="last-result" ref={resultHeading} tabIndex={-1}>Resultado da rodada {last.number}</h2>
      <p className="season-score">{lastMatch.match.home.name} <strong>{lastMatch.match.homeGoals} × {lastMatch.match.awayGoals}</strong> {lastMatch.match.away.name}</p>
      {lastMatch.appearance.minutes > 0 ? <p>{lastMatch.appearance.minutes} min · {SELECTION_LABELS[lastMatch.appearance.lineup]} · Nota {formatRating(lastMatch.appearance.rating)} · {
        isKeeper ? `${lastMatch.appearance.saves} defesa(s)` : `${lastMatch.appearance.goals} gol(s) · ${lastMatch.appearance.assists} assistência(s)`
      }</p> : <p>{lastMatch.appearance.absence === "injured" ? "Você estava lesionado."
        : lastMatch.appearance.absence === "suspended" ? "Você cumpriu suspensão." : lastMatch.appearance.lineup === "unavailable" ? "Você ficou fora da convocação." : "Você ficou no banco nesta partida."}</p>}
      <details className="season-details" open>
        <summary>Linha do tempo da partida</summary>
        {lastMatch.events.length ? <ol>{lastMatch.events.map((event, index) => {
          const club = event.clubId === lastMatch.match.home.id ? lastMatch.match.home.name : lastMatch.match.away.name;
          return <li key={index}><strong>{event.minute}′</strong> {eventText(event, club, saved.athlete.name)}</li>;
        })}</ol> : <p>Sem lances registrados.</p>}
      </details>
      <details className="season-details">
        <summary>Todos os placares da rodada</summary>
        <ul>{lastMatch.results.map((match) => <li key={match.home.id}>{match.home.name} <strong>{match.homeGoals} × {match.awayGoals}</strong> {match.away.name}</li>)}</ul>
      </details>
    </section>}
    {next && <section className="panel season-card season-section season-details" aria-labelledby="upcoming-matches">
      <h2 id="upcoming-matches">Próximos compromissos</h2>
      <ul>{rounds.slice(next.number - 1, next.number + 2).map(({ number, date, competition, fixture }) => <li key={number}>
        <time dateTime={date}>{formatDate(date)}</time>
        <span>{competition} · Rodada {number} · {fixture.home.name} × {fixture.away.name}</span>
      </li>)}</ul>
    </section>}
    <details className="panel season-card season-section season-details">
      <summary>Calendário completo e resultados</summary>
      <ol>{rounds.map(({ number, date, fixture, played }) => <li key={number} aria-current={number === next?.number ? "step" : undefined}>
        <time dateTime={date}>{formatDate(date)}</time><span>{fixture.home.name} {played ? `${played.match.homeGoals} × ${played.match.awayGoals}` : "×"} {fixture.away.name}</span>
      </li>)}</ol>
    </details>
    <section className="panel season-card season-section" aria-labelledby="league-table">
      <h2 id="league-table">Classificação simulada</h2>
      <div className="season-table-wrap" tabIndex={0} role="region" aria-label="Tabela da Série A">
        <table className="season-table">
          <thead><tr>{["Pos.", "Clube", "Pts", "J", "V", "E", "D", "GP", "GC", "SG"].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead>
          <tbody>{standings.map((row, index) => <tr key={row.club.id} className={row.club.id === clubId ? "current" : ""}>
            <td>{index + 1}</td><th scope="row">{row.club.name}</th><td>{row.points}</td><td>{row.played}</td>
            <td>{row.wins}</td><td>{row.draws}</td><td>{row.losses}</td><td>{row.scored}</td><td>{row.conceded}</td><td>{row.scored - row.conceded}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </section>
  </>;
}
