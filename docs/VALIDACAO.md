# Validação da etapa 01

Data: 10/11/2026. Checkout: `main`, origin `https://github.com/Yacaco07/rumo-ao-estrelato.git`.

## Escopo e ambiente

Fundação Next.js e criação de perfil. Node.js 24.22.1, npm 11.9.0. Dependências fixadas no `package-lock.json`. Nenhum snapshot esportivo ou ativo de clube importado.

## Resultados

| Verificação | Estado |
| --- | --- |
| Auditoria pública e clone do repositório exato | Confirmados; remoto inicialmente vazio, branch padrão `main` |
| Primeiro build de produção e TypeScript | Aprovados; quatro rotas e página de erro geradas |
| Primeira suíte de regras, persistência e fluxo | 35 testes aprovados após correções de nomes acessíveis |
| Reinstalação limpa por `npm ci` | Aprovada; instalação concluída a partir do lockfile |
| TypeScript após instalação limpa | Aprovado com `npm run typecheck` |
| Suíte final ampliada após instalação limpa | **37 testes aprovados em 3 arquivos** |
| Build final após instalação limpa | **Aprovado**; `/`, `/atleta`, `/universo`, `/projeto` e página de erro geradas |
| Revisão visual desktop e celular em navegador real | Pendente; limitação do serviço de prévia descrita abaixo |
| Workflow GitHub Actions | Criado; execução remota não verificada |
| Uso do plugin GitHub | Recusado na instrução mais recente do usuário; não utilizado |
| Autenticação de escrita por Git local | Indisponível; teste de push recusou autenticação |
| Commits remotos | **Não enviados**; os commits foram preparados somente no clone oficial |

## Cobertura funcional

Regras: oito posições, atributos exclusivos de goleiro, base preservada, distribuição e retirada dos dez pontos, rejeição de valores negativos/fracionários/desconhecidos, soma inválida, idade/número inválidos, identidade e perfil concluído.

Persistência: leitura vazia, rascunho incompleto, reabertura de conexão, atualização e revisão, data de criação preservada, validação antes de escrita, duas abas, duas primeiras escritas concorrentes, exclusão da revisão esperada, save corrompido/incompatível preservado, IndexedDB indisponível e erro de quota sem substituição do perfil anterior.

Interface: erro de identidade, bloqueio de conclusão sem dez pontos, atributos de goleiro, confirmação/cancelamento da troca de posição, retorno durante troca pendente, salvamento, reabertura e exclusão somente após confirmação. Os testes usam DOM em jsdom e IndexedDB em memória; não comprovam renderização ou comportamento do Safari/Chrome reais.

## Revisão e limitações

- Os testes revelaram que os textos de ajuda faziam parte do nome acessível dos campos. Labels e descrições foram separados. Os botões de posição receberam nomes acessíveis explícitos.
- A revisão encontrou uma troca de posição pendente que poderia bloquear o avanço após voltar à identidade. O retorno passou a cancelar a pendência, com teste de regressão.
- Foram revisados erros de gravação, preservação do save anterior e controle transacional de concorrência. Alterações rápidas de atributos usam atualização funcional de estado.
- O serviço gerenciado `sites-preview` acrescentou `--host 127.0.0.1 --port 4173 --strictPort` ao comando `next dev`. Next.js recusou `--host`, opção que pertence a outros servidores. O serviço encerrou a prévia. Nenhum servidor alternativo ou alteração artificial do aplicativo foi usado para mascarar a limitação. Não há screenshot nem aprovação visual alegada.
- Inicialmente o usuário informou a conexão GitHub, mas as ferramentas autenticadas não estavam expostas e `gh auth status` não possuía autenticação local. `git push --dry-run origin main` falhou com ausência de usuário autenticado. Em seguida, o usuário decidiu continuar **sem o plugin GitHub**; essa instrução foi respeitada, sem usar ou sugerir novamente o plugin. Nenhuma credencial foi solicitada, inventada ou incluída em arquivos. A alternativa para envio é Git autenticado fora desta execução.
- A visualização pública do GitHub confirmou o repositório ainda vazio durante a revisão. Antes de enviar, repetir a leitura do remoto para preservar qualquer trabalho concorrente. Nunca forçar push.

## Pendências para aprovação

1. Executar a revisão em navegador real, desktop e celular, após disponibilização de prévia compatível com Next.js.
2. Em ambiente com Git autenticado, verificar conta, permissões e proteções do repositório, enviar os commits locais para `main` e conferir o SHA remoto. Respeitar eventual exigência de pull request; não forçar push. O plugin GitHub não deve ser utilizado nesta solicitação.
3. Conferir o workflow remoto e apresentar esta etapa ao responsável. Não avançar para propostas ou temporadas sem revisão e aprovação da fundação.

## Commits preparados

| Commit local | Conteúdo |
| --- | --- |
| `3dc5f81` | Auditoria, plano do jogo, arquitetura e política de dados, antes do primeiro commit de implementação |
| `dbe9288` | Next.js, interface, criador, persistência, 37 testes, lockfile, workflow e instruções |

O commit final de documentação registra esta validação. Nenhum destes commits foi enviado ao servidor nesta execução. Todos pertencem ao checkout do repositório oficial em `main`.

## Pacotes para revisão sem plugin

O diretório ignorado `entrega/` contém um ZIP gerado com `git archive` e um bundle do histórico de `main`, ambos do commit final desta etapa. Não incluem `node_modules`, `.next`, credenciais nem dados de usuário. São cópias de entrega deste mesmo projeto; nenhum outro repositório remoto foi criado.

O ZIP permite executar o código com Node.js 24, `npm ci` e `npm run dev`. O bundle preserva os commits. Para restaurá-lo em um ambiente próprio com Git e enviar ao **mesmo repositório oficial**, após verificar permissões e eventuais regras de branch:

```bash
git clone rumo-ao-estrelato-main.bundle rumo-ao-estrelato
cd rumo-ao-estrelato
git remote set-url origin https://github.com/Yacaco07/rumo-ao-estrelato.git
git fetch origin
git push -u origin main
```

Antes do último comando, conferir `git ls-remote origin refs/heads/main`. Se o remoto já tiver commits, primeiro revisar e integrar o trabalho concorrente. O push comum rejeita divergência; não usar `--force`. A autenticação deve ocorrer no ambiente do responsável, sem compartilhar tokens em mensagens ou arquivos do projeto.
