import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { AthleteProvider } from "@/features/athlete/athlete-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "RUMO AO ESTRELATO — Sua carreira começa aqui", template: "%s · RUMO AO ESTRELATO" },
  description: "Seu jogo. Suas escolhas. Sua história. A fundação de um simulador de carreira de futebol para navegador.",
  applicationName: "RUMO AO ESTRELATO",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="pt-BR"><body><AthleteProvider><AppShell>{children}</AppShell></AthleteProvider></body></html>;
}
