# RUMO AO ESTRELATO

Simulador de carreira de jogador de futebol para navegador. **Versão 0.1: fundação e criação de perfil.**

Repositório oficial e exclusivo: <https://github.com/Yacaco07/rumo-ao-estrelato> · branch `main`.

**Situação desta entrega:** implementação e commits preparados no clone local oficial; envio remoto pendente. Consulte [a validação](docs/VALIDACAO.md). Os comandos de clone abaixo pressupõem que os commits já tenham sido enviados. No checkout preparado ou no pacote de código, comece por `npm ci`.

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
- Páginas de universo planejado e etapas do projeto.

O perfil salvo **ainda não inicia uma carreira**. Propostas, contratos, clubes, elencos reais, escudos, partidas, calendários, transferências e temporadas estão planejados, não implementados. A lista de 14 ligas representa o escopo pedido, sem campeonatos estaduais brasileiros. Nenhum elenco fictício foi apresentado como real.

Há um slot local. O perfil fica associado ao endereço, navegador e dispositivo usados. Limpar os dados do site remove o save. Exportação, sincronização e migrações de carreiras serão implementadas antes de saves longos. As alterações são salvas pelos botões; não há salvamento automático silencioso.

## Verificar

```bash
npm run typecheck
npm test
npm run build
```

Ou `npm run check` para os três passos em sequência. `npm run test:watch` acompanha os testes durante o desenvolvimento. O workflow em `.github/workflows/ci.yml` executa instalação reproduzível e verificações em pushes e pull requests para `main` quando estiver disponível no GitHub.

Os testes incluem limites e conservação dos dez pontos, atributos por posição, identidade, conclusão, recuperação após reabertura, corrupção, versão incompatível, concorrência entre abas, falha de espaço e fluxo do criador. IndexedDB é testado com `fake-indexeddb`; isso não equivale a um teste de navegador real. Consulte os resultados e limites em [VALIDACAO.md](docs/VALIDACAO.md).

## Documentação e arquivos

| Arquivo/diretório | Finalidade |
| --- | --- |
| [docs/PLANO_DO_JOGO.md](docs/PLANO_DO_JOGO.md) | Visão, sistemas, universo, etapas e critérios de aprovação |
| [docs/ARQUITETURA.md](docs/ARQUITETURA.md) | Camadas, stack, estado, saves e evolução do motor |
| [docs/DADOS_E_FONTES.md](docs/DADOS_E_FONTES.md) | Fontes consultadas, verificação e direitos dos escudos |
| [docs/AUDITORIA_INICIAL.md](docs/AUDITORIA_INICIAL.md) | Repositório, branch e evidências de acesso |
| [docs/VALIDACAO.md](docs/VALIDACAO.md) | Resultados de testes e pendências da revisão |
| `src/app/` | Rotas `/`, `/atleta`, `/universo`, `/projeto`, layout e CSS |
| `src/domain/athlete/` | Schemas e regras puras de atleta |
| `src/features/athlete/` | Criador, central e contexto do perfil |
| `src/infrastructure/storage/` | Adaptador transacional de IndexedDB e testes |
| `src/data/universe.ts` | Escopo das ligas, sem base esportiva importada |

Stack: Next.js, React, TypeScript, Tailwind CSS, Zod, Vitest e IndexedDB via `idb`. As versões estão fixadas no lockfile. Zustand será adotado somente quando o compartilhamento de estado da carreira justificar sua inclusão.

## Próximo marco

Revisar e aprovar a fundação. Em seguida, pesquisar e importar um recorte verificável de clubes e elencos, com rastreabilidade de dados e direitos de uso. Expandir liga por liga antes de iniciar o sistema das cinco propostas.

Os termos de licença do código do projeto ainda dependem de decisão do titular. Nenhum direito de terceiros sobre marcas, dados ou imagens é presumido.
