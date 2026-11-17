# Parte 8 — Competições da carreira

## Dados

O catálogo da Série A preserva seus 20 clubes, 659 atletas e fontes por campo. A relação suplementar registra 238 participantes em 13 ligas. Cada lista contém edição, origem e data de consulta. As ligas adicionais têm cobertura de participantes. Os elencos e vínculos ainda aguardam pesquisa. Nenhum placar, tabela histórica, escudo ou foto foi importado para a simulação.

As listas de Brasil e Argentina usam as publicações da CBF e da LPF. As cinco ligas europeias usam os clubes extraídos dos calendários OpenFootball de 2026/27. No Japão e na Coreia foram usadas as tabelas da liga. As outras fontes asiáticas estão registradas por competição. [Relação de participantes e fontes](../src/data/world/competition-members-2026.json)

## Motor

- **Brasil:** Séries A e B simultâneas, ida e volta, 20 clubes em cada tabela. A edição vira após os playoffs da Série B. Sobem os dois primeiros e os dois vencedores dos cruzamentos 3º × 6º e 4º × 5º. Se o agregado empatar, prevalece a posição. Caem quatro clubes da Série A. O atleta acompanha o clube mesmo quando a divisão muda. Há Copa do Brasil e Supercopa do Brasil.
- **Argentina:** Apertura e Clausura com zonas de participantes reais, eliminatórias, tabela anual, Copa Argentina e Supercopa Argentina. O jogo modela as rodadas internas das zonas.
- **Europa e Ásia:** ligas nacionais, copas e supercopas das cinco ligas europeias, Libertadores, Sul-Americana, Recopa, os três torneios europeus, Supercopa da UEFA e as duas Champions League da AFC. As fases europeias de liga têm oito rodadas, ou seis na Conference.
- **Internacional:** Intercontinental com representantes dos continentes disponíveis e Mundial simulado a cada quatro edições, a partir de 2029.
- As copas têm classificações, chaves e finais. Em uma eliminatória única empatada, o jogo registra a decisão por pênaltis. A classificação anual e os campeões alimentam as vagas da edição seguinte.
- A página **Competições** mostra a classificação, os jogos por fase e o campeão. O painel da temporada inclui partidas aplicáveis do clube entre os próximos compromissos.

Datas e cruzamentos são simulados. Os regulamentos reais orientam as fases e as vagas, com recortes explícitos conforme os países disponíveis. A Copa do Brasil usa os clubes das Séries A e B. A UEFA tem 32 equipes por torneio no recorte, e as copas nacionais e continentais usam partidas eliminatórias únicas. A simulação individual, o mercado e os resultados de lances ainda se concentram nas Séries A e B. As copas e as ligas fora do Brasil têm resultados de clubes agregados.

## Referências

- [CBF, regulamento e participantes da Série B 2026](https://stcbfsiteprdimgbrs.blob.core.windows.net/img-site/cdn/REC_Brasileiro_Serie_B_2026_85d55b9f72.pdf)
- [CBF, regulamento e tabela da Copa do Brasil](https://www.cbf.com.br/futebol-brasileiro/noticias/campeonato-brasileiro/serie-b/cbf-divulga-tabela-basica-plano-geral-de-acoes-e-regulamento-especifico-da-copa-do-brasil-2026)
- [LPF, regulamento de 2026](https://www.ligaprofesional.ar/wp-content/uploads/2026/01/Reglamento-Torneos-LPF-Primera-2026.pdf)
- [OpenFootball](https://github.com/openfootball/football.json)
- [CONMEBOL, manual da Libertadores 2026](https://cdn.conmebol.com/wp-content/uploads/2025/12/CL-2026-Manual-de-Clubes-POR-1.pdf)
- [UEFA, formato das fases de liga](https://pt.uefa.com/uefachampionsleague/news/0268-121596105392-0908f942a319-1000--novo-formato-da-champions-league-explicado/)
- [CFA, ampliação da AFC Elite para 2026/27](https://www.thecfa.cn/qttz/20260519/37691.html)
- [FIFA, vagas no Mundial de Clubes 2029](https://www.fifa.com/en/tournaments/mens/fifa-club-world-cup/articles/mamelodi-sundowns-pyramids-qualify-2025-club-2029)
