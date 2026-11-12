# AVG-5: Fundações do design system próprio

## Contexto (Rasteia)

Design system feito de raiz para a plataforma, sem shadcn nem outras bibliotecas de componentes.
Nesta fase ficam só as fundações. Os componentes nascem dos mockups na fase 2.

Requisitos ligados: nenhum. Decisões da fase 1 que se aplicam:

- **Design system próprio:** feito de raiz; a fase 1 traz os tokens, os temas por companhia e o
  modo claro e escuro. Os componentes nascem dos mockups aprovados na fase 2 e entram primeiro
  num catálogo.
- **Decisão 15 (Estilos):** Tailwind v4 só com os tokens próprios; a paleta original do Tailwind
  é removida. Não se usam bibliotecas de componentes.

## Subtarefas

1. Tokens: cores, tipografia, espaçamentos, raios e sombras.
2. Tema por companhia (TAAG Virtual, World Virtual) e tema claro e escuro.
3. Estrutura da biblioteca de componentes e página de catálogo.

## Critérios de aceitação

- Tokens semânticos completos (superfícies, texto, texto secundário, linhas, acento, estados de
  sucesso, aviso, perigo e informação, anel de foco), escala tipográfica, espaçamentos, raios,
  sombras, durações e curvas de movimento, camadas (z-index).
- Tailwind v4 só com os tokens próprios: utilitários como `bg-red-500` não existem (verificado
  num teste que compila o CSS real).
- Fontes servidas pela app: Sora (TTF do kit de marca), Kufam variável e JetBrains Mono 500.
  Kufam só em títulos de destaque da TAAG Virtual, nunca em nomes de marca.
- `data-airline="taag|world"` (sem atributo = tema do grupo) × `data-theme="light|dark"`: as seis
  combinações cumprem WCAG AA (4,5:1 para texto, 3:1 para anel de foco e contornos de
  controlos), verificadas por um teste unitário.
- Estrutura e convenções da biblioteca de componentes registadas na skill (006).
- Página de catálogo com os tokens (cores por tema, tipografia, espaçamentos, raios, sombras,
  movimento), troca ao vivo de companhia e de modo claro/escuro, textos em pt e en.
- Todas as marcas "Decision pending (AVG-5)" das skills resolvidas.

## Fontes de marca

- Kit em `brand-design/`: guia de marca (14 páginas), `LEIA-ME.txt`, logótipos.
- AVAGroup: Noite #0F1B2D (primária), Âmbar #F2A93B (marca), Kwanza #CE1126 (acento, 3% da
  página, um elemento por ecrã), Areia #FAF6EE (fundo), Pista #E4DDCF (linhas), Asfalto #5E6673
  (texto 2). Cinzento das taglines em fundo Noite: #9AA3B2.
- TAAG Virtual: vermelho #E10600, escuro quente #1E1919, superfície clara #F4F6F8.
- World Virtual: #1E6FD9 e #0B2A5B; azul claro #9AB0D0 (tagline do logótipo negativo).
- Tipografia: Sora (700 títulos, 300 destaques, 500 etiquetas espaçadas), JetBrains Mono para
  códigos de voo.
