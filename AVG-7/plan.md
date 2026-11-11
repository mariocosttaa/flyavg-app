# Plano

1. Ler a lista de decisões aprovadas (página "Decisões" da fase 1 no Rasteia).
2. Percorrer as marcas "Decision pending (AVG-7)" nas skills e reescrever cada passagem:
   - decisão tomada → regra firme com "Decided (AVG-7)";
   - tema em aberto → "Open (...)", com a fase onde se decide (email: fase 3; pré-renderização: fase 3; registo de erros e métricas: antes do lançamento; papéis e matriz de permissões: fase 5; limites de pedidos: começam com os valores da skill e ajustam-se com uso real).
3. Ajustar a frase do `SKILL.md` que explica as marcas.
4. Escrever os domínios (`dev.flyavg.com` / `api.dev.flyavg.com`, `app.flyavg.com` / `api.flyavg.com`) e o admin em `/admin/` onde a skill fala deles.
5. No `promote-ticket`, trocar a frase do mapeamento de deploy pela decisão 18.
6. Acrescentar ao `git-workflow` e ao `promote-ticket` o fluxo de entrega de tarefas (pendente: dá autorização permanente para commits, push e integração no `development`, por isso precisa da aprovação explícita do Mário nesta sessão).
7. Manter as três skills partilhadas iguais byte a byte entre os dois repositórios.

## Riscos

- Duas skills contarem histórias diferentes (por exemplo, o formato de erro): confirmar que a API e a app dizem o mesmo.
