import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect, useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OffersPage from "@/app/propostas/page";
import SeasonPage from "@/app/temporada/page";
import { AthleteProvider } from "./athlete-provider";
import { AthletePage } from "./athlete-builder";
import { createEmptyDraft } from "@/domain/athlete/athlete";
import { athleteRepository } from "@/infrastructure/storage/athlete-repository";

const navigation = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => navigation }));

function CareerFlow() {
  const [route, setRoute] = useState("/atleta");
  useEffect(() => {
    navigation.replace.mockImplementation(setRoute);
    return () => { navigation.replace.mockReset(); };
  }, []);

  return route === "/propostas" ? <OffersPage /> : <AthletePage />;
}

async function startBuilder(experience = <AthletePage />) {
  const rendered = render(<AthleteProvider>{experience}</AthleteProvider>);
  await screen.findByLabelText("Nome do atleta");
  return rendered;
}

describe("Fluxo de criação", () => {
  beforeEach(async () => { const saved = await athleteRepository.read(); if (saved) await athleteRepository.remove(saved.revision); });

  it("valida o perfil, abre cinco propostas automaticamente, negocia e recupera o contrato", async () => {
    const user = userEvent.setup();
    const view = await startBuilder(<CareerFlow />);
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
    const offers = await screen.findByRole("list", { name: "Cinco propostas simuladas" });
    expect(navigation.replace).toHaveBeenCalledWith("/propostas");
    expect(screen.getByRole("heading", { name: "BH Gonçalves" })).toBeInTheDocument();
    expect(within(offers).getAllByRole("listitem")).toHaveLength(5);
    expect(within(offers).getAllByText("Goleiros na relação")).toHaveLength(5);
    expect((await athleteRepository.read())?.athlete.allocation).toEqual({ reflexes: 10 });

    const cards = within(offers).getAllByRole("listitem");
    const selectedClub = within(cards[1]).getByRole("heading").textContent;
    await user.click(within(cards[1]).getByRole("button", { name: /Selecionar proposta de/ }));
    let negotiation = screen.getByRole("region", { name: `Negociação com ${selectedClub}` });
    await user.selectOptions(within(negotiation).getByLabelText("Papel no elenco"), "alternative");
    expect(within(negotiation).getByRole("button", { name: "Enviar contraproposta" })).toBeEnabled();
    expect(within(negotiation).getByRole("button", { name: "Revisar assinatura" })).toBeDisabled();

    const salary = within(negotiation).getByLabelText("Salário mensal solicitado (R$)") as HTMLInputElement;
    const agreedSalary = Number(salary.value) + 200;
    await user.clear(salary);
    await user.type(salary, String(agreedSalary));
    await user.selectOptions(within(negotiation).getByLabelText("Duração solicitada"), "36");
    expect(within(negotiation).getByRole("button", { name: "Revisar assinatura" })).toBeDisabled();
    await user.click(within(negotiation).getByRole("button", { name: "Enviar contraproposta" }));
    expect(within(negotiation).getByRole("status")).toHaveTextContent("O clube aceitou sua contraproposta.");

    await user.click(within(cards[0]).getByRole("button", { name: /Selecionar proposta de/ }));
    await user.click(within(cards[1]).getByRole("button", { name: /Selecionar proposta de/ }));
    negotiation = screen.getByRole("region", { name: `Negociação com ${selectedClub}` });
    expect(within(negotiation).getByLabelText("Duração solicitada")).toHaveValue("36");
    expect(within(negotiation).getByLabelText("Papel no elenco")).toHaveValue("alternative");
    await user.click(within(negotiation).getByRole("button", { name: "Revisar assinatura" }));
    expect(within(negotiation).getByText("Alternativo")).toBeInTheDocument();
    expect((await athleteRepository.read())?.contract).toBeUndefined();
    await user.click(within(negotiation).getByRole("button", { name: "Confirmar assinatura" }));
    await screen.findByText("Contrato assinado e salvo neste navegador.");

    const signed = await athleteRepository.read();
    expect(signed?.contract).toMatchObject({ clubName: selectedClub, monthlySalary: agreedSalary, months: 36, role: "alternative" });
    view.unmount();
    const reopened = render(<AthleteProvider><OffersPage /></AthleteProvider>);
    expect(await screen.findByRole("heading", { name: selectedClub ?? "" })).toBeInTheDocument();
    expect(screen.getByText("36 meses")).toBeInTheDocument();
    expect(screen.getByText("Alternativo")).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Cinco propostas simuladas" })).not.toBeInTheDocument();

    reopened.rerender(<AthleteProvider><SeasonPage /></AthleteProvider>);
    await user.click(await screen.findByRole("button", { name: "Próxima semana" }));
    await screen.findByRole("region", { name: "Resultado da rodada 1" });
    expect((await athleteRepository.read())?.season?.player.role).toBe("alternative");
  });

  it("assina a oferta original sem exigir contraproposta", async () => {
    const user = userEvent.setup();
    await athleteRepository.save({ ...createEmptyDraft(), name: "Ana", allocation: { shooting: 10 } }, "ready", null);
    render(<AthleteProvider><OffersPage /></AthleteProvider>);
    const buttons = await screen.findAllByRole("button", { name: /Selecionar proposta de/ });
    await user.click(buttons[0]);
    await user.click(screen.getByRole("button", { name: "Revisar assinatura" }));
    await user.click(screen.getByRole("button", { name: "Confirmar assinatura" }));
    await screen.findByText("Contrato assinado e salvo neste navegador.");
    expect((await athleteRepository.read())?.contract).toMatchObject({ monthlySalary: 4400, months: 24 });
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
