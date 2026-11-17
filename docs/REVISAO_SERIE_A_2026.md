# Revisão de posições e camisas da Série A 2026

Consulta concluída em 17/11/2026. Catálogo `2026.11.17-01`, aplicativo 0.2.2. A revisão partiu da [base publicada em 10/11](PESQUISA_SERIE_A_2026.md).

| Campo | Base de 10/11 | Revisão |
| --- | ---: | ---: |
| Clubes | 20 | 20 |
| Jogadores | 660 | 659 |
| Posições a confirmar | 152 | 0 |
| Camisas confirmadas para o elenco | 398 | 646 |
| Jogadores com camisa documentada em partida e atribuição atual a confirmar | 0 | 13 |
| Jogadores sem evidência de número | 262 | 0 |

A revisão preencheu 152 posições e 248 camisas de elenco. A saída de Willian do Grêmio foi confirmada após identificar o atleta no perfil oficial. Os 659 jogadores restantes mantêm seus identificadores. [Perfil no Grêmio](https://gremio.net/futebol/perfil/944) · [Rescisão](https://ge.globo.com/rs/futebol/times/gremio/noticia/2026/08/29/willian-assina-rescisao-com-o-gremio-e-se-despede-nas-redes-sociais.ghtml)

As 31 posições do Fluminense vêm das fichas individuais do clube. Para Cruzeiro, foi usada a ficha oficial disponível e a relação do FotMob. Fichas da Série A prevaleceram nas divergências de camisa quando a identidade do atleta estava clara. O Transfermarkt complementou casos como as posições de Tchoca e Breno Bidon e as camisas de Claudinho e Pavón. Cada campo tem sua fonte no catálogo. [Elenco do Fluminense](https://www.fluminense.com.br/o-time/futebol/profissional) · [Transfermarkt de Breno Bidon](https://www.transfermarkt.com.br/breno-bidon/profil/spieler/1029227)

## As 15 camisas pesquisadas neste fechamento

| Clube | Atleta | Camisa | Evidência |
| --- | --- | ---: | --- |
| Vitória | Davi | 42 | [Numeração fixa de 2026](https://ge.globo.com/ba/futebol/times/vitoria/noticia/2026/01/30/com-volta-da-camisa-9-vitoria-divulga-numeracao-fixa-da-temporada-2026.ghtml) |
| Vitória | Andrei | 53 | [Numeração fixa de 2026](https://ge.globo.com/ba/futebol/times/vitoria/noticia/2026/01/30/com-volta-da-camisa-9-vitoria-divulga-numeracao-fixa-da-temporada-2026.ghtml) |
| Athletico | Nicolás Azambuja | 7 | [Copa Paraná, 16/11](https://federacaopr.com.br/download/sumula/2553/) |
| Athletico | Lucas Marezi | 22 | [Copa Paraná, 16/11](https://federacaopr.com.br/download/sumula/2553/) |
| Athletico | Fábio Lucas | 3 | [Copa Paraná, 16/11](https://federacaopr.com.br/download/sumula/2553/) |
| Athletico | Murilo Camargo | 3 | [Brasileiro Sub-17, 17/06](https://www.cbf.com.br/futebol-brasileiro/jogos/campeonato-brasileiro/sub-17/2026/athletico-paranaense-x-atletico-goianiense-saf/834469?view=escalacao) |
| Athletico | Kauan Stabelini | 19 | [Copa Paraná, 16/11](https://federacaopr.com.br/download/sumula/2553/) |
| Athletico | Guilherme Back | 10 | [Copa Paraná, 16/11](https://federacaopr.com.br/download/sumula/2553/) |
| Athletico | Rhichey Rhustton | 20 | [Copa Paraná, 16/11](https://federacaopr.com.br/download/sumula/2553/) |
| Athletico | Ruan Bayer | 20 | [Copa Paraná, 03/11](https://federacaopr.com.br/download/sumula/2513/) |
| Athletico | Kauê Vinícius | 20 | [Paranaense Sub-20, 26/03](https://federacaopr.com.br/download/sumula/1165/) |
| Athletico | Arthur Sehn | 12 | [Brasileiro Sub-17, 17/06](https://www.cbf.com.br/futebol-brasileiro/jogos/campeonato-brasileiro/sub-17/2026/athletico-paranaense-x-atletico-goianiense-saf/834469?view=escalacao) |
| Athletico | Kayke Evaristo | 17 | [Copa Paraná, 16/11](https://federacaopr.com.br/download/sumula/2553/) |
| Athletico | Ítalo Laudelino | 25 | [Copa Paraná, 03/11](https://federacaopr.com.br/download/sumula/2513/) |
| Remo | João Lucas | 2 | [Série A, 15/03](https://www.cbf.com.br/futebol-brasileiro/jogos/campeonato-brasileiro/serie-a/2026/coritiba-saf-x-remo/831946?view=escalacao) |

Matheus Alexandre aparece com a 2 em ficha posterior da Série A, que também registra Leonel Picco (14) e Vitor Bueno (15). Por isso a camisa de João Lucas aparece com a data da partida. Os 12 registros do Athletico, provenientes de outros torneios ou categorias, também exibem a competição e a data. [Palmeiras x Remo de 05/11](https://www.cbf.com.br/futebol-brasileiro/jogos/campeonato-brasileiro/serie-a/2026/palmeiras-x-remo/832224?view=escalacao)

O campo opcional `shirtObservation` guarda essas evidências. O número exibido como camisa do elenco requer evidência própria e continua único por clube. As súmulas locais serviram como fontes de pesquisa. O universo jogável segue com o recorte de campeonatos especificado no plano.

As relações de Athletico e Corinthians vieram da tabela de atletas da CBF e podem incluir base. As fontes sustentam a informação registrada e seu contexto. A revisão de inscrição vigente ainda está pendente. A página Universo mostra as 13 observações e links das fontes.

## Validação

`npm run check` passou na verificação dos dados, TypeScript, 89 testes e build. Os testes da versão 0.2.2 verificam o registro de numeração do Remo no catálogo. A versão 0.3.0 acrescenta um teste da exibição da camisa observada e da situação no elenco. Revisão visual em navegador real pendente.
