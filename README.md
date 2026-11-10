# RUMO AO ESTRELATO

Simulador de carreira de jogador de futebol para navegador. **Versão 0.2.1: criação de perfil e pesquisa dos 20 clubes da Série A.**

Repositório oficial e exclusivo: <https://github.com/Yacaco07/rumo-ao-estrelato> · branch `main`.

**Situação desta entrega:** código e documentação do projeto publicados na branch `main` do repositório oficial. Consulte os resultados dos testes e as pendências de revisão em [VALIDACAO_ETAPA_02B.md](docs/VALIDACAO_ETAPA_02B.md).

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

O projeto ainda não tem hospedagem configurada. GitHub Pages não executa o servidor Next.js com esta configuração; uma eventual publicação será tratada em uma etapa própria.

## O que funciona

- Central inicial com visual preto, branco, cinza e verde-limão, navegação e resumo do perfil salvo.
- Criação em três passos: identidade; posição e atributos; revisão.
- Oito posições, com seis atributos específicos de goleiro ou seis de linha.
- Dez pontos extras, sem ultrapassar o limite ou reduzir a base. Troca de posição com pontos distribuídos exige confirmação para zerá-los.
- Salvamento de rascunho incompleto ou perfil concluído em IndexedDB; conclusão exige identidade válida e exatamente dez pontos.
- Reabertura do perfil, validação de saves, proteção contra sobrescrita por outra aba e exclusão com confirmação.
- Catálogo pesquisado da Série A 2026: 20 clubes e 660 jogadores, com 38 fontes consultadas em 10/11/2026.
- Busca de clubes sem distinção de acentos, filtro por cobertura e posição, seleção de clube e fontes com datas.
- Cobertura explícita: 18 relações de clubes e duas listas da CBF, que podem incluir base. Há 152 posições e 262 camisas a confirmar; as outras 13 ligas permanecem planejadas.
- Snapshot versionado validado por Zod, com referências por campo e verificador de importação.

O perfil salvo **ainda não inicia uma carreira**. O catálogo real é parcial e somente para consulta: uma relação publicada não comprova inscrições ou contratos. Propostas, contratos, escudos, partidas, calendários, transferências e temporadas continuam planejados. O escopo total tem 14 ligas, sem estaduais brasileiros. Dados desconhecidos não são preenchidos com estimativas.

Há um slot local. O perfil fica associado ao endereço, navegador e dispositivo usados. Limpar os dados do site remove o save. Exportação, sincronização e migrações de carreiras serão implementadas antes de saves longos. As alterações são salvas pelos botões; não há salvamento automático silencioso.

## Verificar

```bash
npm run data:check
npm run typecheck
npm test
npm run build
```

Ou `npm run check` para as quatro verificações em sequência. `npm run test:watch` acompanha os testes durante o desenvolvimento. O workflow em `.github/workflows/ci.yml` executa instalação reproduzível e verificações em pushes e pull requests para `main`.

Os testes incluem limites e conservação dos dez pontos, atributos por posição, identidade, conclusão, recuperação após reabertura, corrupção, versão incompatível, concorrência entre abas, falha de espaço e fluxo do criador. IndexedDB é testado com `fake-indexeddb`; isso não equivale a um teste de navegador real. Consulte os resultados e limites em [VALIDACAO_ETAPA_02B.md](docs/VALIDACAO_ETAPA_02B.md).

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
| [docs/VALIDACAO_ETAPA_02B.md](docs/VALIDACAO_ETAPA_02B.md) | Verificações da versão 0.2.1 |
| `src/app/` | Rotas `/`, `/atleta`, `/universo`, `/projeto`, layout e CSS |
| `src/domain/athlete/` | Schemas e regras puras de atleta |
| `src/features/athlete/` | Criador, central e contexto do perfil |
| `src/infrastructure/storage/` | Adaptador transacional de IndexedDB e testes |
| `src/data/universe.ts` | Escopo das 14 ligas |
| `src/data/world/` | Snapshot real versionado da Série A 2026 |
| `src/domain/world/` | Contratos de dados, validações e consultas puras |
| `src/features/world/` | Explorador de clubes e elencos |
| `scripts/verify-world.mjs` | Verificador de snapshots sem alterar arquivos |

Stack: Next.js, React, TypeScript, Tailwind CSS, Zod, Vitest e IndexedDB via `idb`. As versões estão fixadas no lockfile. Zustand será adotado somente quando o compartilhamento de estado da carreira justificar sua inclusão.

## Próximo marco

Revisar as lacunas documentadas, conferir inscrições, distinguir profissional/base nas listas da competição e completar os dados necessários à simulação. A revisão visual em navegador real continua pendente. Expandir com fontes e direitos de uso registrados antes de iniciar o sistema das cinco propostas.

Os termos de licença do código do projeto ainda dependem de decisão do titular. Nenhum direito de terceiros sobre marcas, dados ou imagens é presumido.

## Revisar um novo snapshot

Execute `npm run data:check -- caminho/para/snapshot.json` para validar um arquivo antes de incluí-lo. O comando apenas lê e verifica; não modifica o arquivo nem importa dados para o save. Após conferir as fontes, mantenha o JSON revisado em `src/data/world/` e atualize a seleção em `current-world.ts` dentro de um commit. A validação estrutural não substitui a pesquisa factual.
