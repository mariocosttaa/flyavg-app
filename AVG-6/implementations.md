# Implementação

## Subtarefa 1: React 19, Vite e React Router 7

Confirmado o que a AVG-1 instalou: React 19.3, Vite 8 (Rolldown) com o React Compiler através de `@rolldown/plugin-babel`, React Router 7.18 em modo declarativo, importado só de `react-router` (o lint bloqueia `react-router-dom`). Todas as páginas são carregadas com `lazy()`; os namespaces de área carregam dentro do mesmo `lazy()`. Não foram precisas dependências novas.

## Subtarefa 2: i18n pt e en com chaves tipadas

- Chaves tipadas contra `pt` em `types.d.ts`, agora com os namespaces `auth` e `pilot`. O `config.test.ts` tem linhas `@ts-expect-error` com chaves inexistentes: se a tipagem deixar de funcionar, o typecheck falha (verificado).
- Deteção (escolha guardada, idiomas do navegador, `pt`), persistência em `flyavg.language` e `<html lang>` (pt-PT ou en-GB) já vinham da AVG-1; ficou decidido o en-GB.
- `useLanguage()` lê o idioma com `useSyncExternalStore`, para o React Compiler não guardar um valor antigo.
- `format.ts` e `useFormat()`: datas, números, durações `hh:mm` e horários de voo sempre em UTC com a marca "UTC" (decisão 17).
- `LanguageSwitcher` (`<select>` nativo) nos três layouts.

## Subtarefa 3: layouts vazios e rotas protegidas

- `SessionProvider` provisório (stub): sem chamadas à API, sessão de visitante por omissão, estado injetável nos testes. Marcado `TODO(AVG-23)`.
- `can(permission, scope?)` com âmbito de grupo ou de companhia.
- Guardas `PrivateRoute`, `GuestRoute`, `PermissionRoute` e `AdminRoute`, com uma configuração por entrada (`AuthConfig`).
- O admin envia para `/login?redirect=/admin/...` do portal com navegação de página inteira (decisão 12). Depois do login, um destino `/admin/*` também abre com navegação de página inteira.
- `safeRedirect` com `URL`: só aceita caminhos da mesma origem.
- Layouts: `PublicLayout` (cabeçalho com seletor e "Iniciar sessão"), `PilotLayout` (barra lateral e cabeçalho vazios) e `AdminLayout`, cada um com `ScrollToTop`, `RouteErrorBoundary` e `Suspense`.
- Páginas provisórias: login (formulário desativado) e área do piloto. NotFound nas duas entradas; `Forbidden` partilhado.
- Testes: guardas, `safeRedirect`, permissões, formatação, seletor de idioma, rotas das duas entradas. E2E: redirecionamento do admin para o login do portal, área do piloto protegida, idioma persistente depois de recarregar.

## A confirmar

- A permissão de acesso ao admin é provisória (`admin.access`, `TODO(AVG-34)`).
- Com o stub, `/admin/` redireciona sempre para o login até à AVG-23.
- A API do hook de listas (skill 008) continua pendente: fica para o primeiro ecrã de lista.
- Guardar o idioma no perfil do piloto depende da API de autenticação.
