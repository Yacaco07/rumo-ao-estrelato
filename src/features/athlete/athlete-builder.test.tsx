import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import OffersPage from "@/app/propostas/page";
import { AthleteProvider } from "./athlete-provider";
import { AthletePage } from "./athlete-builder";
import { athleteRepository } from "@/infrastructure/storage/athlete-repository";

async function startBuilder() {
  const rendered = render(<AthleteProvider><AthletePage /></AthleteProvider>);
  await screen.findByLabelText("Nome do atleta");
  return rendered;
}

describe("Fluxo de criação", () => {
  beforeEach(async () => { const saved = await athleteRepository.read(); if (saved) await athleteRepository.remove(saved.revision); });

  it("exige nome e 10 pontos, recupera o perfil e libera cinco propostas", async () => {
    const user = userEvent.setup();
    const view = await startBuilder();
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Informe um nome");
    await user.type(screen.getByLabelText("Nome do atleta"), "BH Gonçalves");
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await user.click(screen.getByRole("button", { name: "Goleiro (GOL)" }));
    expect(screen.getByRole("button", { name: "Aumentar Reflexos" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Aumentar Finalização" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Distribua os 10 pontos");
    for (let point = 0; point < 10; point++) await user.click(screen.getByRole("button", { name: "Aumentar Reflexos" }));
    expect(screen.getByRole("button", { name: "Aumentar Reflexos" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await user.click(screen.getByRole("button", { name: "Concluir perfil" }));
    await screen.findByText("Perfil concluído e salvo neste navegador. Seu primeiro passo está dado.");
    expect((await athleteRepository.read())?.athlete.allocation).toEqual({ reflexes: 10 });
    view.unmount();
    const reopened = render(<AthleteProvider><AthletePage /></AthleteProvider>);
    await screen.findByRole("button", { name: "Perfil concluído" });
    expect(screen.getByRole("button", { name: "Perfil concluído" })).toBeDisabled();
    expect(screen.getByText("BH Gonçalves", { selector: "dd" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver minhas propostas" })).toHaveAttribute("href", "/propostas");

    reopened.rerender(<AthleteProvider><OffersPage /></AthleteProvider>);
    expect(screen.getByRole("heading", { name: "BH Gonçalves" })).toBeInTheDocument();
    const offers = screen.getByRole("list", { name: "Cinco propostas simuladas" });
    expect(within(offers).getAllByRole("listitem")).toHaveLength(5);
    expect(within(offers).getAllByText("Goleiros na relação")).toHaveLength(5);
    expect(within(offers).getAllByText("24 meses")).toHaveLength(5);
    expect((await athleteRepository.read())?.status).toBe("ready");
  });

  it("permite rascunho incompleto e só troca de posição com extras após confirmação", async () => {
    const user = userEvent.setup();
    const view = await startBuilder();
    await user.click(screen.getByRole("button", { name: "Salvar rascunho" }));
    await screen.findByText("Rascunho salvo neste navegador. Você pode continuar depois.");
    expect((await athleteRepository.read())?.status).toBe("draft");
    view.rerender(<AthleteProvider><OffersPage /></AthleteProvider>);
    expect(screen.getByRole("heading", { name: "Conclua seu perfil" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir meu atleta" })).toHaveAttribute("href", "/atleta");
    view.rerender(<AthleteProvider><AthletePage /></AthleteProvider>);
    await user.type(screen.getByLabelText("Nome do atleta"), "Ana");
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await user.click(screen.getByRole("button", { name: "Aumentar Finalização" }));
    await user.click(screen.getByRole("button", { name: "Goleiro (GOL)" }));
    await user.click(screen.getByRole("button", { name: "Manter posição" }));
    expect(screen.getByRole("button", { name: "Aumentar Finalização" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Goleiro (GOL)" }));
    await user.click(screen.getByRole("button", { name: "Trocar e zerar pontos" }));
    expect(screen.getByRole("button", { name: "Diminuir Reflexos" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Salvar rascunho" }));
    await waitFor(async () => { expect((await athleteRepository.read())?.athlete).toMatchObject({ position: "GK", allocation: {} }); });
  });

  it("permite voltar durante uma troca pendente e só exclui o perfil após confirmar", async () => {
    const user = userEvent.setup();
    await startBuilder();
    await user.type(screen.getByLabelText("Nome do atleta"), "Ana");
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await user.click(screen.getByRole("button", { name: "Aumentar Finalização" }));
    await user.click(screen.getByRole("button", { name: "Goleiro (GOL)" }));
    expect(screen.getByRole("button", { name: "Continuar" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Voltar" }));
    expect(screen.getByRole("button", { name: "Continuar" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Salvar rascunho" }));
    await screen.findByText("Rascunho salvo neste navegador. Você pode continuar depois.");
    await user.click(screen.getByText("Gerenciar perfil salvo"));
    await user.click(screen.getByRole("button", { name: "Excluir perfil deste navegador" }));
    expect(await athleteRepository.read()).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(await athleteRepository.read()).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "Excluir perfil deste navegador" }));
    await user.click(screen.getByRole("button", { name: "Confirmar exclusão" }));
    await screen.findByText("Perfil excluído deste navegador.");
    expect(await athleteRepository.read()).toBeNull();
  });
});
