# Dados reais, fontes e direitos de uso

## Estado em 10/11/2026

**Nenhum elenco, jogador real, clube ou escudo foi importado nesta etapa.** As 14 ligas exibidas são o escopo solicitado. Atributos-base do criador são parâmetros de jogo definidos pelo projeto.

## Pesquisa inicial

| ID | Fonte primária | Consulta | Uso nesta etapa | Limitação |
| --- | --- | --- | --- | --- |
| CBF-A | [CBF — Série A](https://www.cbf.com.br/futebol-brasileiro/tabelas/campeonato-brasileiro/serie-a) | 10/11/2026 | Localização de fonte oficial de competição | Consulta não equivale a auditoria completa de clubes, regras ou elencos |
| CBF-B | [CBF — Série B 2026](https://www.cbf.com.br/futebol-brasileiro/tabelas/campeonato-brasileiro/serie-b/2026?documento=IMT) | 10/11/2026 | Localização de fonte oficial de competição | Mesma limitação; formato precisa ser verificado por edição |
| EPL-2026 | [Premier League — squad numbers 2026/27](https://www.premierleague.com/en/news/4725682) | 10/11/2026 | Exemplo de fonte oficial com temporada explícita | Artigo de 22/09/2026; publicação anterior não garante elenco atual em novembro |

Nenhum conteúdo dessas páginas foi transformado em rating, salário, duração de contrato ou atribuição de licença. As outras ligas aguardam pesquisa específica em fontes oficiais antes de qualquer importação. Também é necessário verificar termos de acesso e redistribuição: conteúdo público não significa autorização irrestrita de reprodução.

## Registro obrigatório por snapshot

Para cada fonte: ID, URL, responsável/publicador, campos que fundamenta, temporada, data de publicação quando disponível, data de consulta e observações de qualidade. Para cada entidade real: ID estável, nome, país, proveniência por campo, validade temporal e status `pending`, `verified` ou `conflicting`.

Para cada snapshot: versão, data de corte, competições incluídas, cobertura de clubes e jogadores, lacunas, revisor e data da revisão. Uma entidade parcialmente verificada não pode ser apresentada como integralmente atualizada.

1. Pesquisar primeiro liga/federação e página oficial do clube para o elenco.
2. Confirmar temporada, transferências recentes e vínculo; não inferir contrato a partir de escalação.
3. Registrar desconhecidos como `null`; não inventar data de nascimento, valor, salário, nacionalidade ou contrato.
4. Separar fatos verificáveis de parâmetros simulados e atributos de balanceamento.
5. Validar IDs, duplicatas, referências, datas, cobertura e conflitos com Zod e testes.
6. Revisar fontes, termos de uso e direitos de cada ativo antes de liberar o snapshot.

## Escudos

Usar somente ativos com permissão compatível e evidência registrada por arquivo: titular, URL original, licença/autorização, atribuição exigida, data de consulta e eventuais limites. Não baixar automaticamente escudos nem presumir permissão por estarem no site de uma liga. Enquanto a situação não estiver verificada, usar identificação textual; não desenhar escudos falsos como se fossem oficiais.

Não incluir fotos de jogadores. Nenhum escudo acompanha a fundação.

## Universo vivo

Após iniciar uma carreira, transferências, desempenhos, novos atletas e títulos gerados pelo motor são **eventos simulados daquele save**, não fatos reais. O histórico deve identificar a origem e preservar o snapshot inicial. Dados externos novos serão oferecidos para novas carreiras e não sobrescreverão mundos em andamento.
