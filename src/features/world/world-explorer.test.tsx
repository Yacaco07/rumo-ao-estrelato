import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CURRENT_WORLD } from "@/data/world/current-world";
import type { WorldSnapshot } from "@/domain/world/world-schema";
import { WorldExplorer } from "./world-explorer";

function withPendingClub(): WorldSnapshot {
  const world = structuredClone(CURRENT_WORLD);
  world.players = world.players.filter((player) => player.clubId !== "br-sao-paulo");
  world.clubs.find((club) => club.id === "br-sao-paulo")!.roster = {
    status: "pending", sourceId: null, sourceListedCount: null,
    registrationVerified: false, notes: "Fixture de pesquisa pendente.",
  };
  return world;
}

describe("Explorador do universo", () => {
  it("apresenta a relação pesquisada, filtra posições e mostra as fontes", async () => {
    const user = userEvent.setup();
    render(<WorldExplorer world={CURRENT_WORLD} />);
    await user.click(screen.getByRole("button", { name: "Ver Palmeiras" }));
    const details = screen.getByRole("region", { name: "Detalhes do clube" });
    expect(within(details).getByRole("heading", { name: "Palmeiras" })).toBeInTheDocument();
    expect(screen.getByRole("table")).toHaveAccessibleName(/Relação consultada de Palmeiras/);
    expect(screen.getByText("25 de 25 nomes na relação consultada")).toBeInTheDocument();
    expect(within(details).getByRole("link", { name: "Sociedade Esportiva Palmeiras" })).toHaveAttribute("href", "https://www.palmeiras.com.br/elenco/");
    await user.selectOptions(screen.getByLabelText("Posição", { exact: true }), "goalkeeper");
    expect(screen.getByText("3 de 25 nomes na relação consultada")).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: "Carlos Miguel" })).toBeInTheDocument();
    expect(screen.queryByRole("rowheader", { name: "Murilo" })).not.toBeInTheDocument();
  });

  it("busca sem acentos, seleciona e não apresenta elenco desconhecido como zero jogadores", async () => {
    const user = userEvent.setup();
    render(<WorldExplorer world={withPendingClub()} />);
    await user.type(screen.getByRole("searchbox", { name: "Buscar clube" }), "sao paulo");
    expect(screen.getByRole("status")).toHaveTextContent("1 de 20 clubes");
    await user.click(screen.getByRole("button", { name: "Ver São Paulo" }));
    const details = screen.getByRole("region", { name: "Detalhes do clube" });
    expect(within(details).getByRole("heading", { name: "São Paulo" })).toBeInTheDocument();
    expect(within(details).getByText("JOGADORES: A PESQUISAR")).toBeInTheDocument();
    expect(within(details).queryByText(/0 jogadores/)).not.toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("combina filtros, limpa a busca e recupera de nenhum resultado", async () => {
    const user = userEvent.setup();
    render(<WorldExplorer world={withPendingClub()} />);
    await user.selectOptions(screen.getByLabelText("Cobertura do elenco"), "pending");
    expect(screen.getByRole("status")).toHaveTextContent("1 de 20 clubes");
    await user.type(screen.getByRole("searchbox", { name: "Buscar clube" }), "Flamengo");
    expect(screen.getByRole("status")).toHaveTextContent("0 de 20 clubes");
    expect(screen.getByRole("heading", { name: "Nenhum clube encontrado." })).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(screen.getByRole("status")).toHaveTextContent("20 de 20 clubes");
    await user.selectOptions(screen.getByLabelText("Clube", { exact: true }), "br-flamengo");
    expect(within(screen.getByRole("region", { name: "Detalhes do clube" })).getByRole("heading", { name: "Flamengo" })).toBeInTheDocument();
  });

  it("explica o alcance da CBF e permite consultar posições desconhecidas", async () => {
    const user = userEvent.setup();
    render(<WorldExplorer world={CURRENT_WORLD} />);
    await user.click(screen.getByRole("button", { name: "Ver Corinthians" }));
    const details = screen.getByRole("region", { name: "Detalhes do clube" });
    expect(within(details).getByText("Atletas listados pela CBF")).toBeInTheDocument();
    expect(within(details).getByText(/Não representa um elenco principal completo/)).toBeInTheDocument();
    expect(within(details).queryByText("Relação do clube consultada")).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Posição", { exact: true }), "goalkeeper");
    expect(within(details).getByRole("status")).toHaveTextContent("Nenhum jogador listado nesta posição.");
    await user.selectOptions(screen.getByLabelText("Posição", { exact: true }), "unknown");
    expect(screen.getByRole("table")).toHaveAccessibleName(/Relação consultada de Corinthians/);
    expect(within(details).getAllByRole("cell").every((cell) => cell.textContent === "A confirmar")).toBe(true);
  });
});
