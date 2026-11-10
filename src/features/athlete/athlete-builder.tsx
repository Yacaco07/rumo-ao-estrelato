"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { Jersey, Pitch } from "@/components/pitch";
import { adjustAttribute, allocatedPoints, athleteDraftSchema, attributeValue, averageRating, changePosition, completeAthleteSchema, createEmptyDraft, remainingPoints, type AthleteDraft, type SavedAthlete } from "@/domain/athlete/athlete";
import { ATTRIBUTE_LABELS, EXTRA_POINTS, getPosition, POSITION_KEYS, type Position } from "@/domain/athlete/positions";
import { useAthlete } from "./athlete-provider";

const footLabels = { right: "Direito", left: "Esquerdo", both: "Ambidestro" };
const steps = ["Identidade", "Posição e atributos", "Revisão"];

export function AthletePage() {
  const { loading } = useAthlete();
  if (loading) return <div className="empty-state" role="status"><span className="eyebrow">MEU ATLETA</span><h1>Preparando seu vestiário…</h1></div>;
  return <AthleteBuilder />;
}

export function AthleteBuilder() {
  const { saved, error: storageError, saveProfile, removeProfile, setDirty } = useAthlete();
  const [draft, setDraft] = useState<AthleteDraft>(() => saved?.athlete ?? createEmptyDraft());
  const [step, setStep] = useState(saved?.status === "ready" ? 2 : 0);
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingPosition, setPendingPosition] = useState<Position | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const position = getPosition(draft.position);
  const remaining = remainingPoints(draft.allocation);
  const isDirty = JSON.stringify(draft) !== JSON.stringify(saved?.athlete ?? createEmptyDraft());
  const isSavedReady = saved?.status === "ready" && !isDirty;

  useEffect(() => { setDirty(isDirty); return () => setDirty(false); }, [isDirty, setDirty]);
  useEffect(() => {
    if (!isDirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  function update(patch: Partial<AthleteDraft>) { setDraft((previous) => ({ ...previous, ...patch })); setMessage(""); setErrors([]); }

  function nextStep() {
    const validation = athleteDraftSchema.safeParse(draft);
    const issues = validation.success ? [] : validation.error.issues.map((issue) => issue.message);
    if (draft.name.trim().length < 2) issues.unshift("Informe um nome com pelo menos 2 caracteres.");
    if (draft.nationality.trim().length < 2) issues.push("Informe sua nacionalidade.");
    if (step === 1 && remaining !== 0) issues.push("Distribua os 10 pontos antes de revisar seu perfil.");
    if (issues.length) { setErrors([...new Set(issues)]); document.getElementById(step === 0 ? "athlete-name" : "points-title")?.focus(); return; }
    setErrors([]); setMessage(""); setStep((value) => Math.min(2, value + 1));
  }

  function choosePosition(value: Position) {
    if (value === draft.position) return;
    if (allocatedPoints(draft.allocation) > 0) { setPendingPosition(value); return; }
    setDraft(changePosition(draft, value)); setErrors([]); setMessage("");
  }

  async function persist(status: SavedAthlete["status"]) {
    const validation = (status === "ready" ? completeAthleteSchema : athleteDraftSchema).safeParse(draft);
    if (!validation.success) { setErrors([...new Set(validation.error.issues.map((issue) => issue.message))]); return; }
    setBusy(true); setErrors([]); setMessage("");
    try {
      const result = await saveProfile(validation.data, status); setDraft(result.athlete);
      setMessage(status === "ready" ? "Perfil concluído e salvo neste navegador. Seu primeiro passo está dado." : "Rascunho salvo neste navegador. Você pode continuar depois.");
    } catch (error) { setErrors([error instanceof Error ? error.message : "Não foi possível salvar. Tente novamente."]); }
    finally { setBusy(false); }
  }

  async function deleteProfile() {
    setBusy(true); setErrors([]);
    try { await removeProfile(); setDraft(createEmptyDraft()); setStep(0); setConfirmDelete(false); setMessage("Perfil excluído deste navegador."); }
    catch (error) { setErrors([error instanceof Error ? error.message : "Não foi possível excluir."]); }
    finally { setBusy(false); }
  }

  return <>
    <div className="page-heading"><div><p className="eyebrow">MEU ATLETA · PRIMEIRO CAPÍTULO</p><h1>{isSavedReady ? "Seu nome. Seu jogo." : "Dê forma à sua promessa."}</h1><p>Antes de conquistar o mundo, descubra quem entra em campo.</p></div><span className="subtle-badge"><Icon name="save" size={14} />{isDirty ? "Alterações não salvas" : saved ? "Perfil salvo" : "Novo perfil"}</span></div>
    <div className="builder-layout"><section className="panel builder-panel" aria-label="Criador de atleta">
      <ol className="builder-steps" aria-label="Etapas da criação">{steps.map((label, index) => <li key={label} className={step === index ? "current" : step > index ? "done" : ""} aria-current={step === index ? "step" : undefined}><span>{step > index ? <Icon name="check" size={14} /> : `0${index + 1}`}</span><strong>{label}</strong></li>)}</ol>
      <div className="builder-body">
        {errors.length > 0 && <div className="notice notice-error" role="alert"><Icon name="info" /><div><strong>Confira antes de continuar</strong><ul>{errors.map((item) => <li key={item}>{item}</li>)}</ul>{errors.some((item) => item.includes("outra aba")) && <button className="text-button" onClick={() => window.location.reload()}>Recarregar perfil (descarta alterações locais)</button>}</div></div>}
        {message && <div className="notice notice-success" role="status"><Icon name="check" /><p>{message}</p></div>}
        {step === 0 && <div className="step-content"><p className="eyebrow">01 / A PESSOA ANTES DO JOGADOR</p><h2>Como você será lembrado?</h2><p className="section-description">Comece pelo básico. O resto você escreve dentro de campo.</p><div className="form-grid">
          <div className="field full-width"><label htmlFor="athlete-name">Nome do atleta</label><input id="athlete-name" aria-describedby="name-hint" value={draft.name} maxLength={32} placeholder="Seu nome no futebol" autoComplete="off" onChange={(event) => update({ name: event.target.value })} /><span id="name-hint">Até 32 caracteres. Pode usar seu nome ou um apelido.</span></div>
          <div className="field"><label htmlFor="athlete-nationality">Nacionalidade</label><input id="athlete-nationality" value={draft.nationality} maxLength={56} placeholder="Ex.: Brasil" onChange={(event) => update({ nationality: event.target.value })} /></div>
          <div className="field"><label htmlFor="athlete-age">Idade inicial</label><input id="athlete-age" aria-describedby="age-hint" type="number" min={16} max={30} value={Number.isNaN(draft.age) ? "" : draft.age} onChange={(event) => update({ age: event.target.valueAsNumber })} /><span id="age-hint">De 16 a 30 anos.</span></div>
          <fieldset className="field"><legend>Pé dominante</legend><div className="foot-options">{(["right", "left", "both"] as const).map((foot) => <label key={foot} className={draft.preferredFoot === foot ? "selected" : ""}><input type="radio" name="preferredFoot" value={foot} checked={draft.preferredFoot === foot} onChange={() => update({ preferredFoot: foot })} />{footLabels[foot]}</label>)}</div></fieldset>
          <div className="field"><label htmlFor="athlete-number">Número da camisa</label><input id="athlete-number" aria-describedby="number-hint" type="number" min={1} max={99} value={Number.isNaN(draft.shirtNumber) ? "" : draft.shirtNumber} onChange={(event) => update({ shirtNumber: event.target.valueAsNumber })} /><span id="number-hint">De 01 a 99.</span></div>
        </div></div>}
        {step === 1 && <div className="step-content"><p className="eyebrow">02 / ENCONTRE SEU LUGAR</p><h2>Qual é o seu jogo?</h2><p className="section-description">Sua posição define a base. Os 10 pontos extras dão o seu toque.</p><fieldset className="position-fieldset"><legend>Posição principal</legend><div className="position-options">{POSITION_KEYS.map((key) => <button key={key} type="button" className={draft.position === key ? "selected" : ""} aria-label={`${getPosition(key).label} (${getPosition(key).short})`} aria-pressed={draft.position === key} onClick={() => choosePosition(key)}><span>{getPosition(key).short}</span>{getPosition(key).label}</button>)}</div></fieldset>
          {pendingPosition && <div className="position-confirm notice" role="alert"><div><strong>Trocar para {getPosition(pendingPosition).label.toLowerCase()}?</strong><p>Os pontos distribuídos serão zerados. Você receberá os 10 pontos para distribuir na nova posição.</p><div className="inline-actions"><button className="button button-dark button-small" onClick={() => { setDraft(changePosition(draft, pendingPosition)); setPendingPosition(null); setErrors([]); setMessage(""); }}>Trocar e zerar pontos</button><button className="button button-outline button-small" onClick={() => setPendingPosition(null)}>Manter posição</button></div></div></div>}
          <div className="points-heading"><div><h3 id="points-title" tabIndex={-1}>Atributos iniciais</h3><p>Base da posição + pontos distribuídos</p></div><span className={`points-counter ${remaining === 0 ? "complete" : ""}`} aria-live="polite"><strong>{remaining}</strong> / {EXTRA_POINTS} livres</span></div>
          <div className="attribute-controls">{position.attributes.map((key) => <div className="attribute-row" key={key}><div className="attribute-label"><strong>{ATTRIBUTE_LABELS[key]}</strong><span>Base {position.base[key]}{draft.allocation[key] ? <em> +{draft.allocation[key]}</em> : ""}</span></div><div className="attribute-meter" aria-hidden="true"><span style={{ width: `${attributeValue(draft, key)}%` }} /></div><span className="attribute-total" aria-label={`${ATTRIBUTE_LABELS[key]}: ${attributeValue(draft, key)}`}>{attributeValue(draft, key)}</span><div className="attribute-buttons"><button aria-label={`Diminuir ${ATTRIBUTE_LABELS[key]}`} disabled={!(draft.allocation[key] ?? 0)} onClick={() => { setDraft((previous) => adjustAttribute(previous, key, -1)); setMessage(""); setErrors([]); }}><Icon name="minus" size={15} /></button><button aria-label={`Aumentar ${ATTRIBUTE_LABELS[key]}`} disabled={remaining === 0} onClick={() => { setDraft((previous) => adjustAttribute(previous, key, 1)); setMessage(""); setErrors([]); }}><Icon name="plus" size={15} /></button></div></div>)}</div>
          <p className="field-hint"><Icon name="info" size={14} />Atributos iniciais de jogo. Seu desenvolvimento virá ao longo da carreira.</p>
        </div>}
        {step === 2 && <div className="step-content"><p className="eyebrow">03 / PRONTO PARA O PRIMEIRO PASSO</p><h2>{isSavedReady ? "Sua promessa está registrada." : "Essa é a sua primeira versão."}</h2><p className="section-description">Confira seu perfil. Você ainda pode voltar e ajustar os detalhes.</p><dl className="review-grid">{[["Nome", draft.name], ["Nacionalidade", draft.nationality], ["Posição", position.label], ["Idade inicial", `${draft.age} anos`], ["Pé dominante", footLabels[draft.preferredFoot]], ["Camisa", String(draft.shirtNumber).padStart(2, "0")]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><div className="review-attributes">{position.attributes.map((key) => <div key={key}><span>{ATTRIBUTE_LABELS[key]}</span><strong>{attributeValue(draft, key)}</strong></div>)}</div><div className="notice review-note"><Icon name="shield" size={22} /><div><strong>Seu primeiro passo fica guardado.</strong><p>Concluir salva seu perfil neste navegador. As propostas de clubes e o início da carreira fazem parte das próximas etapas do jogo.</p></div></div>{isSavedReady && <Link href="/" className="text-link">Voltar à central<Icon name="right" size={16} /></Link>}</div>}
      </div>
      <div className="builder-actions"><div>{step > 0 && <button className="button button-outline" disabled={busy} onClick={() => { setStep((value) => value - 1); setPendingPosition(null); setErrors([]); setMessage(""); }}><Icon name="left" size={16} />Voltar</button>}</div><div className="builder-actions-right"><button className="button button-quiet" disabled={busy || !!storageError || isSavedReady || !!pendingPosition} onClick={() => void persist("draft")}><Icon name="save" size={16} /><span>{busy ? "Salvando…" : "Salvar rascunho"}</span></button>{step < 2 ? <button className="button button-dark" onClick={nextStep} disabled={busy || !!pendingPosition}>Continuar<Icon name="right" size={17} /></button> : <button className="button button-dark" disabled={busy || !!storageError || isSavedReady} onClick={() => void persist("ready")}>{isSavedReady ? "Perfil concluído" : "Concluir perfil"}<Icon name={isSavedReady ? "check" : "right"} size={17} /></button>}</div></div>
    </section>
    <aside className="builder-preview"><div className="athlete-card"><div className="athlete-card-header"><span>SEU PRÓXIMO CAPÍTULO</span><Icon name="star" size={18} /></div><div className="athlete-shirt"><Jersey name={draft.name || "SEU NOME"} number={Number.isNaN(draft.shirtNumber) ? 1 : draft.shirtNumber} /></div><div className="athlete-card-name"><span>{position.short} <span>·</span> {draft.nationality || "Sua nacionalidade"}</span><h2>{draft.name || "Seu nome aqui"}</h2><p>{position.description}</p></div><div className="athlete-rating"><div><strong>{averageRating(draft)}</strong><span>GERAL<br />INICIAL</span></div><span>{allocatedPoints(draft.allocation)} / 10<br /><small>pontos extras</small></span></div><div className="athlete-card-bottom">RUMO AO ESTRELATO <span>V0.2</span></div></div>
      {step === 1 ? <div className="position-preview"><span className="eyebrow">SEU LUGAR EM CAMPO</span><Pitch position={draft.position} /></div> : <div className="preview-note"><Icon name="info" size={18} /><p>O talento é só o começo.<br />O resto é a sua história.</p></div>}
    </aside></div>
    {saved && <details className="profile-management"><summary>Gerenciar perfil salvo</summary><p>Há um perfil salvo neste navegador. Excluí-lo libera o espaço para criar outro.</p>{confirmDelete ? <div className="inline-actions" role="alert"><strong>Excluir o perfil salvo? Esta ação não pode ser desfeita.</strong><button className="button button-danger button-small" disabled={busy} onClick={() => void deleteProfile()}>Confirmar exclusão</button><button className="button button-outline button-small" onClick={() => setConfirmDelete(false)}>Cancelar</button></div> : <button className="text-button danger-text" onClick={() => setConfirmDelete(true)} disabled={busy || !!storageError}><Icon name="trash" size={15} />Excluir perfil deste navegador</button>}</details>}
  </>;
}
