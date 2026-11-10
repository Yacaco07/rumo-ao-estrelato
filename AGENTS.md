# Orientações do projeto

- Trabalhar exclusivamente em `https://github.com/Yacaco07/rumo-ao-estrelato.git`, branch principal `main`. Não criar outro repositório nem usar destinos anteriores.
- Antes de alterar arquivos, ler `docs/PLANO_DO_JOGO.md`, `docs/ARQUITETURA.md`, a auditoria e a validação mais recente. Preservar trabalho existente e verificar origin/branch.
- Desenvolver em etapas pequenas: planejar, implementar, testar, revisar e aprovar. A missão inicial autoriza a fundação e os commits; não avançar automaticamente para todos os sistemas de carreira.
- Manter regras puras em `src/domain`, interação em `features`, persistência em `infrastructure`. Não importar React ou IndexedDB no domínio.
- Não apresentar propostas, notícias, resultados, clubes ou elencos fictícios como dados reais ou sistemas prontos. Seguir `docs/DADOS_E_FONTES.md`; não incluir fotos de jogadores nem estaduais brasileiros.
- Escudos exigem evidência de permissão por ativo. Não presumir licença com base em acesso público.
- Antes de incluir ou atualizar bases do mundo, ler `docs/ETAPA_02_UNIVERSO.md`, registrar a origem dos campos e executar `npm run data:check`. `listed` significa relação publicada consultada, sem comprovar inscrição. Campos desconhecidos continuam `null`; elencos pendentes não são elencos vazios.
- Não sobrescrever saves ilegíveis. Manter validação, versões e proteção de concorrência; criar migrações antes de mudanças incompatíveis.
- Não introduzir chaves, tokens, arquivos `.env` ou dados privados nos commits.
- Antes de concluir uma alteração de lógica, executar os testes pertinentes e `npm run typecheck`; antes de entregar a aplicação, executar `npm run build`. Documentar limites reais de verificação sem alegar aprovação ou envio inexistente.
- Antes de push, atualizar a leitura do remoto e preservar alterações concorrentes. Nunca usar push forçado. Commits nesta missão já estão autorizados pelo usuário.
