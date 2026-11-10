# Pesquisa da Série A 2026 — outros 19 clubes

Data de consulta e corte: **10/11/2026**. Snapshot `2026.11.10-02`, aplicativo `0.2.1`. Repositório `Yacaco07/rumo-ao-estrelato`, branch `main`.

## Resultado e alcance

**635 jogadores adicionados**, preservando os 25 registros e IDs do Palmeiras: **660 nomes em 20 clubes**, com **38 fontes** no snapshot. Os 19 clubes solicitados foram pesquisados. São 18 relações de clubes e duas relações de atletas da competição, para Athletico e Corinthians. Pesquisar uma relação não comprova elenco principal completo, inscrição, contrato ou disponibilidade.

**152 posições e 262 camisas continuam desconhecidas**; nacionalidade e nascimento não foram importados nesta rodada. Campos sem confirmação ficam `null`, também sem fonte no respectivo campo. O catálogo permanece somente para consulta (`gameplayReady: false` e `registrationVerified: false`).

## Método

1. Consulta à relação de participantes da CBF e às páginas oficiais dos clubes, incluindo os dados públicos usados pelos próprios filtros de elenco.
2. Conferência das relações de atletas da Série A na CBF: o campo “Clube Atual” é distinto da participação histórica na competição. Uma linha na tabela não é prova de inscrição ativa.
3. Curadoria manual das divergências encontradas. Apelido igual não foi tratado como identidade global; ausência na CBF não prova saída. Casos não resolvidos foram excluídos do recorte ou mantidos como campos desconhecidos, com decisão registrada abaixo. Não foi feita auditoria exaustiva de contratos ou do BID.
4. Importação de nomes, rótulos explícitos de posição e camisas publicadas. Valores de jogos, gols, idade ou ordem do carrossel nunca foram convertidos em campos não publicados.
5. Validação estrutural e testes. A validação automática não substitui conferência factual.

## Os 19 clubes pesquisados

“Publicados” conta os registros da relação consultada antes da curadoria, inclusive comissão quando mencionada; nas duas fontes da CBF conta linhas históricas. “Importados” é o número no recorte, também usado por `sourceListedCount`. Não significa tamanho definitivo do elenco. Todas as fontes abaixo foram consultadas em 10/11/2026; não havia data explícita de atualização da lista, portanto `updatedOn` permanece `null`.

