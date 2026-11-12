# AVG-6: Base de idiomas e esqueleto do router no portal e no admin

Tarefa da fase 1 ("Fundação, arquitetura e design system") no Rasteia, projeto AVAGroup.

## Requisito ligado

- **AVG_NFR_001 (Idiomas):** Todas as aplicações devem estar em português e inglês desde o início.

## Subtarefas no Rasteia

1. React 19, Vite e React Router 7 no repositório app.
2. i18n pt e en com chaves tipadas.
3. Layouts vazios e rotas protegidas.

## Decisões da fase 1 que se aplicam

- **12.** Painel administrativo em `/admin/`, no mesmo domínio da app, com build próprio. O início de sessão faz-se sempre pelo portal.
- **17.** Idiomas: conteúdo traduzível com as duas línguas; o idioma do piloto define-se no registo a partir do idioma da app; os horários de voo aparecem em UTC.
- **15.** Tailwind v4 só com os tokens próprios, sem bibliotecas de componentes.

## Critérios de aceitação

- Versões e configuração conformes à skill: React 19, Vite, React Router 7 em modo declarativo, páginas carregadas com `lazy()`.
- i18next com chaves tipadas: uma chave inexistente faz falhar o typecheck.
- Idioma por omissão `pt`; deteção (escolha guardada, depois o navegador, depois `pt`) e persistência da escolha; `<html lang>` sincronizado.
- Seletor de idioma nos layouts do portal e do admin, com textos via i18n.
- Formatação de datas e números (pt-PT e en-GB), horários de voo em UTC.
- Layout público e layout autenticado do piloto (só estrutura), layout do admin.
- Guardas `GuestRoute`, `PrivateRoute`, `PermissionRoute` e `AdminRoute` sobre um contexto de sessão provisório (stub), sem chamadas à API.
- O admin envia para `/login?redirect=/admin/...` do portal; página de login provisória (formulário sem ligação).
- Páginas NotFound; testes das guardas e da segurança do `?redirect=` (só caminhos da mesma origem).
