from os import environ
import re
from pathlib import Path
from tempfile import TemporaryDirectory
from subprocess import Popen
from time import sleep
from urllib.request import urlopen

from playwright.sync_api import expect, sync_playwright

ROOT = Path.cwd()
PORT = 4324
BASE_PATH = environ.get("RAE_TEST_BASE_PATH", "")
BASE = f"http://127.0.0.1:{PORT}{BASE_PATH}"
OUTPUT = ROOT / "entrega" / "navegador"
OUTPUT.mkdir(parents=True, exist_ok=True)

def test(profile: Path):
    errors = []
    with sync_playwright() as p:
        def open_playing(user_dir, **kwargs):
            return p.chromium.launch_persistent_context(
                str(user_dir), headless=True, accept_downloads=True, **kwargs,
            )

        with open_playing(profile / "desktop", viewport={"width": 1366, "height": 900}) as context:
            page = context.pages[0]
            page.on("pageerror", lambda error: errors.append(str(error)))
            if (OUTPUT / "backup-qa.json").exists():
                (OUTPUT / "backup-qa.json").unlink()
            page.goto(BASE + "/atleta")
            expect(page.get_by_label("Nome do atleta")).to_be_visible()
            page.get_by_label("Nome do atleta").fill("Atleta QA")
            page.get_by_role("button", name="Continuar").click()
            page.get_by_role("button", name="Goleiro (GOL)").click()
            for _ in range(10):
                page.get_by_role("button", name="Aumentar Reflexos").click()
            page.get_by_role("button", name="Continuar").click()
            page.get_by_role("button", name="Concluir perfil").click()
            expect(page).to_have_url(re.compile(re.escape(BASE + "/propostas") + "/?$"))
            offers = page.get_by_role("list", name="Cinco propostas simuladas")
            expect(offers.get_by_role("listitem")).to_have_count(5)
            offers.get_by_role("button", name="Selecionar proposta de", exact=False).nth(1).click()
            negotiation = page.get_by_role("region", name="Negociação com", exact=False)
            negotiation.get_by_label("Papel no elenco").select_option("crucial")
            negotiation.get_by_label("Duração solicitada").select_option("36")
            negotiation.get_by_role("button", name="Enviar contraproposta").click()
            expect(negotiation.get_by_role("status")).to_contain_text("aceitou")
            negotiation.get_by_role("button", name="Revisar assinatura").click()
            negotiation.get_by_role("button", name="Confirmar assinatura").click()
            expect(page.get_by_text("Contrato assinado e salvo neste navegador.")).to_be_visible()
            page.get_by_role("link", name="Entrar na temporada").click()
            expect(page).to_have_url(re.compile(re.escape(BASE + "/temporada") + "/?$"))
            page.get_by_label("Atributo a desenvolver").select_option("handling")
            page.get_by_role("button", name="Treino técnico", exact=False).click()
            expect(page.get_by_text("Treino técnico registrado", exact=False)).to_contain_text("Segurança")
            page.get_by_role("button", name="Próxima semana").click()
            result = page.get_by_role("region", name="Resultado da rodada 1")
            expect(result).to_be_visible()
            expect(result.get_by_text("Linha do tempo da partida")).to_be_visible()
            expect(page.get_by_role("table").get_by_role("row")).to_have_count(21)
            print("Desktop: criador, propostas, negociação, contrato, treino e estreia", flush=True)

            page.get_by_role("button", name="Pedir transferência").click()
            expect(page.get_by_text("Pedido em análise: transferência.")).to_be_visible()
            page.get_by_role("button", name="Próxima semana").click()
            club_offers = page.get_by_role("region", name="Mercado e clube").locator(".market-offers")
            expect(club_offers.get_by_role("listitem")).to_have_count(3)
            destination = club_offers.get_by_role("heading").first.inner_text()
            club_offers.get_by_role("button", name="Aceitar", exact=True).first.click()
            expect(page.get_by_role("heading", name=destination + ".", exact=True)).to_be_visible()
            page.get_by_role("link", name="Competições", exact=True).click()
            page.get_by_label("Competição", exact=True).select_option("champions")
            expect(page.get_by_role("heading", name="UEFA Champions League", exact=True)).to_be_visible()
            expect(page.get_by_role("table").get_by_role("row")).to_have_count(33)
            page.get_by_label("Competição", exact=True).select_option("world-cup")
            expect(page.get_by_role("table")).to_have_count(12)
            page.get_by_role("link", name="Minha temporada").click()
            page.get_by_label("Avançar até a data").fill("2026-10-23")
            page.get_by_role("button", name="Avançar", exact=True).click()
            expect(page.get_by_text("TEMPORADA SIMULADA 2027", exact=False)).to_be_visible(timeout=15000)
            page.get_by_role("link", name="Mundo da carreira").click()
            expect(page.get_by_label("Clube", exact=True).get_by_role("option")).to_have_count(258)
            expect(page.get_by_role("region", name="Movimentações pelo mundo").get_by_role("listitem").first).to_be_visible()
            page.get_by_role("link", name="Minha temporada").click()
            page.get_by_role("link", name="Histórico", exact=True).click()
            expect(page.get_by_role("region", name="Temporadas").get_by_text("2026", exact=True)).to_be_visible()
            with page.expect_download() as exported:
                page.get_by_role("button", name="Exportar carreira").click()
            exported.value.save_as(str(OUTPUT / "backup-qa.json"))
            page.screenshot(path=str(OUTPUT / "desktop-historico.png"), full_page=True)
            print("Desktop: mercado, competições, virada, mundo, histórico e exportação", flush=True)

        with open_playing(profile / "desktop", viewport={"width": 1366, "height": 900}) as context:
            page = context.pages[0]
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.goto(BASE + "/temporada")
            expect(page.get_by_text("TEMPORADA SIMULADA 2027", exact=False)).to_be_visible()
            expect(page.get_by_role("heading", name=destination + ".", exact=True)).to_be_visible()
            print("IndexedDB: Chromium fechado, reaberto e carreira recuperada", flush=True)

        with open_playing(profile / "mobile", viewport={"width": 390, "height": 844},
                          device_scale_factor=2, is_mobile=True, has_touch=True) as context:
            page = context.pages[0]
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.on("dialog", lambda dialog: dialog.accept())
            page.goto(BASE + "/carreira")
            page.get_by_label("Arquivo da carreira (.json)").set_input_files(str(OUTPUT / "backup-qa.json"))
            page.get_by_role("button", name="Importar carreira").click()
            expect(page.get_by_text("Carreira importada.")).to_be_visible()
            expect(page.get_by_role("region", name="Temporadas").get_by_text("2026", exact=True)).to_be_visible()
            for route, title in [("/temporada", "Próxima semana"), ("/competicoes", "Competição"), ("/mundo", "Movimentações pelo mundo")]:
                page.goto(BASE + route)
                expect(page.get_by_text(title, exact=True).first).to_be_visible()
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), route
                if route == "/temporada":
                    page.screenshot(path=str(OUTPUT / "mobile-temporada.png"), full_page=True)
            assert not errors, errors
            (OUTPUT / "backup-qa.json").unlink()
            print("Mobile: importação, temporada, competições e mundo sem rolagem horizontal da página", flush=True)

if BASE_PATH:
    from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
    from threading import Thread

    with TemporaryDirectory() as directory:
        path = Path(directory) / BASE_PATH.strip("/")
        path.symlink_to(ROOT / "out", target_is_directory=True)
        handler = lambda *args, **kwargs: SimpleHTTPRequestHandler(*args, directory=directory, **kwargs)
        server = ThreadingHTTPServer(("127.0.0.1", PORT), handler)
        thread = Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            with TemporaryDirectory() as profile:
                test(Path(profile))
        finally:
            server.shutdown()
            server.server_close()
            thread.join()
else:
    with Popen(["node", "node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", str(PORT)]) as server:
        try:
            for _ in range(50):
                try:
                    with urlopen(BASE + "/temporada", timeout=2) as response:
                        if response.status == 200:
                            break
                except OSError:
                    sleep(0.15)
            else:
                raise RuntimeError("Servidor de produção indisponível")
            with TemporaryDirectory() as profile:
                test(Path(profile))
        finally:
            server.terminate()
            server.wait(timeout=5)
