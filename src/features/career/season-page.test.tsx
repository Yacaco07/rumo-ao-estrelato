import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import SeasonRoute from "@/app/temporada/page";
import { createEmptyDraft } from "@/domain/athlete/athlete";
import { AthleteProvider } from "@/features/athlete/athlete-provider";
import { athleteRepository } from "@/infrastructure/storage/athlete-repository";

function renderSeason() {
  return render(<AthleteProvider><SeasonRoute /></AthleteProvider>);
}

describe("Temporada na interface", () => {
  beforeEach(async () => {
    const saved = await athleteRepository.read();
    if (saved) await athleteRepository.remove(saved.revision);
  });

  it("encaminha para as propostas se ainda não houver contrato", async () => {
    renderSeason();
    expect(await screen.findByRole("link", { name: "Abrir propostas" })).toHaveAttribute("href", "/propostas");
  });

  it("recupera contrato anterior, treina, joga a estreia e recupera o placar ao reabrir", async () => {
    const user = userEvent.setup();
    const player = await athleteRepository.save(
      { ...createEmptyDraft(), name: "BH Gonçalves", position: "GK", allocation: { reflexes: 10 } }, "ready", null,
    );
    await athleteRepository.signContract({
      clubId: "br-palmeiras", clubName: "Palmeiras", catalogVersion: "2026.11.17-01",
      months: 24, role: "rotation", monthlySalary: 4400,
    }, player);

    const view = renderSeason();
    const commitments = await screen.findByRole("region", { name: "Próximos compromissos" });
    expect(within(commitments).getAllByRole("listitem")).toHaveLength(3);
    expect(within(commitments).getByText(/Série A · Rodada 1 · .*Palmeiras/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Treino técnico/ }));
    await screen.findByRole("status");
    expect((await athleteRepository.read())?.season?.preparation).toBe("technical");
    expect(screen.queryByRole("button", { name: /Treino físico/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Próxima semana" }));
    const firstResult = await screen.findByRole("region", { name: "Resultado da rodada 1" });
    expect(within(firstResult).getByText(/90 min · Nota/)).toBeInTheDocument();
    expect((await athleteRepository.read())?.season?.rounds).toEqual(["technical"]);
    const savedScore = within(firstResult).getByText(/\d+ × \d+/, { selector: ".season-score strong" }).textContent;

    view.unmount();
    renderSeason();
    expect(await screen.findByText("BH Gonçalves · 1 de 38 rodadas disputadas")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Próxima semana" })).toBeEnabled();
    const updatedResult = screen.getByRole("region", { name: "Resultado da rodada 1" });
    expect(within(updatedResult).getByText(savedScore!, { selector: ".season-score strong" })).toBeInTheDocument();
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(21);
  });
});
