# Revisão de schema — Sprint 3 (bloco 3.0)

Decisões consolidadas das 13 tabelas + 1 tabela nova (`clientes`). Vai virar `supabase/004_revisao_schema.sql`.

## NOVA tabela — `clientes`

```sql
create table clientes (
  id uuid primary key default uuid_generate_v4(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  nome text not null,                              -- razão social ou nome (PF)
  cnpj_cpf text,                                    -- aceita PF e PJ, sem validação de formato
  contato text,
  telefone text,
  email text,
  endereco text,
  cidade text,
  cep text,
  observacao text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references profiles(id),
  unique (id, empresa_id)
);
create unique index idx_clientes_cnpj_cpf_unique
  on clientes (empresa_id, cnpj_cpf) where cnpj_cpf is not null;
```

**Data migration:** dedup por `cliente_nome` distinto nos `orcamentos` + `obras` existentes, criar 1 cliente por dedup.

## empresas
- `+ razao_social text NOT NULL`
- `+ logo_url text`
- `+ email`, `+ telefone`, `+ endereco`, `+ cidade`, `+ cep`, `+ inscricao_estadual`, `+ inscricao_municipal`
- `+ UNIQUE (cnpj)` — alfanumérico, sem CHECK de formato
- TODO: tela `/configuracoes` vira editor da empresa (fora da migration)

## profiles
- `+ telefone text`
- `+ UNIQUE (empresa_id, email)`
- `+ CHECK email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'`
- TODO no código: bloquear login se `ativo=false` (fora da migration)

## orcamentos
- `- cliente_nome, cliente_contato, cliente_telefone, cliente_email, cliente_cidade`
- `+ cliente_id uuid NOT NULL` FK pra `clientes(id)` (com composta multi-tenant)
- `- doc_url`
- Constraint mais estrita: `motivo_rejeicao IS NULL` quando `status != 'rejeitado'` (hoje só força "se rejeitado → motivo NOT NULL")

## obras
- `- cliente, contato, cpf_cnpj, telefone, email` → vira `cliente_id` FK
- **Mantém** `endereco`, `cidade`, `cep` (são da obra, não do cliente)
- `- valor_total, desconto, valor_final, pct_sinal, pct_fd, pct_entrega_material, pct_medicao_instalacao, forma_pagamento` (legacy — vêm da view `obras_com_valores`)
- `- doc_url`
- `~ observacoes → observacao` (rename)
- `~ idx_obras_cliente → idx_obras_cliente_id`

## propostas
- `- doc_url`
- `+ CHECK pct_sinal + pct_fd + pct_entrega_material + pct_medicao_instalacao <= 1.0`
- `+ data_envio date`, `+ data_decisao date`
- `+ motivo_rejeicao text` com mesma lista de orçamentos + constraint estrita

## contratos
- `- doc_url`
- `+ CHECK soma pct_* <= 1.0`
- `+ motivo_rescisao text` com CHECK em `('inadimplencia', 'descumprimento_prazo', 'acordo_partes', 'forca_maior', 'outro')` + constraint estrita

## itens
- `~ unidade CHECK` agora só `('QTD', 'M2')` — remove `'ML'`
- `~ valor_total` vira `GENERATED ALWAYS AS (valor_unit * quantidade) STORED`
- `~ area_m2` vira `GENERATED ALWAYS AS (largura * altura * quantidade) STORED`
- `+ observacao text`
- `+ UNIQUE (proposta_id, numero) WHERE proposta_id IS NOT NULL`
- `+ UNIQUE (contrato_id, numero) WHERE contrato_id IS NOT NULL`

## execucao
- `+ fab_previsao_fim date`, `+ ent_previsao_fim date`, `+ inst_previsao_fim date`, `+ med_previsao_fim date`
- `+ localizacao text`
- `+ foto_url text` (1 foto; evidências por etapa continuam em `evidencias jsonb`)
- `- UNIQUE (item_id)` — permite N execuções por item
- `+ sequencial integer NOT NULL`
- `+ UNIQUE (item_id, sequencial)`
- `+ valor_unit numeric(14,2) default 0 CHECK (>=0)`
- `+ valor_total numeric(14,2) GENERATED ALWAYS AS (valor_unit * quantidade_total) STORED`
- `+ trigger`: ao INSERT, copia `valor_unit` do item
- `+ RLS`: UPDATE de `valor_unit` só pra admin/financeiro
- NÃO inclui bloqueio/pausa (postergado)
- NÃO inclui CHECK `SUM(qtd) <= itens.quantidade` (postergado)

## notas_fiscais
- `+ chave_nfe text` + UNIQUE quando preenchida
- `+ motivo_cancelamento text` + CHECK NOT NULL se `status='cancelada'`
- `+ data_cancelamento date`
- `~ status 'parcial' → 'paga_parcialmente'` — atualizar trigger de pagamentos junto

## pagamentos
- `~ forma CHECK` adiciona `'cartao'`
- `~ comprovante_url → anexo` (rename)

## acordos_pagamento
- **Sem mudanças**

## acordo_parcelas
- `~ status CHECK` final: `('pendente', 'paga', 'paga_parcialmente', 'cancelada')` — remove `'atrasada'` (vira runtime no frontend) e renomeia `'parcial'` → `'paga_parcialmente'`

## fd
- `+ unidade CHECK ('UN', 'KG', 'M', 'M2', 'PC', 'OUTRO')`
- `+ CHECK valor_descontar <= valor`

## TODOs (fora da migration, código/UI)
- Bloquear login se `profiles.ativo=false`
- Tela `/configuracoes` editar empresa (com upload de logo)
- CRUD completo em `/clientes` (lista, novo, editar, detalhes)
- Refactor de form de orçamento e obra pra usar select de cliente (com autocomplete + criar inline)
- Data migration: criar clientes a partir dos dados existentes

## Estimativa do bloco 3.0

| Etapa | Tempo |
|---|---|
| Escrever `004_revisao_schema.sql` | 2-3h |
| Data migration (criar clientes existentes) | 1h |
| Regen types + tsc passando + ajustar imports | 1h |
| Ajustar form de orçamento (cliente vira FK select) | 2h |
| CRUD `/clientes` completo | 4h |
| Tela `/configuracoes` editor empresa | 2h |
| Testes | 1h |
| **Total** | **~13-15h** |

Aumento sobre estimativa inicial (3-4h). Total do Sprint 3 vira **~30-35h**.
