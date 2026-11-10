# Dados reais, fontes e direitos de uso

## Estado em 10/11/2026

A versão 0.2 contém um primeiro catálogo pesquisado: **20 participantes da Série A 2026 e 25 jogadores da relação principal publicada pelo Palmeiras**, consultados em 10/11/2026. Os outros 19 elencos e as outras 13 ligas aguardam pesquisa. Inscrições e contratos ainda não foram auditados; o snapshot não libera o início da carreira. Nenhum escudo foi importado. Atributos-base do criador continuam parâmetros de jogo, separados dos fatos reais.

## Snapshot atual

Arquivo: `src/data/world/br-serie-a-2026.json`. ID: `br-serie-a-2026-2026-11-10`. Versão: `2026.11.10-01`. Schema: `1`.

| Fonte primária | Consulta | Campos usados | Atualização publicada |
| --- | --- | --- | --- |
| [CBF — Série A 2026](https://www.cbf.com.br/futebol-brasileiro/tabelas/campeonato-brasileiro/serie-a/2026) | 10/11/2026 | Nome dos 20 participantes e temporada | 10/11/2026 |
| [Palmeiras — Futebol Profissional](https://www.palmeiras.com.br/elenco/) | 10/11/2026 | Nome publicado, posição publicada, camisa e presença na seção principal | Não informada; `null` no catálogo |

O site do Palmeiras apresenta nove atletas emprestados em uma seção distinta; eles foram excluídos da relação principal importada. Nomes publicados foram mantidos, com normalização de capitalização. Não foram completados nomes civis, nacionalidades, nascimentos, contratos, salários ou ratings. “Atacante” permanece uma categoria ampla, sem inferir ponta ou centroavante.

Os [termos da CBF](https://www.cbf.com.br/termos-de-uso), consultados em 10/11/2026, reservam direitos de reprodução. O cadastro factual independente não inclui tabelas, classificações, estatísticas, imagens, layouts, textos editoriais ou documentos dessas páginas e não declara licença concedida pelos publicadores. Nenhum ativo de marca está autorizado por esta consulta. Para detalhes e fontes descartadas, consultar [ETAPA_02_UNIVERSO.md](ETAPA_02_UNIVERSO.md).

## Pesquisa inicial da fundação (referências para futuras etapas)

| ID | Fonte primária | Consulta | Uso nesta etapa | Limitação |
| --- | --- | --- | --- | --- |
| CBF-A | [CBF — Série A](https://www.cbf.com.br/futebol-brasileiro/tabelas/campeonato-brasileiro/serie-a) | 10/11/2026 | Localização de fonte oficial de competição | Consulta não equivale a auditoria completa de clubes, regras ou elencos |
| CBF-B | [CBF — Série B 2026](https://www.cbf.com.br/futebol-brasileiro/tabelas/campeonato-brasileiro/serie-b/2026?documento=IMT) | 10/11/2026 | Localização de fonte oficial de competição | Mesma limitação; formato precisa ser verificado por edição |
| EPL-2026 | [Premier League — squad numbers 2026/27](https://www.premierleague.com/en/news/4725682) | 10/11/2026 | Exemplo de fonte oficial com temporada explícita | Artigo de 22/09/2026; publicação anterior não garante elenco atual em novembro |

Nenhuma dessas referências é usada para inventar ratings, salários ou contratos. Série B e Premier League continuam sem importação. As outras ligas aguardam pesquisa específica em fontes oficiais. Conteúdo público não significa autorização irrestrita de reprodução.

## Registro obrigatório por snapshot

Para cada fonte: ID, URL, responsável/publicador, campos que fundamenta, temporada, data de atualização quando disponível, data de consulta e observações de qualidade. Para cada entidade real: ID estável, nome, proveniência por campo, contexto temporal e cobertura explícita. No contrato atual, `pending` significa elenco ainda não pesquisado e `listed` significa relação publicada consultada. Isso não marca toda a entidade como integralmente atualizada. Conflitos devem ser resolvidos e documentados antes da importação; referências e contagens incompatíveis são rejeitadas pelo validador.

Para cada snapshot: versão, data de corte, competições incluídas, cobertura de clubes e jogadores, lacunas, revisor e data da revisão. `reviewedBy` identifica a conferência feita por Codex e a aprovação editorial ainda pendente. A validação estrutural com Zod não comprova a verdade factual: é preciso conferir as fontes. `gameplayReady` e `registrationVerified` continuam falsos nesta etapa.

1. Pesquisar primeiro liga/federação e página oficial do clube para o elenco.
2. Confirmar temporada, transferências recentes e vínculo; não inferir contrato a partir de escalação.
3. Registrar desconhecidos como `null`; não inventar data de nascimento, valor, salário, nacionalidade ou contrato.
4. Separar fatos verificáveis de parâmetros simulados e atributos de balanceamento.
5. Validar IDs, duplicatas, referências, datas, cobertura e conflitos com Zod e testes.
6. Revisar fontes, termos de uso e direitos de cada ativo antes de liberar o snapshot.

## Escudos

Usar somente ativos com permissão compatível e evidência registrada por arquivo: titular, URL original, licença/autorização, atribuição exigida, data de consulta e eventuais limites. Não baixar automaticamente escudos nem presumir permissão por estarem no site de uma liga. Enquanto a situação não estiver verificada, usar identificação textual; não desenhar escudos falsos como se fossem oficiais.

Não incluir fotos de jogadores. Nenhum escudo acompanha as versões 0.1 ou 0.2; `crest` permanece `null`.

## Universo vivo

Após iniciar uma carreira, transferências, desempenhos, novos atletas e títulos gerados pelo motor são **eventos simulados daquele save**, não fatos reais. O histórico deve identificar a origem e preservar o snapshot inicial. Dados externos novos serão oferecidos para novas carreiras e não sobrescreverão mundos em andamento.
