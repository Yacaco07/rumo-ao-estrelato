# Validação da etapa 02B — versão 0.2.1

Data: 10/11/2026. Repositório exclusivo: `Yacaco07/rumo-ao-estrelato`. Branch de trabalho e destino: `main`.

## Resultado local

| Verificação | Resultado |
| --- | --- |
| `npm run data:check` | Aprovado: 20 clubes, 660 nomes, 38 fontes; 18 relações de clubes e duas listas da competição |
| Lacunas preservadas | 152 posições e 262 camisas desconhecidas; nacionalidade e nascimento não preenchidos |
| `npm run typecheck` | Aprovado |
| `npm test` | **89 testes aprovados em 6 arquivos** |
| Verificador após ajuste do resumo | Dois testes do CLI aprovados novamente, incluindo execução fora do diretório e rejeição sem modificar a entrada |
| `npm run build` | Aprovado: `/`, `/atleta`, `/universo`, `/projeto` e página de erro geradas |
| HTML de produção | Conferido: 20 seletores de clube, contagem 660 e tabela inicial do Flamengo; não equivale a teste visual |
| Preservação de dados | Os 25 objetos de jogadores anteriores são idênticos aos do commit-base; IDs preservados |
| Saves | Schema e infraestrutura de IndexedDB não alterados; testes anteriores continuam aprovados |
| Integridade do patch | `git diff --check` sem erros |

Ambiente: Node.js 24.22.1, npm 11.9.0. Nenhuma dependência foi adicionada; a versão do aplicativo e do pacote no lockfile passou de 0.2.0 para 0.2.1. Snapshot `2026.11.10-02`, schema 1.

Os testes adicionais cobrem alcance da lista da competição, compatibilidade dos snapshots anteriores sem `scope`, rejeição de alcance inválido ou de pesquisa pendente, agrupamento de categorias explícitas, camisas conflitantes, decisões de exclusão e consulta de posição desconhecida. Os estados de elenco pendente são testados com fixture, sem tratar um clube real pesquisado como desconhecido.

## Revisão factual

Fontes, datas, contagens anteriores à curadoria, exclusões e limites estão em [PESQUISA_SERIE_A_2026.md](PESQUISA_SERIE_A_2026.md). O JSON contém proveniência por campo. As relações de Athletico e Corinthians são listas da CBF filtradas por clube atual; não são certificadas como elencos profissionais completos. São Paulo, Flamengo e demais relações não receberam posições ou camisas por memória. No Cruzeiro e Fluminense há posições desconhecidas; no Botafogo números de jogos não foram tratados como camisas. Quatro camisas conflitantes do Remo ficaram `null`.

Não houve auditoria integral do BID ou de contratos. `gameplayReady` e `registrationVerified` permanecem falsos. Escudos e fotos continuam ausentes. Pesquisa concluída dos 19 clubes não significa aprovação editorial, completude do universo ou liberação de carreira.

## Revisão visual e CI

A prévia gerenciada já havia falhado na etapa anterior porque seu comando acrescenta `--host` ao Next.js, que rejeita essa opção. Essa limitação continua registrada em [VALIDACAO_ETAPA_02.md](VALIDACAO_ETAPA_02.md). Não foi criada hospedagem, servidor alternativo ou outro projeto para contorná-la. Nesta rodada foram conferidos os componentes em testes e o HTML de produção; revisão visual e interação em navegador real continuam pendentes.

O workflow existente executa instalação pelo lockfile e `npm run check` em pushes de `main`. O resultado remoto do commit publicado pode ser conferido em [GitHub Actions](https://github.com/Yacaco07/rumo-ao-estrelato/actions). Este relatório distingue os resultados locais acima da aprovação editorial do usuário.

## Auditoria de destino

O GitHub conectado confirmou acesso de leitura e escrita (`pull` e `push`) ao repositório oficial, não arquivado, com branch padrão `main`. O origin local aponta para `https://github.com/Yacaco07/rumo-ao-estrelato.git`. Base da alteração: `70c1c77268c63d34897407b57b43f59f9ec7cab4`.

O envio deve preservar essa base, com atualização da referência condicionada ao SHA esperado, sem force. Arquivos temporários da consulta ficaram fora do controle de versão; nenhum token, credencial, HTML de terceiros ou imagem integra a entrega. Não se iniciou o sistema seguinte de carreira.
