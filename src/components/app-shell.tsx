"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode, MouseEvent } from "react";
import { useAthlete } from "@/features/athlete/athlete-provider";
import { Icon, type IconName } from "./icon";

const navigation: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Central", icon: "home" }, { href: "/atleta", label: "Meu atleta", icon: "person" },
  { href: "/universo", label: "O universo", icon: "globe" }, { href: "/projeto", label: "Sobre o jogo", icon: "layers" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { saved, loading, error, dirty } = useAthlete();
  const current = navigation.find((item) => item.href === pathname);

  function guardNavigation(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (dirty && href !== pathname && !window.confirm("Você tem alterações não salvas. Deseja sair e descartá-las?")) event.preventDefault();
  }

  return <div className="app-shell">
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <aside className="sidebar">
      <Link href="/" className="brand" aria-label="Rumo ao Estrelato — Central" onClick={(event) => guardNavigation(event, "/")}><span className="brand-mark"><Icon name="star" size={23} /></span><span>RUMO AO<br /><strong>ESTRELATO<span className="brand-dot">.</span></strong></span></Link>
      <div className="sidebar-divider" />
      <p className="nav-label">SEU JOGO. SUA HISTÓRIA.</p>
      <nav aria-label="Menu principal">{navigation.map((item) => <Link key={item.href} href={item.href} className={`nav-item ${pathname === item.href ? "active" : ""}`} aria-current={pathname === item.href ? "page" : undefined} onClick={(event) => guardNavigation(event, item.href)}><Icon name={item.icon} size={19} /><span>{item.label}</span>{pathname === item.href && <span className="nav-active-dot" />}</Link>)}</nav>
      <div className="sidebar-bottom"><div className="early-access"><span className="status-dot" />EM DESENVOLVIMENTO</div><p>Uma carreira começa<br />muito antes do primeiro gol.</p><span className="sidebar-version">UNIVERSO · V0.2.1</span></div>
    </aside>
    <div className="workspace">
      <header className="topbar"><div className="breadcrumb">Rumo ao Estrelato <span>/</span><strong>{current?.label ?? "Página"}</strong></div><div className="topbar-profile"><span className="topbar-status">{loading ? "Carregando perfil" : saved ? "Perfil salvo neste navegador" : "Um novo começo"}</span><span className="avatar">{saved?.athlete.name.slice(0, 2).toUpperCase() || <Icon name="person" size={16} />}</span></div></header>
      <main id="conteudo" tabIndex={-1} className="page-content">{error && <div className="notice notice-error" role="alert"><Icon name="info" /><div><strong>Salvamento indisponível</strong><p>{error}</p><button className="text-button" onClick={() => window.location.reload()}>Tentar recarregar</button></div></div>}{children}</main>
      <footer className="footer"><span>RUMO AO ESTRELATO <span className="footer-dot">·</span> Cada escolha, uma história.</span><span>Feito para quem vive o futebol.</span></footer>
    </div>
  </div>;
}