| Clube | Alcance | Publicados | Importados | Posição pendente | Camisa pendente | Fonte principal |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Flamengo | Relação do clube | 27 | 27 | 0 | 0 | [Consultar](https://www.flamengo.com.br/futebol/elenco) |
| Cruzeiro | Relação do clube | 34 | 34 | 33 | 0 | [Consultar](https://www.cruzeiro.com.br/categoria/masculino?player=a0xSG0000072eN7YAI&tab=elenco) |
| Fluminense | Relação do clube | 31 | 31 | 31 | 0 | [Consultar](https://www.fluminense.com.br/o-time/futebol/profissional) |
| Athletico Paranaense | Lista CBF; pode incluir base | 55 | 49 | 49 | 49 | [Consultar](https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026/20052) |
| Bahia | Relação do clube | 29 | 29 | 0 | 0 | [Consultar](https://www.esporteclubebahia.com.br/elenco/masculino/) |
| Atlético Mineiro | Relação do clube | 32 | 32 | 0 | 0 | [Consultar](https://atletico.com.br/futebol/masculino/elenco/) |
| Red Bull Bragantino | Relação do clube | 31 | 31 | 0 | 0 | [Consultar](https://www.redbullbragantino.com/br-pt/jogadores) |
| Santos FC | Relação do clube | 34 | 34 | 0 | 34 | [Consultar](https://www.santosfc.com.br/masculino/) |
| São Paulo | Relação do clube | 38 | 38 | 0 | 0 | [Consultar](https://www.saopaulofc.net/esporte/futebol-masculino-profissional/) |
| Botafogo | Relação do clube | 32 | 32 | 0 | 32 | [Consultar](https://botafogo.com.br/elenco/futebol) |
| Coritiba SAF | Relação do clube | 34 | 34 | 0 | 0 | [Consultar](https://coritiba.com.br/elenco) |
| Vasco da Gama SAF | Relação do clube | 33 | 33 | 0 | 0 | [Consultar](https://vasco.com.br/elenco) |
| Mirassol | Relação do clube | 40 | 33 | 0 | 33 | [Consultar](https://mirassolfc.com.br/blogs/elenco) |
| Vitória | Relação do clube | 42 | 42 | 0 | 42 | [Consultar](https://ecvitoria.com.br/elenco/masculino/) |
| Internacional | Relação do clube | 24 | 24 | 0 | 0 | [Consultar](https://sc.internacional.com.br/equipes/masculino) |
| Corinthians | Lista CBF; pode incluir base | 40 | 39 | 39 | 39 | [Consultar](https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026/20001) |
| Grêmio | Relação do clube | 33 | 29 | 0 | 29 | [Consultar](https://gremio.net/futebol/) |
| Remo | Relação do clube | 30 | 30 | 0 | 4 | [Consultar](https://clubedoremo.com.br/elenco) |
| Chapecoense | Relação do clube | 34 | 34 | 0 | 0 | [Consultar](https://chapecoense.com/elenco/) |

O Palmeiras permanece com seus 25 nomes da [seção principal oficial](https://www.palmeiras.com.br/elenco/), sem os nove empréstimos da seção separada. Sua relação e IDs não foram substituídos.

## Decisões por clube

### Flamengo

Relação canônica de 27 atletas; grupos obtidos dos dados públicos do próprio filtro. Não utilizada página de homologação.

Conferência adicional: [atletas da competição na CBF](https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026/20016).

### Cruzeiro

34 nomes e camisas na seção “ver outros jogadores” da página oficial, consultada pelo índice de pesquisa. Posição explícita apenas para Lucas Villalba; as demais continuam desconhecidas. Não usada numeração de guias antigos.

Conferência adicional: [atletas da competição na CBF](https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026/59849).

### Fluminense

31 nomes e camisas no carrossel oficial. O carrossel não publica posição; esse campo fica desconhecido, sem inferir pela ordem.

Conferência adicional: [atletas da competição na CBF](https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026/20014).

### Athletico Paranaense

Relação da CBF filtrada por Clube Atual = Athletico Paranaense, com 49 nomes. Pode incluir base e atletas fora do grupo principal. Isaac Rodrigues de Lima excluído por dois clubes atuais incompatíveis na própria fonte. Posições e camisas não publicadas nessa lista.

Conferência adicional: [atletas da competição na CBF](https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026/20052).

### Bahia

Relação do clube com 29 nomes consultada em 10/11/2026. Campos não publicados ficam desconhecidos. Inscrições e contratos não verificados.

Conferência adicional: [atletas da competição na CBF](https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026/61377).

### Atlético Mineiro

Relação do clube com 32 nomes consultada em 10/11/2026. Campos não publicados ficam desconhecidos. Inscrições e contratos não verificados.

Conferência adicional: [atletas da competição na CBF](https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026/62194).

### Red Bull Bragantino

31 atletas nos sete filtros públicos da página oficial, sem paginação restante. Grupo de volantes vazio; os oito meio-campistas estão explicitamente categorizados como “Meio-campo”. Artigo de julho não usado como lista atual.

Conferência adicional: [atletas da competição na CBF](https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026/20007).

### Santos FC

Relação do clube com 34 nomes consultada em 10/11/2026. Campos não publicados ficam desconhecidos. Inscrições e contratos não verificados.

Conferência adicional: [atletas da competição na CBF](https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026/20008).

### São Paulo

Relação do clube com 38 nomes consultada em 10/11/2026. Campos não publicados ficam desconhecidos. Inscrições e contratos não verificados.

Conferência adicional: [atletas da competição na CBF](https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026/20005).

### Botafogo

32 nomes civis e posições no elenco oficial. Números de JOGOS não são camisas e não foram importados. Camisas desconhecidas.

Conferência adicional: [atletas da competição na CBF](https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026/60175).

### Coritiba SAF

34 atletas do Masculino Profissional, pelo endpoint público que alimenta o elenco oficial. Excluídas categorias de base e comissão técnica.

Conferência adicional: [atletas da competição na CBF](https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026/61590).

Dados públicos usados pelo próprio site: <https://fancontentapi.fanbase.com.br/api/owner/54/squads>. Foi selecionado apenas o grupo profissional masculino; sem copiar imagens, comissão, categorias de base, ídolos ou outros times.

### Vasco da Gama SAF

33 atletas do Profissional Masculino, pelo endpoint público que alimenta o elenco oficial. Utilizada posição individual, sem deduzir pelo filtro da página.

Conferência adicional: [atletas da competição na CBF](https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026/60646).

Dados públicos usados pelo próprio site: <https://fancontentapi.fanbase.com.br/api/owner/297/squads>. Foi selecionado apenas o grupo profissional masculino; sem copiar imagens, comissão, categorias de base, ídolos ou outros times.

### Mirassol

Página publica 39 atletas e um técnico. Importados 33 atletas após excluir comissão e seis nomes com divergência de clube atual na CBF; detalhes no relatório. Camisas não publicadas.

Conferência adicional: [atletas da competição na CBF](https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026/20385).

| Nome publicado | Decisão |
| --- | --- |
| Rafael Guanaes | Excluído do recorte: Comissão técnica, não é jogador. |
| Rodrigues | Excluído do recorte: CBF informa KALAMATA FC; vínculo atual não resolvido pela página do clube. |
| Gabriel Pires | Excluído do recorte: CBF informa Juventude. |
| Nathan Fogaça | Excluído do recorte: CBF informa Fortaleza SAF. |
| Galeano | Excluído do recorte: CBF informa Remo, também listado no site do Remo. |
| Galdino | Excluído do recorte: CBF informa Vila Nova. |
| Tiquinho Soares | Excluído do recorte: CBF informa Botafogo, confirmado pelo anúncio de retorno e pelo elenco do Botafogo. |

### Vitória

Relação do clube com 42 nomes consultada em 10/11/2026. Campos não publicados ficam desconhecidos. Inscrições e contratos não verificados.

Conferência adicional: [atletas da competição na CBF](https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026/20018).

### Internacional

Relação do clube com 24 nomes consultada em 10/11/2026. Campos não publicados ficam desconhecidos. Inscrições e contratos não verificados.

Conferência adicional: [atletas da competição na CBF](https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026/20011).

### Corinthians

39 nomes da CBF com Clube Atual = Corinthians, excluindo Cacá (Vitória). A relação pode incluir base e não certifica o elenco principal completo. Site do clube retornou 403. Posições e camisas não publicadas nessa lista.

Conferência adicional: [atletas da competição na CBF](https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026/20001).

### Grêmio

Página publica 33 atletas. Importados 29 após excluir Viery, Gabriel Mec, Monsalve e Leonel Pérez, listados pela CBF em outros clubes. Camisas não publicadas. Decisões e anúncios no relatório.

Conferência adicional: [atletas da competição na CBF](https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026/20013).

| Nome publicado | Decisão |
| --- | --- |
| Viery | Excluído do recorte: CBF informa Fiorentina; comunicado oficial confirma transferência. |
| Gabriel Mec | Excluído do recorte: CBF informa Porto; comunicado oficial confirma transferência. |
| Monsalve | Excluído do recorte: CBF informa Estudiantes; anúncio do Estudiantes confirma empréstimo. |
| Leonel Pérez | Excluído do recorte: CBF informa Racing; não há confirmação atual na página de elenco do Grêmio. |

### Remo

30 nomes. A fonte atribui 02 a João Lucas e Matheus Alexandre, e 15 a Leonel Picco e Vitor Bueno; as quatro camisas ficam desconhecidas. Mayk mantido conforme elenco e anúncio oficial de 27/03/2026, apesar de divergência histórica na CBF.

Conferência adicional: [atletas da competição na CBF](https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026/20022).

| Atleta | Camisa publicada em conflito | Valor importado |
| --- | ---: | --- |
| João Lucas | 02 | `null` |
| Leonel Picco | 15 | `null` |
| Matheus Alexandre | 02 | `null` |
| Vitor Bueno | 15 | `null` |

### Chapecoense

Relação do clube com 34 nomes consultada em 10/11/2026. Campos não publicados ficam desconhecidos. Inscrições e contratos não verificados.

Conferência adicional: [atletas da competição na CBF](https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026/20086).

## Divergências e anúncios de apoio

| Caso | Evidência oficial consultada | Tratamento |
| --- | --- | --- |
| Tiquinho no Mirassol | [Botafogo: retorno](https://botafogo.com.br/noticias/tiquinho-soares-e-fogo) e [perfil atual](https://www.botafogo.com.br/elenco/futebol/tiquinho-soares), além da CBF | Excluído do Mirassol; preservado no Botafogo com o nome civil publicado |
| Viery no Grêmio | [Comunicado oficial de 01/07/2026](https://portal.gremio.net/noticias/comunicado-viery-01-07-2026), além da CBF | Excluído da relação antiga do Grêmio |
| Gabriel Mec no Grêmio | [Comunicado oficial de 02/09/2026](https://portal.gremio.net/noticias/comunicado---gabriel-mec-02-09-2026), além da CBF | Excluído da relação antiga do Grêmio |
| Monsalve no Grêmio | [Anúncio do Estudiantes](https://estudiantesdelaplata.com/monsalve-tercera-cara-nueva/), além da CBF | Excluído da relação antiga do Grêmio |
| Mayk com indicação histórica de Grêmio na CBF | [Anúncio do Remo de 27/03/2026](https://www.clubedoremo.com.br/noticias/clube-do-remo-anuncia-oficialmente-o-lateral-mayk), nome civil coincidente e elenco atual do Remo | Mantido no Remo; a relação histórica da CBF não prevaleceu automaticamente sobre o anúncio e a relação do destino |
| Isaac Rodrigues de Lima na CBF | [Tabela do Athletico](https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026/20052) publica o mesmo nome com Athletico e Maccabi Netanya como clube atual | Excluído até resolver o conflito; nenhum clube escolhido por suposição |

Para as demais divergências do Mirassol e para Leonel Pérez, a exclusão é conservadora diante do campo de clube atual da CBF. Não se afirma ter auditado o contrato ou a transferência definitiva. Não foram criados registros de empréstimos ou contratos no jogo.

Nas listas de Athletico e Corinthians entraram apenas nomes civis distintos cujo campo Clube Atual corresponde ao clube, sem conflito interno: 49 e 39, respectivamente. Cacá foi excluído do Corinthians porque a própria CBF informa Vitória. O site do Athletico e a rota de elenco do Corinthians retornaram 403 nesta consulta; a busca dirigida nos domínios oficiais também não forneceu uma relação principal completa. O fallback é explicitamente uma lista da competição, não um elenco principal validado.

## Reprodução da consulta de dados públicos

Vasco e Coritiba usam os endpoints acima, descobertos nos arquivos públicos carregados pelos sites oficiais. Nenhuma autenticação, sessão privada ou acesso administrativo foi utilizado.

No Bragantino, a página oficial declara sete filtros; seus endpoints públicos foram consultados com a mesma configuração da página. Todos retornaram `hasNext: false`; o filtro Volantes retornou zero e a categoria Meio-campistas retornou oito atletas com rótulo explícito “Meio-campo”. O artigo geral de 27/07/2026 ficou apenas como referência de pesquisa e não fundamenta a relação atual. Endpoints utilizados:

- [Goleiros](https://www.redbullbragantino.com/v3/api/graphql/v1/v3/feed/pt-BR?filter[type]=person-profiles&filter[relationships.tags][and]=rrn:content:tags:cd199fed-84e3-48f9-b2f7-74d256c50fd6:en-INT,rrn:content:tags:849fbae7-0fd7-45b7-b125-15e15fab9a15:en-INT&sort=athleteNumber&rb3Schema=v1:cardList&rb3Locale=br-pt)
- [Zagueiros](https://www.redbullbragantino.com/v3/api/graphql/v1/v3/feed/pt-BR?filter[type]=person-profiles&filter[relationships.tags][and]=rrn:content:tags:d0637f97-18c4-447c-a66b-ac4cdf0c5ac8:en-INT,rrn:content:tags:849fbae7-0fd7-45b7-b125-15e15fab9a15:en-INT&sort=athleteNumber&rb3Schema=v1:cardList&rb3Locale=br-pt)
- [Laterais-direitos](https://www.redbullbragantino.com/v3/api/graphql/v1/v3/feed/pt-BR?filter[type]=person-profiles&filter[relationships.tags][and]=rrn:content:tags:57da9964-cc1c-42c6-9389-769ad019ce30:en-INT,rrn:content:tags:849fbae7-0fd7-45b7-b125-15e15fab9a15:en-INT&sort=athleteNumber&rb3Schema=v1:cardList&rb3Locale=br-pt)
- [Laterais-esquerdos](https://www.redbullbragantino.com/v3/api/graphql/v1/v3/feed/pt-BR?filter[type]=person-profiles&filter[relationships.tags][and]=rrn:content:tags:e659280b-3dad-4a6e-b1b1-eea98ef9d4a4:en-INT,rrn:content:tags:849fbae7-0fd7-45b7-b125-15e15fab9a15:en-INT&sort=athleteNumber&rb3Schema=v1:cardList&rb3Locale=br-pt)
- [Volantes](https://www.redbullbragantino.com/v3/api/graphql/v1/v3/feed/pt-BR?filter[type]=person-profiles&filter[relationships.tags][and]=rrn:content:tags:88c86a27-99bd-40cb-b205-0aa9d4dec7ed,rrn:content:tags:849fbae7-0fd7-45b7-b125-15e15fab9a15:en-INT&sort=athleteNumber&rb3Schema=v1:cardList&rb3Locale=br-pt)
- [Meio-campistas](https://www.redbullbragantino.com/v3/api/graphql/v1/v3/feed/pt-BR?filter[type]=person-profiles&filter[relationships.tags][and]=rrn:content:tags:c67edbfa-10de-4908-9589-4572e387d42f,rrn:content:tags:849fbae7-0fd7-45b7-b125-15e15fab9a15:en-INT&sort=athleteNumber&rb3Schema=v1:cardList&rb3Locale=br-pt)
- [Atacantes](https://www.redbullbragantino.com/v3/api/graphql/v1/v3/feed/pt-BR?filter[type]=person-profiles&filter[relationships.tags][and]=rrn:content:tags:5c772883-3db1-44b5-9bd0-2c9e2115e1b5,rrn:content:tags:849fbae7-0fd7-45b7-b125-15e15fab9a15:en-INT&sort=athleteNumber&rb3Schema=v1:cardList&rb3Locale=br-pt)

No Flamengo, a página canônica inclui os 27 nomes nos dados públicos dos filtros. A limitação anterior de leitura de apenas goleiros foi superada; a página de homologação continua excluída. No Cruzeiro, o índice de pesquisa devolveu a seção completa de 34 outros jogadores da página oficial, enquanto o acesso direto devolveu o shell JavaScript. Esse modo de consulta é uma limitação, por isso a atualização da lista não foi inventada e só a posição explícita de Lucas Villalba foi incorporada. No Fluminense, o carrossel publica nomes e camisas sem posição; não se inferiu função pela ordem.

## Direitos e pendências

Acesso público não concede licença de imagens. Só fatos foram reorganizados no cadastro; não se incorporaram fotos, escudos, textos editoriais, páginas HTML ou layouts de terceiros. `crest` continua `null`. As permissões dos escudos continuam pendentes.

Antes das cinco propostas, conferir inscrição, elegibilidade, distinção profissional/base, lacunas de posição e demais campos necessários às regras. As outras 13 ligas continuam sem importação. Esta pesquisa não habilita contratos, partidas ou temporadas.
