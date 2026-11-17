# Etapa 03 — Propostas iniciais

A versão 0.4.0 abre `/propostas` automaticamente após salvar o perfil concluído. Ao acessar essa rota com perfil ausente ou em rascunho, a tela oferece acesso ao criador.

## Regras

- A versão revisada da Série A 2026 fornece os clubes candidatos. A simulação usa relações de clubes com contagem coerente e posição documentada para cada atleta. As listas da competição de Athletico e Corinthians continuarão disponíveis para consulta no catálogo.
- As oito posições jogáveis entram em quatro setores: gol, defesa, meio-campo e ataque. A seleção prioriza as cinco relações com menos jogadores do setor escolhido. Em empate, a ordem usa a versão do catálogo, o nome, a idade, a posição e o identificador do clube como entradas estáveis.
- As duas primeiras ofertas simulam rotação. As outras três simulam desenvolvimento. A duração simulada é de 24 meses até os 20 anos e 12 meses a partir dos 21. Esses parâmetros pertencem ao jogo.
- Com menos de cinco clubes elegíveis, a tela explica a cobertura insuficiente. Uma alteração no perfil concluído ou na versão do catálogo pode mudar as propostas. A tela lê o perfil salvo no IndexedDB e calcula as ofertas ao abrir.
- Uma relação publicada permite contar atletas por setor. Inscrições, hierarquia interna e disponibilidade real dependem de verificação própria.
- A oferta inicial inclui salário mensal simulado, de R$ 4.400 na primeira proposta a R$ 3.200 na quinta, em passos de R$ 300. Valores e papel pertencem ao jogo.
- O atleta pode negociar o salário em múltiplos de R$ 100 e prazos de 12, 24 ou 36 meses. Até R$ 400 acima do valor inicial, o clube aceita. Até R$ 1.000 acima, retorna uma contraproposta no limite de R$ 400 acima do valor inicial. Acima disso, recusa e mantém o termo disponível anterior.
- Cada negociação mantém seus termos enquanto a tela está aberta. **Confirmar assinatura** grava o clube, a versão do catálogo e os termos finais na mesma transação do perfil. O clube aparece na central, e a rota `/propostas` passa a exibir o contrato.
- Perfis existentes permanecem legíveis. O registro de contrato é opcional e usa a mesma versão do banco IndexedDB. O perfil fica somente para leitura após assinar. Excluir o perfil por confirmação também remove o vínculo.

## Verificação

`npm run check` valida a base, a tipagem, os testes e o build. Os 109 testes abrangem seleção e ordenação, abertura automática, contrapropostas, assinatura original ou negociada, reabertura e proteção contra dois primeiros contratos simultâneos. Os fluxos automatizados de interface usam DOM e IndexedDB simulados. A revisão visual em navegador real permanece pendente.
