# Briefing Sprint 3 — Revisão de schema + Faturamento Direto + Export & Relatório

> Esse sprint é maior que uma "semana" típica (~18-22h vs as 8-12h das anteriores).
> Pode quebrar em 1-2 semanas reais conforme o ritmo.

## 🎯 Objetivos

1. **Revisar e ajustar o schema** das 13 tabelas — pegar problemas que apareceram no uso real antes de continuar codando em cima do schema atual
2. **CRUD completo de Faturamento Direto (FD)** — primeira entidade financeira
3. **Export XLSX** em todas as listagens (com filtros aplicados)
4. **Relatório PDF de conciliação FD por obra** — pra mandar pro cliente

## ⏱️ Estimativa por bloco

| Bloco | Conteúdo | Tempo |
|---|---|---|
| 3.0 | Revisão de schema das 13 tabelas | 3-4h |
| 3.1 | FD: types + helpers | 30min |
| 3.2 | FD: listagem | 1h30 |
| 3.3 | FD: formulário criação | 2h |
| 3.4 | FD: detalhes + edição | 1h30 |
| 3.5 | FD: upload de evidências | 1h30 |
| 3.6 | ExportButton genérico aplicado nas listagens | 3-4h |
| 3.7 | Relatório PDF de conciliação FD por obra | 4-6h |
| 3.8 | Testes finais | 1h |
| **Total** | | **~18-22h** |

---

## 🟢 Bloco 3.0 — Revisão de schema (3-4h)

**Importante:** essa etapa acontece ANTES de codar FD. Mexer no schema depois de ter código em cima fica caro.

### Como vamos fazer

**Etapa A — Leitura sistemática** (1h)
Vamos ler as 13 tabelas em ordem e pra cada uma identificar:
- Campos que ficaram NÃO USADOS depois da S2 (visíveis pelo que NÃO aparece na UI de orçamentos)
- Nomes ruins ou inconsistentes (ex: `observacao` vs `observacoes` vs `obs`)
- Tipos errados (ex: `text` onde devia ser enum / `numeric` onde devia ser inteiro)
- Constraints faltando (ex: validações que aparecem no zod do form mas não no banco)
- Índices faltando (ex: colunas de busca/filtro sem índice → vai degradar com volume)
- Campos faltando (ex: algo que você precisou inventar na UI e marcou como TODO)

**Output dessa etapa:** lista numerada de mudanças propostas por tabela.

**Etapa B — Decisão** (30min)
Pra cada item da lista, decidir: **APROVAR** / **REJEITAR** / **POSTERGAR**.

**Etapa C — Migration** (1-2h)
Gerar `004_revisao_schema.sql` com TODAS as mudanças aprovadas. Estrutura:
- `BEGIN`/`COMMIT` envolvendo tudo (atomic)
- `ALTER TABLE` por mudança
- Para colunas renomeadas: criar nova → backfill → dropar antiga (em fases se houver dados em prod)
- Para tipos mudados: cast explícito
- Comentário no início listando todas as mudanças

Rodar em gc-dev primeiro, validar, depois aplicar em gc-prod.

**Etapa D — Regen de types + ajuste de código** (30min)
- `npm run db:types` pra regenerar `src/lib/supabase/types.ts`
- Ajustar `src/lib/types.ts` (Orcamento, Obra, etc) se algum campo mudou
- Rodar `npx tsc --noEmit` — corrigir tudo que apareceu

**Cola no Claude Code pra começar:**

```
Vamos revisar o schema das 13 tabelas. Comece lendo 001_initial.sql na ordem:
empresas, profiles, orcamentos, obras, propostas, contratos, itens, execucao,
notas_fiscais, pagamentos, acordos_pagamento, acordo_parcelas, fd.

Pra cada tabela me apresente:
1. Campos não usados (cruze com o que aparece na UI dos orçamentos e na lista de obras)
2. Nomes ruins ou inconsistentes
3. Tipos suspeitos
4. Constraints faltando
5. Índices faltando
6. Sugestão de campo a adicionar (se você ver algo que faltou na UI)

Apresente UMA tabela por vez e espere meu feedback antes de seguir.
Não escreva nenhuma migration ainda — vamos discutir e decidir primeiro.
```

---

## 🟢 Bloco 3.1 — Tipos e helpers de FD (30min)

**Cola no Claude Code:**

```
Verifique que os types já estão prontos em src/lib/supabase/types.ts e src/lib/types.ts:
- Database['public']['Tables']['fd']['Row' | 'Insert' | 'Update']
- Adicione em src/lib/types.ts: type Fd, FdInsert, FdUpdate, FdListItem, Evidencia
- Adicione tipo derivado: StatusFdPagamento = 'pendente' | 'pago' | 'vencido'

Crie src/lib/fd.ts com:
- computeStatusFd(fd: Fd): StatusFdPagamento
- formatStatusFdLabel(s: StatusFdPagamento): string

Lógica do status:
- data_pagamento != null → 'pago'
- data_pagamento is null e data_vencimento < hoje → 'vencido'
- caso contrário → 'pendente'

Confirme que tsc --noEmit passa.
```

