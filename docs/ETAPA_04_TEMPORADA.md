# Etapa 04 — Primeira temporada jogável

Após assinar, abra **Entrar na temporada** pelo contrato ou pela central. O calendário mostra os compromissos do clube, e cada avanço simula a rodada inteira. Na rodada 38, a temporada encerra e exibe o campeão e a posição do seu clube.

## Competição simulada

- Os 20 clubes são os participantes identificados no catálogo da Série A 2026. A estrutura usa 38 rodadas, turno e returno, com um jogo por clube por rodada. São 19 mandos de cada lado por clube e 380 jogos no total.
- Os confrontos são gerados pelo jogo, em semanas simuladas que começam em 01/02. A referência da CBF fundamenta o tamanho e o formato. Datas, resultados e mandos desta carreira são gerados pelo motor. [Publicação da CBF, 15/12/2025](https://www.cbf.com.br/futebol-brasileiro/noticias/copa-verde/masculino/cbf-divulga-tabela-detalhada-das-primeiras-rodadas-do-brasileirao-2026).
- Vitória vale 3 pontos e empate vale 1. A ordem da tabela considera pontos, vitórias, saldo e gols marcados. Empates persistentes usam uma ordem estável pelos IDs dos clubes.
- As relações de atletas reais continuam disponíveis em **O universo**. A simulação usa equipes agregadas, com variação gerada pela semente e mando de campo. A posição, os minutos, a fadiga e o geral do seu atleta afetam a participação. Jogadores reais não recebem atributos inventados.

## Preparação e desempenho

- Há uma ação de preparação por rodada. Treino técnico rende 8 XP e acrescenta 9 de fadiga. Treino físico rende 11 XP e acrescenta 16 de fadiga. Recuperação reduz a fadiga em até 25. Jogar direto aplica descanso reduzido.
- As partidas rendem XP conforme a nota. A cada 65 XP, o geral aumenta um ponto, até 12 acima do inicial e sem ultrapassar 99.
- Goleiros acompanham defesas e jogos inteiros sem sofrer gol. Atletas de linha acompanham gols e assistências. Ambos veem jogos, minutos, média de nota, fadiga e geral.

## Save e validação

O perfil e o primeiro contrato existentes abrem a temporada sem recriação. A primeira ação fixa a versão do catálogo, os participantes, o clube, os parâmetros iniciais do atleta, a versão das regras e a semente. As ações confirmadas são registradas no IndexedDB com proteção de revisão. A mesma sequência produz o mesmo calendário e os mesmos resultados ao reabrir.

`npm run check` valida o catálogo, a tipagem, a suíte e o build. Os 116 testes passaram. A suíte percorre 38 rodadas para um goleiro e um atacante, verifica mandos, placares e pontuação e cobre a estreia salva na interface e comandos concorrentes entre abas. O fluxo automatizado usa DOM e IndexedDB simulados.

A versão 0.5.0 termina ao fim da primeira temporada. A próxima etapa é a virada de ano com histórico, contrato e movimentações. A integração de acesso e descenso depende da Série B verificada.
