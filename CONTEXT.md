# Sistema de Gestão de Contratos

## O que é

Sistema interno de uma empresa de engenharia (estruturas metálicas / fachadas) em Fortaleza/CE pra substituir uma planilha Excel que controlava obras, orçamentos, propostas, contratos, itens, execução, notas fiscais, pagamentos, acordos e faturamento direto (FD).

## Stack técnica

- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript
- **Estilo**: Tailwind CSS
- **Banco**: Supabase (PostgreSQL 15+) — schema em `/supabase/`
- **Auth**: Supabase Auth (email/senha)
- **Storage**: Supabase Storage (4 buckets: anexos, evidencias, notas-fiscais, documentos)
- **Deploy**: Vercel
- **Package manager**: npm

## Ambientes

- **gc-dev** (Supabase): desenvolvimento, pode quebrar à vontade
- **gc-prod** (Supabase): produção, dados reais

Credenciais em `.env.local` (nunca commitar). Template em `.env.local.example`.

## Estrutura do banco (13 tabelas)

**Sistema (2):**
- `empresas` — tenant isolation
- `profiles` — estende auth.users, tem perfil (admin/comercial/producao/medicao/financeiro/visualizador)

**Funil comercial (3):**
- `orcamentos` — fase inicial, cliente pode não ter obra ainda
- `propostas` — uma obra pode ter várias; `valor_final` é GENERATED
- `contratos` — opcional, pode vir de proposta

**Operação (3):**
- `obras` — cadastro central
- `itens` — vinculados a contrato OU proposta (XOR), ou soltos
- `execucao` — 4 etapas (fabricação → entrega → instalação → medição); 1 por item
  - Cada etapa tem **quantidade parcial** (`fab_qtd`, `ent_qtd`, `inst_qtd`, `med_qtd`) com cascata forçada (`med ≤ inst ≤ ent ≤ fab ≤ quantidade_total`)
  - Status (`fab_status`, etc) é GENERATED automaticamente pela quantidade
  - Datas (`*_data_inicio`, `*_data_atualizacao`, `*_data_fim`) preenchidas via trigger automaticamente

**Financeiro (5):**
- `notas_fiscais` — NFs emitidas
- `pagamentos` — FONTE ÚNICA de entrada de dinheiro (origem: nf/acordo/avulso)
- `acordos_pagamento` — agrupador de combinações
- `acordo_parcelas` — combinações individuais (status derivado via trigger a partir de pagamentos)
- `fd` — faturamento direto (cliente paga fornecedor, desconta da gente)

## Regras-chave de modelagem

1. **Multi-tenant por empresa + multi-obra**: integridade forçada por FKs compostas `(id, empresa_id, obra_id)`. Impossível cross-tenant ou cross-obra por construção.
2. **Views com `security_invoker = true`**: respeitam RLS.
3. **Funções helper RLS** (`current_empresa_id`, `has_perfil`) são `SECURITY DEFINER`.
4. **Cascata de status automatizada**: `pagamentos` → `parcela`/`nf` → `acordo` via triggers.
5. **`valor_final`** em `obras`/`propostas` é GENERATED (`valor_total - desconto`).
6. **NF cancelada é status terminal**, triggers não sobrescrevem.
7. **Conversão acordo→NF**: pagamentos antigos ficam "arquivados" nas views (não entram em total_recebido).
8. **ON DELETE RESTRICT** em obras e pagamentos pra preservar histórico financeiro.
9. **ON DELETE SET NULL (coluna)** em FKs compostas, preservando empresa_id.

## Perfis e permissões (RLS)

- **admin**: CRUD tudo
- **comercial**: CRU orçamentos/obras/propostas/contratos/itens; R resto
- **producao/medicao**: CRU execução; R resto
- **financeiro**: CRU NFs/pagamentos/acordos/parcelas/FD; R resto
- **visualizador**: R tudo
- **DELETE sempre só admin**

## Views disponíveis

- `obras_com_valores` — obra + valores calculados (de contratos + propostas aprovadas)
- `itens_com_status` — item + progresso de execução
- `receitas_obra` — fluxo financeiro consolidado
- `obras_financeiro` — dashboard por obra
- `contratos_financeiro` — dashboard por contrato
- `propostas_financeiro` — dashboard por proposta

## Arquivos SQL (em `/supabase/`)

- `000_reset_dev.sql` — reset (só dev)
- `001_initial.sql` — schema completo
- `002_rls_policies.sql` — RLS
- `003_storage_buckets.sql` — buckets

## Convenções de código

- **TypeScript strict**
- **Supabase client**: usar helpers de `@supabase/ssr` pra Next.js App Router
- **Rotas protegidas**: via middleware.ts + cookies
- **Server Components por padrão**; Client Components só quando precisar de interatividade
- **Formulários**: react-hook-form + zod
- **Datas**: date-fns com locale pt-BR, formato dd/MM/yyyy
- **Valores monetários**: `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`
- **Commits**: português, formato "verbo: descrição" (ex: "adiciona tela de obras")

## Plano da Semana 1

1. Scaffold Next.js 14 com App Router + TypeScript + Tailwind
2. Configurar Supabase client (servidor + cliente + middleware)
3. Tela de login com email/senha
4. Layout autenticado (sidebar + header + área de conteúdo)
5. Primeira tela funcional: lista de obras

## Observações operacionais

- Desenvolver contra **gc-dev** sempre
- Nunca hardcodar UUIDs — usar env vars ou buscar via query
- Typescript types do Supabase: gerar com `npx supabase gen types typescript`