---

## 🟢 Bloco 3.2 — Listagem (1h30)

Padrão idêntico a `/orcamentos`. Detalhes-chave:

**Colunas:** Data lançamento, Pedido/Documento, Obra (codigo_obra), Fornecedor, Valor, Diferença a favor (verde/cinza/vermelho conforme >0 / =0 / <0), Status pgto (badge calculado em runtime).

**Busca:** pedido_documento, fornecedor, codigo, especificacao.

**Filtros:** Obra (select), Status pgto, Período de lançamento (30d/90d/ano).

**Filtro de status pgto na query SQL** (não filtrar em JS depois):
- `'pago'` → `data_pagamento is not null`
- `'pendente'` → `data_pagamento is null and (data_vencimento is null or data_vencimento >= today)`
- `'vencido'` → `data_pagamento is null and data_vencimento < today`

Reuso: `EmptyState`, `Pagination`, padrão de URL state. Crie `src/app/(app)/fd/{page,fd-table,filters}.tsx`.

---

## 🟢 Bloco 3.3 — Formulário criação (2h)

Padrão idêntico a `/orcamentos/novo`. **Sempre 2 arquivos** pro form compartilhado: `fd-form.tsx` ('use client') + `fd-form-helpers.ts`.

**Seções:**
1. Identificação — pedido_documento, item_parcela
2. Obra — select required, popula no Server Component
3. Datas — lançamento (default hoje), vencimento, pagamento
4. Produto/Serviço — código, especificação (textarea), unidade (UN/KG/M/M²/PÇ/OUTRO), quantidade, preço unitário
5. Fornecedor e Valores — fornecedor (required min 3), valor, valor_descontar, **diferença a favor calculada em runtime no form** (verde/cinza/vermelho)
6. Justificativa / Observação
7. Evidências — placeholder pro bloco 3.5

**Zod**: obra_id required, fornecedor required min 3, valor >= 0, valor_descontar >= 0, data_lancamento required. `diferenca_favor` NÃO entra no payload (é GENERATED).

---

## 🟢 Bloco 3.4 — Detalhes + edição (1h30)

Padrão idêntico a `/orcamentos/[id]`. Aba "Detalhes" + aba "Evidências" (placeholder até 3.5).

**DetailHeader:** título "FD #[pedido]" ou "FD sem pedido", subtítulo "fornecedor — codigo_obra", badge status pgto, botões "Editar" (admin/financeiro) e "Excluir" (admin).

**ConfirmDialog na exclusão:** "FD é histórico fiscal — exclusão é irreversível."

Edição em `/fd/[id]/editar/` (page + editar-form + actions), reusa `fd-form.tsx` + helpers.

---

## 🟢 Bloco 3.5 — Upload de evidências (1h30)

**Bucket:** `evidencias` (já existe).
**Path:** `<empresa_id>/<obra_id>/<fd_id>/<filename>`
> **Diferente do padrão de anexos de orçamentos** que usa `<empresa_id>/orcamentos/<orcamento_id>/<filename>`. Aqui inclui `obra_id` no meio.

**Tipos permitidos:** PDF + imagens (PNG, JPG, WebP, HEIC). Sem Word/Excel.
**Tamanho:** 20MB.

**Atenção RLS:** bucket `evidencias` permite upload pra admin/producao/medicao/financeiro (NÃO comercial). A página `/fd` tem layout-guard pra admin/financeiro/visualizador. Visualizador entra na página mas não deve ver o componente de upload — esconda pra ele.

**Reusar o FileUpload** existente passando `bucket` e `pathBuilder` como props (se o componente hardcoda 'anexos' hoje, refatorar pra aceitar).

---

## 🟢 Bloco 3.6 — Export XLSX nas listagens (3-4h)

**Componente reutilizável** `src/components/ExportButton.tsx` (Client). Props:
- `filename: string` — ex: "orcamentos-2026-05-11.xlsx"
- `onExport: () => Promise<Blob>` — server action que monta o XLSX

**Server action por entidade**, em `src/app/(app)/<entidade>/export.ts`:
- Recebe os mesmos searchParams da listagem (busca, filtros, etc)
- Roda a mesma query SEM paginação
- Monta XLSX usando `exceljs` (mais flexível que `xlsx`)
- Cabeçalho com nome da entidade + filtros aplicados + data emissão
- Tabela com as colunas da listagem (mesmas que aparecem na tela)
- Totais no rodapé pra colunas numéricas (valor, valor_estimado, etc)
- Formatação BRL nas células de valor, dd/MM/yyyy nas células de data

**Aplicar em:** /orcamentos, /obras, /fd. (Outras listagens conforme entram no roadmap.)

**Instalar:** `npm install exceljs`

**Cuidado:** server actions retornando Blob têm pegadinhas em Next 14. Confirme o padrão correto (NextResponse com headers vs revalidate). Se complicar, fazer como GET handler em /api/export/<entidade>.

---

## 🟢 Bloco 3.7 — Relatório PDF de conciliação FD por obra (4-6h)

**Onde:** botão "Gerar relatório de conciliação" na tela `/obras/[id]` (aba ou no header). Recebe `obra_id`, gera PDF com TODOS os FDs daquela obra.

