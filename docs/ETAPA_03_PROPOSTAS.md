# Etapa 03 — Propostas iniciais

A versão 0.3.0 libera **Ver minhas propostas** após a conclusão do perfil. A rota `/propostas` também pode ser aberta diretamente. Um perfil ausente ou em rascunho leva à criação do atleta.

## Regras

- A versão revisada da Série A 2026 fornece os clubes candidatos. A simulação usa relações de clubes com contagem coerente e posição documentada para cada atleta. As listas da competição de Athletico e Corinthians continuarão disponíveis para consulta no catálogo.
- As oito posições jogáveis entram em quatro setores: gol, defesa, meio-campo e ataque. A seleção prioriza as cinco relações com menos jogadores do setor escolhido. Em empate, a ordem usa a versão do catálogo, o nome, a idade, a posição e o identificador do clube como entradas estáveis.
- As duas primeiras ofertas simulam rotação. As outras três simulam desenvolvimento. A duração simulada é de 24 meses até os 20 anos e 12 meses a partir dos 21. Esses parâmetros pertencem ao jogo.
- Com menos de cinco clubes elegíveis, a tela explica a cobertura insuficiente. Uma alteração no perfil concluído ou na versão do catálogo pode mudar as propostas. A tela lê o perfil salvo no IndexedDB e calcula as ofertas ao abrir.
- Uma relação publicada permite contar atletas por setor. Inscrições, hierarquia interna e disponibilidade real dependem de verificação própria. Salário, contraproposta, assinatura e início da carreira ficam para as próximas etapas.

## Verificação

`npm run check` valida a base, a tipagem, os testes e o build. Há testes para seleção de cinco clubes, ordenação e estabilidade, setores, disponibilidade, perfil concluído do IndexedDB e numeração observada na página do universo. Os 102 testes passaram. O servidor de produção respondeu HTTP 200 nas cinco rotas públicas. Os fluxos automatizados de interface usam DOM e IndexedDB simulados. A revisão visual em navegador real permanece pendente.
