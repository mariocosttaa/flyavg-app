# Plano

## Ponto de partida

O esqueleto da AVG-1 já traz React 19.3, Vite 8, React Router 7.18 (modo declarativo, `react-router`), duas entradas (portal e admin), `lazy()` por página, i18next com `common`, `errors`, `landing` e `admin`, deteção e persistência do idioma e sincronização de `<html lang>`. Falta o resto das subtarefas 2 e 3.

## Abordagem

1. **Router (subtarefa 1):** confirmar versões e configuração; não há dependências novas.
2. **i18n (subtarefa 2):**
   - Garantia permanente das chaves tipadas: uma linha `@ts-expect-error` num teste com uma chave inexistente; se a tipagem regredir, o typecheck falha.
   - `format.ts` com `formatDate`, `formatDateTime`, `formatFlightTime` (sempre UTC, 24 horas, marca "UTC"), `formatNumber` e `formatDuration` (`hh:mm`), e o hook `useFormat()`.
   - Novos namespaces `auth` (login provisório) e `pilot` (área do piloto), carregados dentro do `lazy()` da página. Os textos das molduras (navegação, seletor, erro) ficam em `common`, porque os layouts são importados de forma estática.
   - `LanguageSwitcher` em `src/shared/components/`, com `<select>` nativo.
   - en-GB fica decidido para o inglês (24 horas, dia antes do mês).
3. **Layouts e guardas (subtarefa 3):**
   - `src/shared/auth/`: `SessionProvider` provisório (sessão de visitante por omissão, estado injetável nos testes, sem chamadas à API), `useSession`, `can(permission, scope?)` com âmbito de grupo ou companhia, `AuthConfigProvider` por entrada.
   - Guardas: `GuestRoute`, `PrivateRoute`, `PermissionRoute`, `AdminRoute`; `safeRedirect` com `URL`.
   - Admin: o login é sempre no portal, com navegação de página inteira para `/login?redirect=/admin/...`; o portal, depois do login, usa navegação de página inteira para caminhos `/admin/*`.
   - Layouts: `PublicLayout`, `PilotLayout` (barra lateral e cabeçalho vazios), `AdminLayout`; cada um com `ScrollToTop`, `RouteErrorBoundary` e `Suspense`.
   - Páginas: `Auth/Login` provisória, `Pilot/Home` provisória, `Forbidden` partilhado, NotFound nas duas entradas.
4. **Skills:** transformar os marcadores "Decision pending (AVG-6)" em regras "Decided (AVG-6)".

## Riscos e decisões a confirmar

- **Permissão de acesso ao admin:** a matriz de papéis e permissões só chega na AVG-34. Fica uma constante provisória `admin.access`, marcada `TODO(AVG-34)`.
- **Persistência do idioma no perfil do piloto:** depende da API de autenticação; por agora só a preferência local (`flyavg.language`).
- Com a sessão provisória sempre como visitante, `/admin/` redireciona sempre para o login do portal até à AVG-23.
- Coordenação com a AVG-3: não mexer em `src/shared/api/`, `package.json` (exceto a versão), `scripts/` nem `errors.json`.
