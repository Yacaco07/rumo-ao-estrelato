"use client";

import Link from "next/link";
import { Icon } from "@/components/icon";
import { Jersey, Pitch } from "@/components/pitch";
import { useAthlete } from "./athlete-provider";
import { getPosition } from "@/domain/athlete/positions";

export function Home() {
  const { saved, loading } = useAthlete();
  const athlete = saved?.athlete;
  return <>
    <div className="page-heading"><div><p className="eyebrow">CENTRAL DO ATLETA</p><h1>O campo é seu<span className="lime-text">.</span></h1><p>Grandes carreiras começam com uma escolha. Esta é a sua.</p></div><span className="chapter-pill"><span className="status-dot" />CAPÍTULO 01 · O COMEÇO</span></div>
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy"><span className="hero-eyebrow"><span />SEU JOGO. SUAS ESCOLHAS. SEU LEGADO.</span><h2 id="hero-title">Todo ídolo<br />já foi uma<br /><em>promessa.</em></h2><p>Antes dos holofotes, existe o primeiro passo.<br />Crie seu atleta e dê um nome à sua história.</p><Link href="/atleta" className="button button-lime">{saved ? "Continuar meu perfil" : "Criar meu atleta"}<Icon name="arrow" size={20} /></Link><div className="hero-caption"><Icon name="save" size={14} /><span>Seu perfil fica salvo neste navegador.</span></div></div>
      <div className="hero-visual" aria-hidden="true"><div className="hero-grid" /><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="hero-pitch"><Pitch decorative /></div><div className="hero-number">01</div><Jersey number={athlete?.shirtNumber} name={athlete?.name || "SUA HISTÓRIA"} /><span className="hero-coordinate">O PRÓXIMO NOME<br /><strong>PODE SER O SEU.</strong></span><span className="hero-plus">+</span></div>
      <div className="hero-bottom"><span>RUMO AO ESTRELATO</span><span>DO PRIMEIRO PASSO AO SEU LEGADO <Icon name="arrow" size={12} /></span></div>
    </section>
    <div className="home-lower-grid">
      <section className="panel journey-panel"><div className="section-heading"><div><span className="eyebrow">O PRIMEIRO PASSO</span><h2>{saved ? "Sua promessa tem nome." : "Construa seu ponto de partida."}</h2></div><span className="outline-icon"><Icon name={saved ? "person" : "ball"} size={21} /></span></div>
        {loading ? <p className="loading-line" role="status">Buscando seu perfil salvo…</p> : saved ? <div className="saved-summary"><div className="summary-avatar">{String(athlete!.shirtNumber).padStart(2, "0")}</div><div><span className="small-muted">{saved.status === "ready" ? "PERFIL CONCLUÍDO" : "RASCUNHO SALVO"}</span><h3>{athlete!.name || "Seu futuro atleta"}</h3><p>{getPosition(athlete!.position).label} <span>·</span> {athlete!.age} anos <span>·</span> {athlete!.nationality || "Nacionalidade a definir"}</p></div><Link href="/atleta" className="round-link" aria-label="Abrir meu perfil de atleta"><Icon name="arrow" /></Link></div> : <div className="journey-steps">{[{ n: "01", title: "Sua identidade", text: "O nome que a torcida vai lembrar." }, { n: "02", title: "Seu estilo de jogo", text: "Uma posição. Dez pontos. Seu jeito." }, { n: "03", title: "Sua primeira versão", text: "Revise e salve o perfil do seu atleta." }].map((step) => <div className="journey-step" key={step.n}><span>{step.n}</span><div><h3>{step.title}</h3><p>{step.text}</p></div><Icon name="right" size={15} className="step-future-icon" /></div>)}</div>}
        <Link href="/atleta" className="text-link">{saved ? "Editar meu atleta" : "Vamos começar"}<Icon name="right" size={17} /></Link>
      </section>
      <section className="world-teaser"><div className="world-teaser-top"><Icon name="globe" size={24} /><span>UM MUNDO EM CONSTRUÇÃO</span></div><div className="world-count">14<span>ligas no<br />horizonte.</span></div><p>Da América do Sul à Europa e à Ásia.<br />Um universo para escrever sua carreira.</p><div className="country-tags" aria-hidden="true"><span>BR</span><span>AR</span><span>GB</span><span>ES</span><span>JP</span><span>+8</span></div><Link href="/universo" className="text-link">Conhecer o universo planejado<Icon name="arrow" size={17} /></Link></section>
    </div>
    <aside className="development-note"><span className="note-icon"><Icon name="layers" size={19} /></span><div><strong>Estamos no início de uma grande história.</strong><p>Nesta versão, você cria e salva seu perfil. Clubes, propostas e temporadas chegam nas próximas etapas.</p></div><Link href="/projeto" aria-label="Ver as etapas do projeto"><Icon name="arrow" size={20} /></Link></aside>
  </>;
}
