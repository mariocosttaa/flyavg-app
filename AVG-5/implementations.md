# Implementação

## Entregue

- **Tokens** (`src/shared/design-system/tokens/`): primitivos do kit de marca e misturas
  derivadas anotadas; reset de todas as escalas visuais do Tailwind; escala tipográfica
  (`text-xs` … `text-4xl`, `text-display`), pesos 300/500/700, `tracking-label`, `leading-*`,
  raios até `rounded-xl`, `shadow-raised`/`shadow-overlay`, `duration-*`, `ease-*`, `z-*`.
- **Fontes**: Sora em TTF (sem conversor woff2 local), Kufam variável e JetBrains Mono 500 em
  woff2, extraídas só para leitura do ramo `main` antigo. `font-brand` (sempre Sora) nos nomes
  de marca dos layouts; Kufam só por `font-display` na TAAG Virtual.
- **Temas** (`themes/`): base completo em claro e escuro; TAAG Virtual e World Virtual só com
  o que muda, sempre repetido no escuro. Papéis separados para preenchimento (`--accent`),
  texto sobre ele (`--accent-fg`) e texto colorido sobre superfícies (`--accent-text`), o mesmo
  para perigo, sucesso, aviso e informação.
- **Testes**: `tailwind-tokens.test.ts` compila o `index.css` real (paleta removida, com
  controlo positivo); `lib/theme-tokens.test.ts` aplica a cascata real às 6 combinações e
  verifica 26 pares por combinação (4,5:1 texto, 3:1 foco e contornos), sem arredondar.
- **Catálogo**: terceira entrada Vite (`catalog/index.html`, `src/catalog/`), só nos builds de
  `development` e `staging`; página `Tokens` com cores, contraste, tipografia, espaçamento,
  raios, sombras, movimento e camadas, troca ao vivo de companhia e modo, namespace `catalog`
  em pt e en. O script de fronteiras e o lint isolam-no.
- **Acessibilidade**: `axe-core` com `accessibilityViolations()` em `src/test/axe.ts`, usado no
  teste da página do catálogo.
- **Skills**: 002, 004, 005, 006, 010 e 013 atualizadas; nenhuma marca "Decision pending
  (AVG-5)" fica por resolver.

## Notas

- O Vitest só lê CSS como texto (`?raw`) quando o ficheiro está em `test.css.include`; a regra
  inclui só `index.css`, `tokens/` e `themes/` do design system.
- O `vite.config.ts` passou a função (`mode` para o `loadEnv`); o `vitest.config.ts` chama-a.
- Capturas das 6 combinações tiradas fora do repositório.
