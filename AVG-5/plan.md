# Plano

## Abordagem

1. **Tokens em três camadas** (skill 005): primitivos (`tokens/primitives.css`, único ficheiro
   com valores de cor), semânticos por tema (`themes/*.css`) e utilitários Tailwind
   (`index.css`, `@theme inline`). Escalas independentes do tema em `tokens/scales.css`.
2. **Reset do Tailwind** num bloco `@theme` próprio (`--color-*: initial` e restantes escalas
   visuais), verificado por um teste que compila o `index.css` real com `@tailwindcss/node`
   e confirma que `bg-red-500`, `shadow-lg` ou `font-semibold` não geram CSS, com controlo
   positivo (`bg-surface`, `shadow-raised`).
3. **Contraste testado a partir do CSS**: o teste lê os ficheiros CSS (`?raw`), aplica a cascata
   pela especificidade e ordem reais e calcula o contraste para os pares de texto e de UI nas
   seis combinações. Verifica também que cada token que uma companhia muda no modo claro é
   redefinido no escuro (senão o valor claro passava para o escuro).
4. **Papéis separados**: cada cor de preenchimento (`--accent`, `--danger`, …) tem o seu texto
   por cima (`--accent-fg`, …) e uma cor de texto sobre superfícies (`--accent-text`,
   `--danger-text`, …), porque várias cores da marca não chegam a 4,5:1 como texto (Âmbar sobre
   Areia 1,85:1; vermelho TAAG sobre o castanho 3,5:1; azul World sobre Areia 4,498:1).
5. **Catálogo como terceira entrada Vite** (`catalog/index.html` + `src/catalog/`), incluída no
   build só quando `VITE_APP_ENV` é `development` ou `staging`. O script de fronteiras confirma
   que não existe em produção e que não entra nos grafos do portal nem do admin. Regras de lint
   impedem o portal, o admin e o `shared` de importar `@/catalog`.
6. **Acessibilidade em testes**: `axe-core` (Deque, mantido) com um helper próprio de poucas
   linhas em `src/test/`, usado no teste da página do catálogo. O `vitest-axe` não tem versão
   nova desde 2022, por isso não entra.

## Decisões tomadas (a confirmar pelo Mário)

- **Cores derivadas**: misturas de cores do kit, anotadas em `primitives.css` com a origem:
  superfícies elevadas no escuro (6% de Areia/cinzento sobre o fundo), Âmbar escurecido para
  texto em fundo claro (Âmbar + 48% Noite), azul World escurecido para texto em Areia (+15%
  #0B2A5B), Kwanza e vermelho TAAG clareados para texto no escuro, contorno forte no escuro.
- **Verde de sucesso** (#1F7A4C claro, #86D0A6 escuro): não existe no kit; é a única cor nova.
- **Na TAAG Virtual o perigo (Kwanza #CE1126) e o acento (#E10600) são quase o mesmo vermelho.**
  Fica assim por agora; os mockups da fase 2 dirão se o perigo precisa de outro tratamento
  (ícone, contorno).
- **Texto de acento no tema do grupo, modo claro**: Âmbar escurecido (#856534), porque o Âmbar
  não se lê sobre Areia.
- **Anel de foco**: Âmbar escurecido no grupo claro, Âmbar no escuro; vermelho TAAG no claro e
  vermelho clareado no escuro; azul World escurecido no claro e azul claro no escuro.
- **Tema do grupo = sem atributo** `data-airline` (não há valor `avagroup`).
- **Tipografia**: títulos em Sora 700 em todos os temas. `font-display` (títulos de destaque)
  é Kufam só na TAAG Virtual; `font-brand` é sempre Sora, para nomes de marca.
- **Corpo de texto**: Sora 300, como no guia. A rever com os mockups se a leitura em tamanhos
  pequenos for fraca (só existem 300, 500 e 700).
- **Sora em TTF**: não há conversor woff2 instalado localmente; Kufam e JetBrains Mono já vêm em
  woff2.
- **Variant helper**: funções próprias `cx` e `variants` em `design-system/lib/` (sem
  dependências); o `cx` entra já, o `variants` com o primeiro componente que precise.
- **Botão como link**: o design system não conhece o router; um link com aspeto de botão usa a
  classe do botão (`buttonVariants`) num `<Link>` de `react-router`, sem prop polimórfica `as`.
- **Campos opcionais**: marcados com "(opcional)" traduzido; os obrigatórios não levam marca.

## Riscos

- Mudar o nome dos utilitários de fonte (`font-display`) afeta os poucos sítios que já usavam
  títulos; os títulos passam a Sora em todos os temas.
- O catálogo só existe nos builds de desenvolvimento e staging: se o Coolify de produção não
  passar `VITE_APP_ENV=production`, o catálogo não entra (o valor por omissão do Dockerfile já é
  `production`, e um valor ausente também exclui o catálogo).
