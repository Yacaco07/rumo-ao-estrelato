# Etapa 02B — pesquisa dos outros 19 clubes da Série A

Autorização: pesquisar os 19 elencos restantes antes do próximo sistema. Data de corte: 10/11/2026. Repositório exclusivo: `Yacaco07/rumo-ao-estrelato`, branch `main`.

## Plano

1. Consultar páginas oficiais dos clubes e a relação de atletas da CBF para a edição 2026; registrar URLs, datas e alcance de cada lista.
2. Conferir divergências de vínculo, excluir saídas sustentadas pelas fontes e deixar conflitos não resolvidos fora do recorte. Não deduzir identidade apenas por apelidos iguais.
3. Ampliar o snapshot existente preservando os IDs do Palmeiras. Campos não encontrados ficam `null`. Diferenciar uma relação do clube de atletas listados pela CBF na competição: esta última pode incluir a base e não representa um elenco profissional completo.
4. Exibir alcance, lacunas e fontes na consulta. Manter inscrições e prontidão para carreira como não verificadas. Não alterar o perfil salvo ou criar propostas, contratos e partidas.
5. Executar o verificador do catálogo, testes, TypeScript e build; revisar as alterações e publicar commits em `main`, preservando trabalho concorrente.

## Critérios de revisão

- Os 19 clubes têm resultado de pesquisa documentado, incluindo limitações de acesso e campos pendentes.
- Nenhum número de jogos é interpretado como camisa. Numerações conflitantes ficam desconhecidas.
- As contagens da interface vêm do snapshot. Uma pesquisa realizada não significa inscrição, vínculo contratual ou completude verificados.
- Fontes públicas fundamentam fatos; imagens, escudos, fotos, textos editoriais e layouts não são incorporados.
- O relatório final distingue relações de clubes e relações da competição. As outras 13 ligas continuam fora deste recorte.

Resultados e decisões por clube serão registrados em `PESQUISA_SERIE_A_2026.md`; verificações em `VALIDACAO_ETAPA_02B.md`.
