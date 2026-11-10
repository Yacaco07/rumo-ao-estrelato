# Arquitetura técnica

## Decisões da fundação

- **Next.js App Router + React + TypeScript estrito:** rotas e páginas no servidor; interações e IndexedDB em componentes cliente. Regras do domínio não dependem de React nem do navegador.
- **Tailwind CSS:** tokens visuais em CSS e utilitários. Tipografia de sistema para não depender de download de fontes em tempo de build.
- **Zod:** validação na entrada do formulário e na leitura/escrita de saves. TypeScript sozinho não valida dados persistidos.
- **IndexedDB via idb:** adaptador isolado, gravação transacional, envelope com `schemaVersion`, datas ISO e tipo de documento. Abertura da conexão só no cliente.
- **Vitest + Testing Library + fake-indexeddb:** regras, transições e integração de persistência; o substituto de IndexedDB não substitui revisão em navegador real.
- **Zustand:** adiado. O estado atual cabe no criador e em um contexto de perfil salvo. Adotar quando múltiplos sistemas precisarem compartilhar um estado de carreira, mantendo o motor separado da store.
- **Sem backend obrigatório nesta etapa.** Sem autenticação, pagamentos, telemetria ou chaves de API no cliente. Integrações e hospedagem serão decididas separadamente.

## Organização implementada

```text
src/
  app/                     rotas, layout e estilos globais
  components/              shell, identidade e elementos compartilhados
  features/athlete/        criador e estado de perfil salvo
  domain/athlete/          schemas, posições e regras puras
  data/                    escopo das ligas, sem elencos inventados
  infrastructure/storage/  adaptador IndexedDB
  test/                    configuração de testes
docs/                      produto, arquitetura, fontes, auditoria e validação
```

Direção de dependência: interface → casos de uso/regras → contratos. Infraestrutura implementa persistência e valida seus limites. O domínio não importa componentes ou IndexedDB.

## Modelo da etapa 01

`AthleteDraft`: identidade, posição, distribuição de pontos. `SavedAthlete`: envelope versionado com ID fixo do único slot inicial, estado `draft` ou `ready`, datas de criação/atualização e perfil validado.

O total exibido é sempre calculado como base da posição + pontos extras; não persistir dois totais concorrentes. Cada ponto é um inteiro não negativo. A soma não passa de 10. Concluir exige soma 10 e identidade válida. Rascunho aceita nome vazio e pontos restantes, mas não aceita atributos de outra posição. Trocar de posição reinicia extras; cancelar a confirmação preserva o estado.

Uma gravação só informa sucesso após concluir a transação. Erros de leitura, indisponibilidade, versão desconhecida e corrupção ficam visíveis. O aplicativo não apaga nem substitui automaticamente um save ilegível. Exclusão intencional exige confirmação no próprio aplicativo. A gravação concorrente entre abas compara uma `revision` inteira dentro da transação de leitura/escrita; somente a revisão esperada pode substituir ou excluir o slot. Conflitos pedem a recarga do perfil. Datas de atualização não são usadas como controle de concorrência.

## Arquitetura futura, ainda não implementada

Separar `world` (snapshot inicial verificado), `career` (atleta controlado), `contracts`, `calendar`, `match-engine`, `competitions`, `transfers`, `national-teams`, `awards` e `history`. Criar módulos apenas quando a respectiva etapa começar, evitando pastas vazias e serviços fictícios.

Cada sessão deve fixar `worldVersion`, `rulesVersion`, `schemaVersion`, semente de aleatoriedade e relógio de simulação. Não consultar dados vivos durante a carreira: importar um snapshot revisado. Atualizações reais não alteram retroativamente saves existentes.

O motor futuro recebe estado, comando e fonte de aleatoriedade; devolve novo estado e eventos. Datas reais e `Math.random()` não entram diretamente nas regras. Rodadas e temporadas longas devem rodar em Web Worker quando medições justificarem. IndexedDB evolui com migrações explícitas e exportação antes de alterações destrutivas.

## Limites

Um slot local de perfil, sem sincronização entre dispositivos, exportação ou migração de carreira nesta etapa. O catálogo da etapa 02 é somente para consulta e não altera o perfil persistido. Sem motor de partidas ou início de carreira.

## Etapa 02 — catálogo real

`src/domain/world/world-schema.ts` define e valida o contrato independente de React e do navegador. `world-queries.ts` consulta sem modificar a base. `src/data/world/` contém o JSON versionado e sua validação na entrada do aplicativo; `src/features/world/` apresenta a consulta.

Cada snapshot informa ID, versão, data de corte, revisor e fontes por campo. A competição traz uma contagem declarada dos participantes. O status de um elenco é `pending` (quantidade desconhecida) ou `listed` (relação publicada consultada, com contagem verificável); nenhum deles comprova inscrição ou contrato. `gameplayReady` e `registrationVerified` só aceitam `false` nesta etapa.

Jogadores têm IDs do projeto que não dependem do clube e permanecem estáveis em atualizações. Posição ampla publicada e categoria de apresentação são distintas das posições específicas do criador. A normalização de “Atacante” para o grupo `forward` não define ponta ou centroavante. Campos biográficos sem fonte ficam `null`.

O verificador `npm run data:check` lê o JSON sem alterá-lo, rejeitando referências inválidas, IDs/nomes repetidos, camisas duplicadas dentro do clube, datas incoerentes e divergências de cobertura. O CLI usa a execução nativa de TypeScript do Node.js 24. A mesma validação roda no build e na suíte. Nenhuma consulta externa ocorre no jogo.

A versão do snapshot é independente da versão do aplicativo e do schema do perfil. IndexedDB continua na versão existente e os saves da fundação não recebem alterações. Congelar uma versão de mundo dentro de uma carreira permanece uma etapa futura.

## Referências técnicas

Consultadas em 10/11/2026:

- <https://nextjs.org/docs/app/getting-started/installation>
- <https://tailwindcss.com/docs/installation/framework-guides/nextjs>
- <https://zod.dev/>
- <https://vitest.dev/guide/>
- <https://github.com/actions/checkout/releases/tag/v7.0.1>
- <https://github.com/actions/setup-node/releases/tag/v7.1.0>

As versões efetivas estão fixadas em `package.json` e `package-lock.json`. O ambiente suportado do projeto é Node.js 24 LTS.
