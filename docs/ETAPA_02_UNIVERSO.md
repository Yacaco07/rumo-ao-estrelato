# Etapa 02 — primeiro catálogo real do universo

Esta página registra a primeira publicação (0.2.0). A continuação autorizada está em [ETAPA_02B_ELENCOS.md](ETAPA_02B_ELENCOS.md), com resultados em [PESQUISA_SERIE_A_2026.md](PESQUISA_SERIE_A_2026.md).

## Plano aprovado para execução

O usuário autorizou avançar após a publicação da fundação em `main`. Esta etapa implementa o próximo marco do plano: contratos de dados, pesquisa de um recorte e importação verificável. Todo o trabalho continua em `Yacaco07/rumo-ao-estrelato`, branch `main`.

Recorte: participantes da Série A 2026 e a relação principal publicada pelo Palmeiras, consultados em 10/11/2026. A CBF informa 20 participantes. O site do Palmeiras lista 25 jogadores na seção principal, com posição e camisa; os nove nomes da seção separada de empréstimos não entram como elenco principal. A relação publicada não equivale à auditoria de inscrições, contratos ou completude do elenco disponível para uma carreira.

## Implementar

1. Snapshot JSON versionado e validado por Zod, sem dependência de rede durante o uso.
2. Identificadores estáveis, origem de cada campo, datas de consulta e atualização somente quando publicadas. Datas de nascimento e nacionalidades desconhecidas permanecem `null`.
3. Validações de referências, duplicação, datas, posição, camisa e cobertura. Um clube sem elenco pesquisado não possui um elenco vazio.
4. Verificador executável para revisar um JSON antes de incluir a nova versão no código.
5. Tela de universo com busca sem distinção de acentos, filtro por cobertura, seleção de clube, relação de jogadores e fontes. As outras 13 ligas permanecem planejadas.
6. Continuidade do criador e dos saves da etapa 01, sem alterar seu schema ou banco.

## Fora do recorte

Não iniciar propostas, contratos, partidas ou temporadas. Não converter posições amplas do site (por exemplo, “Atacante”) em uma função específica como ponta ou centroavante. Não criar salários, ratings ou dados biográficos. Não incluir escudos, fotos, notícias copiadas ou tabelas de classificação. O catálogo continua sem autorização para iniciar carreiras; sua prontidão é explicitamente falsa.

## Fontes e revisão

| Fonte | URL | Campos utilizados | Consulta |
| --- | --- | --- | --- |
| CBF — Série A 2026 | https://www.cbf.com.br/futebol-brasileiro/tabelas/campeonato-brasileiro/serie-a/2026 | Nomes dos participantes e temporada; sem resultados/classificação | 10/11/2026 |
| Palmeiras — Futebol Profissional | https://www.palmeiras.com.br/elenco/ | Nome publicado, posição publicada e camisa dos 25 jogadores da seção principal | 10/11/2026 |
| CBF — Termos de Uso | https://www.cbf.com.br/termos-de-uso | Referência de direitos; não oferece autorização de reprodução de ativos | 10/11/2026 |

A data de atualização exibida pela CBF é 10/11/2026. A página do elenco do Palmeiras não fornece data de atualização nem edição expressa para a relação; esses campos não devem ser inventados. O cadastro registra a data da consulta. Os termos da CBF reservam direitos de reprodução: não foram copiados textos editoriais, imagens, layout, tabelas, estatísticas ou documentos. O catálogo factual registra nomes independentemente, citando a fonte de conferência, sem declarar uma licença concedida por essas entidades. Direitos de uso de escudos continuam não verificados e os ativos permanecem ausentes.

A página canônica do Flamengo retornou apenas o filtro de goleiros; uma página de homologação também apareceu na pesquisa. Nenhuma foi usada como relação completa ou entrou no snapshot. Fontes incompletas ou de homologação precisam ser separadas das verificadas para cada campo.

## Testar e revisar

- Esquemas e integridade do catálogo real, incluindo referências e contagens derivadas.
- Rejeição de IDs repetidos, fonte inexistente, datas incoerentes, posição incompatível e camisa duplicada no mesmo clube.
- Busca com acentos, filtros combinados, seleção, falta de resultados e apresentação de cobertura desconhecida.
- Regressão dos 37 testes do criador e da persistência.
- TypeScript, build de produção e workflow remoto antes da entrega.
- Tentar novamente a prévia gerenciada. Se a infraestrutura continuar incompatível com Next.js, registrar o limite e não declarar revisão visual concluída.

A próxima expansão deve completar outros elencos por fontes oficiais e revisar a inscrição dos atletas antes de começar as cinco propostas. A aprovação desta etapa não implica uma base completa das 14 ligas.
