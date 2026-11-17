# RUMO AO ESTRELATO

Simulador de carreira de jogador de futebol para navegador. **Versão 0.9.0. A carreira atravessa temporadas, contratações, competições e aposentadoria.**

Repositório oficial e exclusivo: <https://github.com/Yacaco07/rumo-ao-estrelato> · branch `main`.

**Situação desta entrega:** código e documentação do projeto publicados na branch `main` do repositório oficial. As regras das propostas e da assinatura estão em [ETAPA_03_PROPOSTAS.md](docs/ETAPA_03_PROPOSTAS.md). A pesquisa de numeração está em [REVISAO_SERIE_A_2026.md](docs/REVISAO_SERIE_A_2026.md).

## Executar

Requisitos: **Node.js 24 LTS (24.15 ou superior na série 24)** e npm. A versão principal está em `.nvmrc`.

```bash
git clone https://github.com/Yacaco07/rumo-ao-estrelato.git
cd rumo-ao-estrelato
npm ci
npm run dev
```

Abra <http://localhost:3000>. Se a porta estiver ocupada, use `npm run dev -- --port 3001` e abra a porta indicada pelo Next.js.

Para executar o build de produção:

```bash
npm run build
npm start
```

Para publicar o frontend estático no GitHub Pages, selecione GitHub Actions como origem na configuração Pages deste repositório e execute o workflow **Verificar aplicação**. O workflow testa a exportação com a mesma base de caminhos usada na publicação. O servidor Next.js continua disponível para Codespaces e desenvolvimento local.

## O que funciona

- Central inicial com visual preto, branco, cinza e verde-limão, navegação e resumo do perfil salvo.
- Criação em três passos: identidade; posição e atributos; revisão.
- Oito posições, com seis atributos específicos de goleiro ou seis de linha.
- Dez pontos extras, sem ultrapassar o limite ou reduzir a base. Troca de posição com pontos distribuídos exige confirmação para zerá-los.
- Salvamento de rascunho incompleto ou perfil concluído em IndexedDB; conclusão exige identidade válida e exatamente dez pontos.
- Reabertura do perfil, validação de saves, proteção contra sobrescrita por outra aba e exclusão com confirmação.
- Catálogo pesquisado da Série A 2026: 20 clubes e 659 jogadores, com 111 fontes consultadas até 17/11/2026.
- Busca de clubes sem distinção de acentos, filtro por cobertura e posição, seleção de clube e fontes com datas.
- Cobertura explícita: 18 relações de clubes e duas listas da CBF, que podem incluir base. Os 659 jogadores têm posição e camisa documentada. Em 13 casos, a numeração vem de uma partida identificada e a atribuição atual ainda está a confirmar. As outras 13 ligas têm participantes documentados e elencos a pesquisar.
- Snapshot versionado validado por Zod, com referências por campo e verificador de importação.
- Ao concluir o perfil, a tela `/propostas` abre automaticamente com cinco clubes. Cada oferta mostra concorrência no setor, salário, duração e papel simulados.
- Escolha uma oferta, negocie salário, duração e papel no elenco, revise os termos e confirme a assinatura. O primeiro contrato é salvo no IndexedDB e o clube aparece na central do atleta.

- Temporadas em `/temporada` com calendário, avanço semanal ou por data, treino individual, escalação, lances, lesões, suspensões e classificação.
- Mercado com insatisfação, transferências, empréstimos, contrapropostas e renovações. Os elencos brasileiros mudam junto com a inscrição do atleta.
- `/competicoes` mostra 14 ligas, copas, campeões e seleções. O acesso e o descenso brasileiros alteram os participantes.
- `/carreira` reúne histórico, recordes, premiações, aposentadoria e exportação e importação de saves.
- `/mundo` acompanha elencos, técnicos, contratações e aposentadorias que acontecem ao longo das edições.

A carreira individual e o mercado do atleta operam no Brasil. Ligas estrangeiras e copas têm calendário, resultados e fases simulados por clube. As fontes e os recortes de regulamento estão em [COMPETICOES.md](docs/COMPETICOES.md). Escudos dependem de autorização por ativo.

O jogo salva um perfil por origem, navegador e dispositivo. Exporte um arquivo pela página **História da carreira** para levar o progresso a outro navegador ou endereço.

## Verificar

```bash
npm run data:check
npm run typecheck
npm test
npm run build
```

