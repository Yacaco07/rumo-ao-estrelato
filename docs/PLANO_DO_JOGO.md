# RUMO AO ESTRELATO — documento principal

Repositório exclusivo: <https://github.com/Yacaco07/rumo-ao-estrelato>. Branch: `main`.

## Visão

Simulador de carreira individual de futebol para navegador. O jogador cria um atleta, escolhe um primeiro clube entre cinco propostas elegíveis e conduz uma carreira com escolhas, consequências e um mundo que evolui independentemente dele.

A identidade é premium, moderna e minimalista: preto, branco, cinzas e verde-limão discreto. Interface em português brasileiro, responsiva e acessível por teclado. Sem fotos de jogadores.

## Regras fundamentais

- Cada posição define atributos-base de projeto. O usuário distribui exatamente **10 pontos extras** para concluir o perfil. Esses valores são parâmetros fictícios de balanceamento, nunca avaliações reais de jogadores.
- Atributos de goleiro diferem dos de jogadores de linha. Alterar posição zera a distribuição após confirmação para impedir pontos incompatíveis.
- Um perfil salvo não equivale a uma carreira iniciada. Sem dados de clubes aprovados e o sistema de propostas implementado, não existe botão que finja começar uma temporada.
- Dados reais precisam de fonte, temporada e data de verificação. Informações desconhecidas permanecem desconhecidas. Dados simulados são identificados como simulação.
- Saves pertencem ao navegador/dispositivo; exportação, importação e migrações devem anteceder saves de carreiras longas.

## Etapa 01 — fundação e primeira interface

Fluxo de trabalho: **PLANEJAR → IMPLEMENTAR → TESTAR → REVISAR → APROVAR**.

Entregas: auditoria, este documento, arquitetura, política de dados, Next.js + React + TypeScript + Tailwind, central inicial, criador de perfil com 10 pontos e IndexedDB, visão honesta do universo planejado, testes de regras e persistência e build de produção.

Fora desta etapa: base completa de clubes/elencos, escudos, propostas, salários, contratos, calendário jogável, partidas, transferências, seleções e temporadas. Nenhuma estatística, notícia, proposta ou classificação fictícia é apresentada como real ou como funcionalidade pronta.

## Sistemas previstos

| Sistema | Comportamento esperado | Critério para avançar |
| --- | --- | --- |
| Criação | Identidade, posição, pé dominante, atributos-base e 10 pontos | Regras, validação e salvamento testados |
| Mundo inicial | Snapshot de clubes, elencos e regras por temporada | Cobertura e fontes auditadas; licenças de imagens registradas |
| Cinco propostas | Exatamente cinco clubes distintos, elegíveis ao perfil | Amostragem determinística e condições contratuais válidas |
| Contratos | Duração, salário, papel no elenco, cláusulas e contrapropostas | Valores e transições de estado consistentes |
| Calendário | Datas, rodadas, janelas, descanso e conflitos | Invariantes de calendário e formatos por edição verificados |
| Partidas | Minutos, desempenho por posição, resultado e estatísticas | Aleatoriedade reproduzível, conservação de placar e estatísticas |
| Progressão | Treino, experiência, forma, fadiga e desenvolvimento | Limites, equilíbrio e efeito do tempo testados |
| Mercado | Transferências, empréstimos, negociações e insatisfação | Registro de vínculo único; janelas e contratos respeitados |
| Competições | Ligas, copas, torneios continentais e internacionais | Qualificação, desempates e formatos versionados por temporada |
| Seleções | Elegibilidade, convocações e competições internacionais | Regras documentadas; coexistência com calendário de clubes |
| História | Estatísticas, troféus, premiações e trajetória | Histórico imutável e rastreável a eventos |
| Mundo dinâmico | Envelhecimento, evolução, aposentadorias, novos atletas e movimentações | Simulações longas determinísticas e saves migráveis |

Não fixar regulamentos esportivos de memória: cada edição e regra entra após verificação. Detalhes de balanceamento devem ser avaliados em protótipos pequenos e aprovados antes da expansão.

## Universo solicitado

| Região | País | Ligas |
| --- | --- | --- |
| América do Sul | Brasil | Série A e Série B; sem estaduais |
| América do Sul | Argentina | Liga Profesional Argentina |
| Europa | Inglaterra | Premier League |
| Europa | Espanha | La Liga |
| Europa | Alemanha | Bundesliga |
| Europa | Itália | Serie A |
| Europa | França | Ligue 1 |
| Ásia | Arábia Saudita | Saudi Pro League |
| Ásia | Japão | J1 League |
| Ásia | Coreia do Sul | K League 1 |
| Ásia | Emirados Árabes Unidos | UAE Pro League |
| Ásia | Catar | Qatar Stars League |
| Ásia | China | Chinese Super League |

São 14 ligas em 13 países e 3 continentes. A lista descreve o escopo, não uma base de dados já importada. Calendários anuais e calendários entre dois anos precisam coexistir; uma data de referência global não substitui a temporada própria de cada liga.

## Critérios de aprovação da primeira etapa

1. Origin aponta exclusivamente ao repositório oficial; checkout em `main`; arquivos anteriores preservados.
2. Instalação reproduzível por lockfile, TypeScript sem erros e build concluído.
3. Perfil valida identidade e atributos, aplica exatamente 10 pontos ao concluir, permite salvar rascunho incompleto e recupera após recarregar.
4. Falhas de IndexedDB e saves incompatíveis são comunicados sem perda silenciosa de dados.
5. Interface funciona em desktop e celular e possui foco visível, nomes acessíveis e estados de erro.
6. Revisão informa resultados concretos, limitações e commits enviados; aprovação da próxima etapa fica com o responsável pelo projeto.

## Próxima etapa proposta

Após aprovação da fundação: criar o processo de pesquisa e importação de um recorte verificável do universo, com contratos de dados, validação e revisão de licenças. Expandir liga por liga. O sistema das cinco propostas começa somente quando houver cobertura suficiente para gerar propostas verdadeiras dentro do snapshot do jogo.
