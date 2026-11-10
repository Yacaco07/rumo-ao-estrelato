# Validação da etapa 02 — versão 0.2

Data: 10/11/2026. Repositório exclusivo: `Yacaco07/rumo-ao-estrelato`. Branch: `main`.

## Resultado local

| Verificação | Resultado |
| --- | --- |
| `npm run data:check` | Aprovado: 20 participantes, 25 jogadores listados, 1 relação de elenco e 2 fontes |
| `npm run typecheck` | Aprovado |
| `npm test` | **72 testes aprovados em 6 arquivos** |
| Regressão da fundação | Os 37 testes anteriores continuam aprovados |
| Verificador por linha de comando | Executa fora do diretório do projeto e rejeita arquivo inválido sem modificá-lo |
| `npm run build` | Aprovado: quatro rotas e página de erro geradas |
| Saves | Schema e IndexedDB da fundação preservados; catálogo não modifica perfis |
| Revisão visual em navegador real | Pendente por limitação do serviço de prévia |

O comando agregado `npm run check` concluiu as quatro verificações. Ambiente: Node.js 24.22.1, npm 11.9.0. Nenhuma dependência foi adicionada; o lockfile recebeu somente a versão 0.2.0 do aplicativo.

## Regras verificadas

- Integridade do snapshot real distribuído e preservação de valores desconhecidos.
- Identificadores, nomes e fontes duplicados; clube/competição/jogador sem referência válida.
- Proveniência por campo, escopo da fonte, fonte sem dado declarado e fato sem fonte.
- Consulta posterior ao corte, atualização posterior à consulta, revisão anterior ao corte e temporada divergente.
- Cobertura declarada de participantes e lista de jogadores incompatíveis com os registros.
- Elenco pendente sem falsa contagem zero; camisa repetida dentro do mesmo clube e permitida entre clubes diferentes.
- Camisa/posição desconhecida preservada; categoria ampla não convertida em posição específica do criador.
- Rejeição de campos extras não previstos, URL insegura e liberação indevida de início da carreira.
- Busca sem acentos, filtros combinados, seleção, limpeza e recuperação após nenhum resultado.
- Posições filtradas na relação de elenco, fontes clicáveis e seleção nativa de clube para telas pequenas.

Os testes de UI usam jsdom; eles não comprovam layout, renderização, toque ou comportamento real de Safari/Chrome.

## Revisão dos dados

Os participantes foram conferidos na página oficial da CBF para a Série A 2026. A relação principal publicada pelo Palmeiras fornece 25 nomes, posições e camisas; a seção separada de nove emprestados foi excluída. Fontes e datas estão em [DADOS_E_FONTES.md](DADOS_E_FONTES.md) e no próprio JSON. Não foram importados estatísticas, classificações, fotos ou escudos.

A página do Palmeiras não informa data de atualização nem edição expressa do elenco; ambos os campos da fonte permanecem `null`. Nacionalidades e nascimentos não pesquisados permanecem desconhecidos. Inscrição, contrato, elegibilidade e completude regulatória não foram auditados. A base é um catálogo parcial para consulta: `gameplayReady` e `registrationVerified` continuam falsos.

## Limitação de prévia

A tentativa nesta etapa encerrou com `error: unknown option '--host'`: o serviço gerenciado adiciona opções de outro servidor ao comando Next.js. O diagnóstico permaneceu igual ao da fundação e `sites-preview status` confirmou o serviço parado. Nenhum servidor alternativo, alteração de rede ou modificação artificial do aplicativo foi usado para contornar o ambiente. Não há screenshot nem aprovação visual declarada.

Para a revisão manual em ambiente próprio: executar `npm ci` e `npm run dev`, testar `/universo` em desktop e celular, buscar por “sao paulo”, combinar os filtros, selecionar Palmeiras e filtrar goleiros, abrir as fontes e conferir a navegação ao criador com um perfil já salvo.

## Publicação e próximo aceite

O fluxo publica o plano e a implementação como commits na mesma branch do repositório oficial, usando a conexão GitHub autenticada, SHA esperado e `force: false`. O clone local deve ser sincronizado somente depois de conferir o hash da árvore publicada. O workflow executa `npm ci` e `npm run check` em cada push; consultar o resultado remoto antes da entrega.

A revisão e aprovação deste catálogo precedem a ampliação da pesquisa de elencos. As cinco propostas, contratos e temporadas permanecem fora da etapa. Também permanece pendente a revisão em navegador real quando houver prévia compatível com Next.js.
