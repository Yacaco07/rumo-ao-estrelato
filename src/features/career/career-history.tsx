"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { useAthlete } from "@/features/athlete/athlete-provider";
import { careerAge, careerHistory, RETIREMENT_MINIMUM } from "@/domain/career/history";
import type { SeasonCatalog } from "@/domain/career/season";
import { formatMoney } from "./market-panel";

const displayDate = (date: string) => date.split("-").reverse().join("/");

export function CareerHistory({ catalog }: { catalog: SeasonCatalog }) {
  const { saved, loading, error, playSeason, restoreProfile } = useAthlete();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState("");
  const history = useMemo(() => saved ? careerHistory(saved) : null, [saved]);
  const age = saved?.season ? careerAge(saved.athlete, saved.season) : saved?.athlete.age;
  const keeper = saved?.athlete.position === "GK";

  function exportCareer() {
    if (!saved) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(saved, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "rumo-ao-estrelato-carreira.json";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importCareer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const file = new FormData(form).get("career-file");
    if (!(file instanceof File) || file.size === 0 || busy) return;
    setFailure("");
    if (file.size > 6_000_000) { setFailure("O arquivo escolhido excede 6 MB."); return; }
    if (saved && !window.confirm("Substituir a carreira deste navegador pelo arquivo escolhido?")) return;
    setBusy(true); setMessage("");
    try {
      await restoreProfile(JSON.parse(await file.text()));
      form.reset();
      setMessage("Carreira importada.");
    } catch (error) {
      setFailure(error instanceof SyntaxError ? "O arquivo não contém JSON válido."
        : error instanceof Error ? error.message : "Não foi possível importar a carreira.");
    } finally { setBusy(false); }
  }

  async function retire() {
    if (busy || !window.confirm("Encerrar a carreira e arquivar o histórico?")) return;
    setBusy(true); setFailure("");
    try { await playSeason({ type: "retire" }, catalog); }
    catch (error) { setFailure(error instanceof Error ? error.message : "Não foi possível encerrar a carreira."); }
    finally { setBusy(false); }
  }

  return <>
    <div className="page-heading"><div><h1>História da carreira<span className="lime-text">.</span></h1>
      <p>{saved ? `${saved.athlete.name} · ${age} anos${saved.retiredOn ? ` · aposentado em ${displayDate(saved.retiredOn)}` : ""}`
        : "Temporadas, clubes, títulos e estatísticas do seu atleta."}</p></div>
      {saved?.contract && !saved.retiredOn && <Link className="button button-outline" href="/temporada">Continuar carreira</Link>}
    </div>
    {loading ? <p role="status">Carregando histórico…</p> : <>
      {failure && <p className="notice notice-error" role="alert">{failure}</p>}
      {message && <p className="notice notice-success" role="status">{message}</p>}
      {history && saved && <>
        <section className="panel season-card season-section" aria-label="Totais de carreira">
          <h2>Totais no clube</h2>
          <dl className="season-stats">
            <div><dt>Jogos</dt><dd>{history.totals.appearances}</dd></div>
            <div><dt>Minutos</dt><dd>{history.totals.minutes}</dd></div>
            {keeper ? <><div><dt>Defesas</dt><dd>{history.totals.saves}</dd></div>
              <div><dt>Jogos sem sofrer gol</dt><dd>{history.totals.cleanSheets}</dd></div></>
              : <><div><dt>Gols</dt><dd>{history.totals.goals}</dd></div><div><dt>Assistências</dt><dd>{history.totals.assists}</dd></div></>}
            <div><dt>Títulos de clube</dt><dd>{history.editions.reduce((sum, edition) => sum + edition.titles.length, 0)}</dd></div>
          </dl>
        </section>
        {history.editions.length > 0 && <section className="panel season-card season-section season-details" aria-labelledby="years">
          <h2 id="years">Temporadas</h2>
          <ul>{history.editions.slice().reverse().map((edition) => <li key={edition.year}>
            <strong>{edition.year}</strong> · {edition.age} anos · {edition.clubs.map(({ name }) => name).join(", ") || "Sem atuação"}
            <p>{edition.stats.appearances} jogos · {edition.stats.minutes} min · Geral {edition.overall} · {edition.complete ? "Concluída" : saved.retiredOn ? "Encerrada" : "Em andamento"}</p>
            {edition.titles.length > 0 && <p>Títulos: {edition.titles.join(", ")}.</p>}
            {edition.awards.length > 0 && <p>Premiações: {edition.awards.join(", ")}.</p>}
          </li>)}</ul>
        </section>}
        {history.editions.length > 0 && <section className="panel season-card season-section" aria-label="Recordes pessoais">
          <h2>Recordes pessoais</h2>
          <dl className="season-stats">{history.records.slice(keeper ? 2 : 0, keeper ? 4 : 2).map(({ label, value }) =>
            <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        </section>}
        {!!saved.market?.moves.length && <section className="panel season-card season-section season-details" aria-label="Movimentações">
          <h2>Movimentações entre clubes</h2>
          <ul>{saved.market.moves.slice().reverse().map((move, index) =>
            <li key={index}>{displayDate(move.date)} · {move.from} → {move.to}{move.fee > 0 ? ` · ${formatMoney(move.fee)}` : ""}</li>)}</ul>
        </section>}
        {!!saved.nationalityCareer?.matches.length && <section className="panel season-card season-section" aria-label="Histórico de seleção">
          <h2>Seleção nacional</h2>
          <p>{saved.nationalityCareer.matches.filter(({ minutes }) => minutes > 0).length} jogos · {saved.nationalityCareer.matches.reduce((sum, { goals }) => sum + goals, 0)} gols · {saved.nationalityCareer.matches.reduce((sum, { assists }) => sum + assists, 0)} assistências</p>
          <ul>{saved.nationalityCareer.trophies.map((trophy) => <li key={trophy.id}>{trophy.year} · {trophy.name}</li>)}</ul>
        </section>}
      </>}
      <section className="panel season-card season-section" aria-labelledby="career-backup">
        <h2 id="career-backup">Arquivo da carreira</h2>
        <div className="inline-actions">
          {saved && <button className="button button-outline" onClick={exportCareer}>Exportar carreira</button>}
          {saved?.season && !saved.retiredOn && age && age >= RETIREMENT_MINIMUM &&
            <button className="button button-outline" disabled={busy} onClick={() => void retire()}>Aposentar atleta</button>}
        </div>
        <form className="calendar-advance" onSubmit={(event) => void importCareer(event)}>
          <div className="field"><label htmlFor="career-file">Arquivo da carreira (.json)</label>
            <input id="career-file" type="file" name="career-file" accept=".json,application/json" required /></div>
          <button className="button button-dark" disabled={busy || !!error}>Importar carreira</button>
        </form>
      </section>
    </>}
  </>;
}
