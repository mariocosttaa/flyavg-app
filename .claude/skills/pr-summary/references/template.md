# <Nome da funcionalidade> (AVG-<n>)

<Duas a quatro linhas: o que é, para que serve e a decisão estruturante, se houver.>

## Modelo de dados

### `<tabela>`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | Chave primária. |
| `airline_id` | uuid | Companhia dona do registo. |
| `...` | ... | ... |

```text
<tabela>.airline_id → airlines.id   ON DELETE RESTRICT
```

- **RESTRICT em `airline_id`:** <porquê, numa frase>.

## Estado e derivações

- **<valor calculado>:** <regra>, calculado na leitura e não guardado, porque <porquê>.

## API

```text
GET  /<recurso>?page=1&limit=20&search=   lista paginada
POST /<recurso>                            cria
```

## Permissões

- **<permissão>** com âmbito de **grupo** ou de **companhia**: <quem a tem e como é garantida>.

## Plano de implementação

1. <passo de alto nível>
2. <passo de alto nível>

## Âmbito

### Coberto

- <o que esta entrega faz>

### Adiado (não desta fase)

- <o que não faz>
