import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CURRENT_WORLD } from "@/data/world/current-world";
import { WorldExplorer } from "./world-explorer";

describe("Explorador do universo", () => {
  it("apresenta a relação pesquisada, filtra posições e mostra as fontes", async () => {
    const user = userEvent.setup();
    render(<WorldExplorer world={CURRENT_WORLD} />);
    const details = screen.getByRole("region", { name: "Detalhes do clube" });
    expect(within(details).getByRole("heading", { name: "Palmeiras" })).toBeInTheDocument();
    expect(screen.getByRole("table")).toHaveAccessibleName(/Relação principal publicada pelo Palmeiras/);
    expect(screen.getByText("25 de 25 nomes da relação principal")).toBeInTheDocument();
    expect(within(details).getByRole("link", { name: "Sociedade Esportiva Palmeiras" })).toHaveAttribute("href", "https://www.palmeiras.com.br/elenco/");
    await user.selectOptions(screen.getByLabelText("Posição", { exact: true }), "goalkeeper");
    expect(screen.getByText("3 de 25 nomes da relação principal")).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: "Carlos Miguel" })).toBeInTheDocument();
    expect(screen.queryByRole("rowheader", { name: "Murilo" })).not.toBeInTheDocument();
  });

  it("busca sem acentos, seleciona e não apresenta elenco desconhecido como zero jogadores", async () => {
    const user = userEvent.setup();
    render(<WorldExplorer world={CURRENT_WORLD} />);
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
    render(<WorldExplorer world={CURRENT_WORLD} />);
    await user.selectOptions(screen.getByLabelText("Cobertura do elenco"), "listed");
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
});
