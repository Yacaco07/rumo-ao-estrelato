# Validação da etapa 01

Data: 10/11/2026. Branch: `main`. Origin exclusivo: `https://github.com/Yacaco07/rumo-ao-estrelato.git`.

## Escopo e ambiente

Fundação Next.js e criação de perfil. Node.js 24.22.1, npm 11.9.0. Dependências fixadas no `package-lock.json`. Nenhum snapshot esportivo ou ativo de clube importado.

## Resultados

| Verificação | Estado |
| --- | --- |
| Auditoria do repositório oficial | Confirmada; remoto inicialmente vazio, branch padrão `main` |
| Conta GitHub conectada | `Yacaco07`, confirmada pela consulta autenticada |
| Permissões no repositório | `push: true`, `admin: true`; permissão de colaborador `admin` |
| Instalação limpa por `npm ci` | Aprovada a partir do lockfile |
| TypeScript | Aprovado com `npm run typecheck` |
| Vitest | **37 testes aprovados em 3 arquivos** |
| Build de produção | **Aprovado**; `/`, `/atleta`, `/universo`, `/projeto` e página de erro geradas |
| Publicação dos 38 arquivos em `main` | **Confirmada** pelo retorno de atualização da branch e pela leitura de arquivos no GitHub |
| Integridade da publicação | Árvore publicada idêntica ao snapshot local validado: `d7cfaac8281796256169841dd54961b10c2a6510` |
| Workflow GitHub Actions | **Aprovado no GitHub** para o commit de implementação: `npm ci` e `npm run check` concluídos com sucesso |
| Revisão visual desktop e celular em navegador real | Pendente; limitação do serviço de prévia descrita abaixo |

Pipeline da implementação: <https://github.com/Yacaco07/rumo-ao-estrelato/actions/runs/42883209695>.

## Cobertura funcional

Regras: oito posições, atributos exclusivos de goleiro, base preservada, distribuição e retirada dos dez pontos, rejeição de valores negativos/fracionários/desconhecidos, soma inválida, idade/número inválidos, identidade e perfil concluído.

Persistência: leitura vazia, rascunho incompleto, reabertura de conexão, atualização e revisão, data de criação preservada, validação antes de escrita, duas abas, duas primeiras escritas concorrentes, exclusão da revisão esperada, save corrompido/incompatível preservado, IndexedDB indisponível e erro de quota sem substituição do perfil anterior.

Interface: erro de identidade, bloqueio de conclusão sem dez pontos, atributos de goleiro, confirmação/cancelamento da troca de posição, retorno durante troca pendente, salvamento, reabertura e exclusão somente após confirmação. Os testes usam DOM em jsdom e IndexedDB em memória; não comprovam renderização ou comportamento do Safari/Chrome reais.

## Revisão e limitações

- Labels e descrições dos campos foram separados para obter nomes acessíveis precisos. Os botões de posição receberam nomes acessíveis explícitos.
- O retorno à identidade cancela uma troca de posição pendente, com teste de regressão.
- Falhas de gravação preservam o save anterior, e a concorrência é controlada por revisão dentro da transação. Alterações rápidas de atributos usam atualização funcional de estado.
- O serviço gerenciado `sites-preview` acrescentou `--host 127.0.0.1 --port 4173 --strictPort` ao comando `next dev`. Next.js recusou `--host`, e a prévia encerrou. Nenhum servidor alternativo ou alteração artificial do aplicativo foi usado para mascarar a limitação. A revisão visual permanece pendente.
- A publicação foi feita pela conexão GitHub autenticada, sem depender de credenciais do terminal. A ausência de sessão em `gh auth status` não significa que essa conexão esteja desconectada. Nenhuma credencial foi incluída em arquivos.
- O repositório foi novamente verificado antes da inicialização. A atualização de `main` utilizou o SHA esperado e `force: false`; nenhum push forçado foi feito.

## Commits remotos

| Commit | Conteúdo |
| --- | --- |
| `9a9ccca` | Inicialização de `main` com o plano principal do jogo |
| `4aa2b60` | Publicação da fundação completa: 38 arquivos, interface, regras, IndexedDB, testes, lockfile e workflow |

A documentação de publicação é atualizada em um commit posterior na mesma branch. Os commits criados pela API têm SHAs próprios; os SHAs dos primeiros commits locais não devem ser confundidos com os commits remotos. O código publicado foi comparado pelo hash da árvore Git antes das atualizações exclusivamente documentais.

## Pendências para aprovação

1. Executar a revisão em navegador real, desktop e celular, quando houver prévia compatível com Next.js.
2. Apresentar a fundação ao responsável e obter aprovação antes de iniciar propostas ou temporadas.

## Pacotes para revisão

O diretório ignorado `entrega/` recebe um ZIP com `git archive` e um bundle do histórico de `main`, gerados a partir da branch sincronizada. Não incluem `node_modules`, `.next`, credenciais nem saves de usuário. São cópias de entrega do mesmo projeto; nenhum outro repositório remoto foi criado.

A fonte principal para continuar o desenvolvimento é a branch `main` do repositório oficial. As instruções de execução estão no [README](../README.md).