**Estrutura do PDF:**

1. **Cabeçalho**
   - Nome da empresa (vem de `empresas`)
   - "Relatório de Conciliação — Faturamento Direto"
   - Obra: codigo_obra + nome + cliente
   - Data de emissão (dd/MM/yyyy)
   - Período: data mínima e máxima de lançamento dos FDs incluídos

2. **Tabela detalhada** (1 linha por FD)
   - Colunas: Data lançamento, Pedido/Doc, Fornecedor, Especificação, Quantidade, Valor cliente, Valor descontamos, Diferença a favor, Status pgto, Data pagamento
   - Linhas zebradas pra legibilidade

3. **Totais no rodapé da tabela**
   - Total valor cliente: SOMA
   - Total descontamos: SOMA
   - **Diferença a favor consolidada:** SOMA destacada em negrito
   - Contagem: "X lançamentos · Y pagos · Z pendentes"

4. **Rodapé do documento**
   - Espaço pra "Aceite do cliente:" + linha de assinatura
   - Espaço pra "Local e data:"
   - Rodapé pequeno: "Documento gerado por GC-Sistema em [data] por [usuário]"

**Lib:** `@react-pdf/renderer` (declarativo, integra bem com React). Alternativa: `pdfkit` (imperativo, mais controle).

**Server action:** `generateFdConciliacao(obraId)` retorna Blob do PDF, browser baixa direto.

**Instalar:** `npm install @react-pdf/renderer`

**Atenção:**
- Layout em retrato A4
- Quebra de página automática quando a tabela passa de uma página (cuidar com header repetido em cada página)
- Datas formatadas pt-BR
- Valores BRL com R$ e separador de milhar
- Logo da empresa: por enquanto deixa placeholder (campo `empresas.logo_url` se já existir, ou string fixa)

---

## 🟢 Bloco 3.8 — Testes finais (1h)

Seed pra FD:
```
Crie supabase/seed_fd.sql no padrão do seed_orcamentos.sql:
~25 lançamentos com obras diferentes, ~5 fornecedores plausíveis
("Material Forte", "Aço & Cia", "Vidros do Nordeste", "Parafusos Brasil",
"Pintura Premium"), mix de status (uns pagos, uns pendentes, uns vencidos),
valores R$ 500 a R$ 80.000. Tag [SEED-TESTE] em observacao. Cleanup
comentado no final.
```

### Roteiro

**Admin:**
1. Criar 3 lançamentos manuais com obras diferentes
2. Editar um
3. Buscar por fornecedor
4. Filtrar por obra
5. Filtrar por status (pago/pendente/vencido — testa os 3)
6. Testar paginação com seed
7. Subir 2 evidências (1 PDF + 1 JPG)
8. Excluir 1 evidência
9. Excluir 1 lançamento — confere modal "histórico fiscal"
10. Confere que diferenca_favor aparece com cor (verde/cinza/vermelho)
11. **Export XLSX** da listagem com filtros — abre no Excel, confere
12. **Relatório PDF** em uma obra com vários FDs — confere layout, totais, quebra de página

**Financeiro:**
- Tudo que admin EXCETO excluir
- Confirma que vê todos os FDs e consegue exportar

**Visualizador:**
- Vê listagem e detalhes
- NÃO vê Novo/Editar/Excluir
- NÃO vê área de upload de evidências
- CONSEGUE exportar XLSX e gerar PDF (relatório é leitura)

**Comercial:**
- NÃO vê "FD" no menu
- Bypass direto /fd → redirect pra /
- Mesmo bypass em /fd/novo, /fd/[id]

### Bugs prováveis

| Sintoma | Causa | Solução |
|---|---|---|
| Status sempre "pendente" | Comparação de datas em string | Usa date-fns ou cast pra Date |
| Upload 403 | Path Storage sem obra_id | Conferir pathBuilder |
| Filtro de status retorna errado | Condição SQL mal montada | Revisa as 3 do bloco 3.2 |
| XLSX baixa vazio | Server action retornando errado | Verifica Content-Type e body |
| PDF quebra páginas mal | Tabela longa sem repetir header | Repetir header nas continuações |

---

## 🚦 Critérios de "Sprint 3 concluído"

- [ ] Migration de revisão (`004_revisao_schema.sql`) aplicada em gc-dev (e gc-prod se aprovado)
- [ ] CRUD de FD completo testado nos 4 perfis
- [ ] Upload de evidências funcionando
- [ ] ExportButton XLSX em /orcamentos, /obras, /fd
- [ ] Relatório PDF de conciliação por obra
- [ ] Sem erros no console e build da Vercel verde
- [ ] Commits agrupados por bloco (ou por sub-feature)

## 📞 Quando voltar pro chat aqui

- Antes de aprovar mudanças do schema (etapa B do bloco 3.0)
- Se a server action de XLSX/PDF travar com tipos de Next 14
- Pra decidir UX do botão "Gerar relatório" — na header da obra? aba?
- No fim do sprint pra planejar S4 (Propostas? Obras CRUD?)