Ou `npm run check` para as quatro verificações em sequência. `npm run test:watch` acompanha os testes durante o desenvolvimento. O workflow em `.github/workflows/ci.yml` executa instalação reproduzível e verificações em pushes e pull requests para `main`.

Os testes cobrem criação, abertura automática das ofertas, contrapropostas, assinatura, reabertura e concorrência entre abas, além da validação dos dados e do salvamento. Os testes automatizados de domínio e interface usam Vitest. O workflow também executa um cenário de ponta a ponta no Chromium, com janelas de computador e celular, salvamento IndexedDB, reabertura e backup.

## Documentação e arquivos

| Arquivo/diretório | Finalidade |
| --- | --- |
| [docs/PLANO_DO_JOGO.md](docs/PLANO_DO_JOGO.md) | Visão, sistemas, universo, etapas e critérios de aprovação |
| [docs/ARQUITETURA.md](docs/ARQUITETURA.md) | Camadas, stack, estado, saves e evolução do motor |
| [docs/DADOS_E_FONTES.md](docs/DADOS_E_FONTES.md) | Fontes consultadas, verificação e direitos dos escudos |
| [docs/AUDITORIA_INICIAL.md](docs/AUDITORIA_INICIAL.md) | Repositório, branch e evidências de acesso |
| [docs/VALIDACAO.md](docs/VALIDACAO.md) | Registro da fundação (etapa 01) |
| [docs/ETAPA_02_UNIVERSO.md](docs/ETAPA_02_UNIVERSO.md) | Escopo e pesquisa do catálogo inicial |
| [docs/VALIDACAO_ETAPA_02.md](docs/VALIDACAO_ETAPA_02.md) | Verificações e limites da versão 0.2 |
| [docs/PESQUISA_SERIE_A_2026.md](docs/PESQUISA_SERIE_A_2026.md) | Resultado dos 19 clubes, fontes, curadoria e lacunas |
| [docs/ETAPA_02B_ELENCOS.md](docs/ETAPA_02B_ELENCOS.md) | Plano da ampliação do catálogo |
| [docs/VALIDACAO_ETAPA_02B.md](docs/VALIDACAO_ETAPA_02B.md) | Verificações da versão 0.2.2 |
| [docs/ETAPA_03_PROPOSTAS.md](docs/ETAPA_03_PROPOSTAS.md) | Regras das propostas simuladas, escopo e verificações |
| [docs/ETAPA_04_TEMPORADA.md](docs/ETAPA_04_TEMPORADA.md) | Calendário, simulação, progressão e salvamento da temporada |
| `src/app/` | Rotas `/`, `/atleta`, `/propostas`, `/temporada`, `/universo`, `/projeto`, layout e CSS |
| `src/domain/career/`, `src/features/career/` | Propostas, primeiro contrato e motor da temporada |
| `src/domain/athlete/` | Schemas e regras puras de atleta |
| `src/features/athlete/` | Criador, central e contexto do perfil |
| `src/infrastructure/storage/` | Adaptador transacional de IndexedDB e testes |
| `src/data/universe.ts` | Escopo das 14 ligas |
| `src/data/world/` | Snapshot real versionado da Série A 2026 |
| `src/domain/world/` | Contratos de dados, validações e consultas puras |
| `src/features/world/` | Explorador de clubes e elencos |
| `scripts/verify-world.mjs` | Verificador de snapshots sem alterar arquivos |

Stack: Next.js, React, TypeScript, Tailwind CSS, Zod, Vitest e IndexedDB via `idb`. As versões estão fixadas no lockfile. Zustand será adotado somente quando o compartilhamento de estado da carreira justificar sua inclusão.

## Relatórios de desenvolvimento

- [Mercado e contratos](docs/MERCADO_DA_CARREIRA.md)
- [Competições e seleções](docs/COMPETICOES.md)
- [Histórico e arquivo da carreira](docs/HISTORICO_DA_CARREIRA.md)
- [Mundo dinâmico](docs/MUNDO_DINAMICO.md)

Os termos de licença do código do projeto ainda dependem de decisão do titular. Nenhum direito de terceiros sobre marcas, dados ou imagens é presumido.

## Revisar um novo snapshot

Execute `npm run data:check -- caminho/para/snapshot.json` para validar um arquivo antes de incluí-lo. O comando apenas lê e verifica; não modifica o arquivo nem importa dados para o save. Após conferir as fontes, mantenha o JSON revisado em `src/data/world/` e atualize a seleção em `current-world.ts` dentro de um commit. A validação estrutural não substitui a pesquisa factual.
