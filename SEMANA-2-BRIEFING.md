# Briefing Semana 2 — Orçamentos (CRUD completo)

## 🎯 Objetivo da semana

Implementar o CRUD completo da entidade **Orçamentos** — a primeira entidade do funil comercial. No fim da semana você consegue:

- Listar orçamentos da empresa
- Criar novo orçamento (cliente, escopo, valor, prazo)
- Editar orçamento existente
- Mudar status (pendente → análise → enviado → aprovado/rejeitado)
- Quando rejeitar, escolher motivo categorizado
- Quando aprovado, vincular (opcionalmente) a uma obra existente
- Anexar arquivos (proposta em PDF, comunicação por email)
- Ver histórico/timeline do orçamento

## 📊 Por que começar por Orçamentos

3 motivos:

1. **Entidade autocontida** — não depende de muito (só de empresa e profile, que já estão prontos)
2. **Tem todos os padrões** — CRUD completo, formulário, validação, status, anexos, busca, paginação, filtros. Tudo que vai se repetir nas próximas semanas.
3. **É o início do funil** — começa pelo começo do processo de venda da empresa

Depois de fazer Orçamentos bem, as próximas entidades vão **muito mais rápido** porque você reusa os componentes e padrões.

## ⏱️ Estimativa de tempo

| Bloco | Conteúdo | Tempo |
|---|---|---|
| 2.1 | Schema Types + Helpers | 1h |
| 2.2 | Listagem completa (busca, filtros, paginação) | 2h |
| 2.3 | Formulário de criação | 2h30 |
| 2.4 | Tela de detalhes + edição | 2h |
| 2.5 | Mudança de status (com motivo de rejeição) | 1h30 |
| 2.6 | Upload de anexos | 2h |
| 2.7 | Testes finais e refinamento | 1h |
| **Total** | | **~12h** |

Distribuído em 5-7 dias, é tranquilo.

## 📋 Pré-requisitos antes de começar

Antes do Bloco 2.1, confirma:

- [ ] Bloco 1.5 funcionando (lista de obras aparece e tem dados de teste)
- [ ] Login funcionando com admin do gc-dev
- [ ] Pelo menos 1 perfil de cada role criado pra teste (use o SQL do final do briefing)
- [ ] Servidor rodando sem erros em `npm run dev`

---

## 🟢 Bloco 2.1 — Types do banco + helpers (1h)

Esse bloco gera os tipos TypeScript do banco. Sem isso, você fica codando com `any` e perde todo o autocomplete + type safety. **Vale 1h investida.**

**Cola no Claude Code:**

```
Vamos gerar os types do TypeScript a partir do schema do Supabase.

1. Pegue meu access token do Supabase (vou colar) e o project ID do gc-dev
2. Instale globalmente: npm install -g supabase
3. Gere os types em src/lib/supabase/types.ts:
   npx supabase gen types typescript --project-id <ID_GC_DEV> > src/lib/supabase/types.ts

Atualize os arquivos src/lib/supabase/server.ts e src/lib/supabase/client.ts
para usarem o tipo Database em createServerClient<Database>(...) e createBrowserClient<Database>(...).

Crie também src/lib/types.ts com types auxiliares:
- type Orcamento = Database['public']['Tables']['orcamentos']['Row']
- type OrcamentoInsert = Database['public']['Tables']['orcamentos']['Insert']
- type OrcamentoUpdate = Database['public']['Tables']['orcamentos']['Update']
(Faça o mesmo padrão pra obras, propostas, contratos, itens, execucao, notas_fiscais, pagamentos, acordos_pagamento, acordo_parcelas, fd, profiles, empresas)

Confirme que tudo compila com tsc --noEmit.
```

**Como pegar o access token e project ID:**

1. Token: https://supabase.com/dashboard/account/tokens → Generate new token → copia
2. Project ID: vai no projeto gc-dev → Settings → General → "Reference ID" (algo tipo `xyzabc123`)

**Atenção:** o access token é **superpoderoso** — não cola em lugar público nem commita.

---

## 🟢 Bloco 2.2 — Listagem completa (2h)

A tela `/orcamentos` precisa ser robusta — vai ser modelo pras outras entidades.

**Cola no Claude Code:**

```
Implemente a tela de listagem de orçamentos em /orcamentos:

1. Server Component em src/app/(app)/orcamentos/page.tsx
2. Busca da tabela `orcamentos` filtrando por empresa_id (RLS cuida)
3. Reutilize/refatore o DataTable que criou pra obras se possível

Colunas da tabela:
- Número (or se null, "—")
- Data Solicitação (formato dd/MM/yyyy)
- Cliente
- Cidade
- Status (badge colorido)
- Valor Estimado (formato BRL)
- Responsável

Funcionalidades:
- Busca por: número, cliente_nome, cliente_contato, cliente_email (campo único, busca em todos)
- Filtros (dropdowns):
  - Status (todos, pendente, analise, enviado, aprovado, rejeitado, expirado)
  - Período (todos, últimos 30 dias, últimos 90 dias, este ano)
- Ordenação por: data_solicitacao DESC (padrão)
- Paginação 20 por página
- URL com search params (?busca=X&status=Y&page=N) para bookmark

Status com cores:
- pendente: cinza
- analise: amarelo
- enviado: azul
- aprovado: verde
- rejeitado: vermelho
- expirado: cinza escuro

Botão "Novo Orçamento" no topo direita (visível pra admin e comercial).
Estado vazio: ilustração + "Nenhum orçamento cadastrado" + botão Novo.

Linha clicável → leva pra /orcamentos/[id]
```

---

## 🟢 Bloco 2.3 — Formulário de criação (2h30)

**Cola no Claude Code:**

```
Crie a tela de novo orçamento em /orcamentos/novo:

1. Server Component que renderiza um Client Component com o formulário
2. Form em react-hook-form + zod
3. Submit: createServerAction que insere no Supabase e redireciona pra /orcamentos/[id]

Estrutura do formulário em SEÇÕES:

SEÇÃO 1: Identificação
- Número (text, opcional, placeholder "ex: ORC-2026-001")
- Data Solicitação (date, default hoje)

SEÇÃO 2: Cliente
- Nome do Cliente (text, required)
- Contato (text, opcional)
- Telefone (text, opcional, máscara (XX) XXXXX-XXXX)
- Email (email, opcional)
- Cidade (text, opcional)

SEÇÃO 3: Escopo
- Descrição (textarea, opcional, min 0 / max 1000 chars)
- Escopo Resumo (textarea, opcional)
- Valor Estimado (currency BRL, opcional, default 0)
- Prazo Estimado (text, opcional, ex: "60 dias")

SEÇÃO 4: Responsável e Vinculação
- Responsável (text, opcional - quem é o vendedor responsável)
- Vincular à obra existente (select opcional - busca obras da empresa)
- Observações (textarea, opcional)

SEÇÃO 5: Anexos (deixar pra Bloco 2.6)
- Por agora, só placeholder "Anexos podem ser adicionados após criar"

BOTÕES no rodapé:
- "Cancelar" (volta pra /orcamentos sem salvar)
- "Salvar Rascunho" (cria com status='pendente')

VALIDAÇÕES (zod):
- cliente_nome: obrigatório, min 3 chars
- email se preenchido: formato email válido
- telefone se preenchido: validar formato
- valor_estimado: >= 0

UI:
- Layout em card centralizado, max-width 800px
- Seções com título e separador
- Campos com label em cima, hint embaixo quando útil
- Erros de validação em vermelho debaixo do campo
- Botão Salvar com loading state quando enviando
- Toast de sucesso ao salvar (use sonner ou react-hot-toast)
- Toast de erro com mensagem clara se falhar
```

---

## 🟢 Bloco 2.4 — Tela de detalhes e edição (2h)

**Cola no Claude Code:**

```
Crie a tela de detalhes/edição em /orcamentos/[id]:

1. Server Component em src/app/(app)/orcamentos/[id]/page.tsx
2. Busca o orçamento pelo id (usa params.id)
3. Se não encontrado, retorna 404 com notFound()

Layout:
- Header da página com:
  - Título: "Orçamento [número]" ou "Orçamento sem número"
  - Subtítulo: cliente_nome
  - Badge de status à direita
  - Botões: "Editar" (admin/comercial), "Mudar status" (admin/comercial), "Excluir" (admin)

- Corpo dividido em ABAS (use shadcn/ui Tabs ou tailwind plain):
  - Aba 1: "Detalhes" — mostra todos os dados em modo read-only
  - Aba 2: "Anexos" — placeholder por enquanto
  - Aba 3: "Histórico" — placeholder por enquanto

Aba "Detalhes" — layout em 2 colunas:
- Coluna esquerda: identificação, cliente, escopo
- Coluna direita: valores, datas, responsável, observações

Cada bloco com título, separador, e campos em grid 2 colunas (label : valor).
Campos vazios: mostrar "—" em cinza.

CLICAR EM "EDITAR":
- Abre modal OU vai pra /orcamentos/[id]/editar (escolha o que ficar mais simples)
- Mesmo formulário do Bloco 2.3, mas pré-preenchido
- Submit faz UPDATE em vez de INSERT
- Sucesso: volta pra /orcamentos/[id] e mostra toast

CLICAR EM "EXCLUIR":
- Modal de confirmação ("Tem certeza? Esta ação não pode ser desfeita")
- Se confirmar: DELETE no Supabase e redireciona pra /orcamentos com toast
- Só visível pra admin
```

---

## 🟢 Bloco 2.5 — Mudança de status com motivo de rejeição (1h30)

**Cola no Claude Code:**

```
Implemente a mudança de status do orçamento. Quando clicar no botão "Mudar status" da tela de detalhes:

Abre um modal/dialog com:
- Status atual (read-only)
- Novo status (radio buttons ou select):
  - pendente
  - analise
  - enviado
  - aprovado
  - rejeitado
  - expirado

Lógica condicional:

SE novo_status = 'enviado':
- Aparece campo "Data de envio" (date, default hoje)

SE novo_status = 'aprovado':
- Aparece campo "Data de decisão" (date, default hoje)
- Aparece checkbox "Vincular a obra" — se marcar, mostra select de obras
- Aparece botão "Criar nova obra a partir deste orçamento" (placeholder por enquanto)

SE novo_status = 'rejeitado':
- Aparece campo "Data de decisão" (date, required)
- Aparece select OBRIGATÓRIO "Motivo da rejeição":
  - preco_alto - "Preço acima do esperado"
  - prazo_curto - "Prazo inviável"
  - perdeu_concorrente - "Cliente escolheu concorrente"
  - cliente_desistiu - "Cliente desistiu do projeto"
  - sem_resposta - "Cliente não respondeu"
  - escopo_mudou - "Escopo do projeto mudou"
  - sem_capacidade - "Não tínhamos capacidade"
  - outro - "Outro (descrever)"
- Campo "Detalhes" (textarea, obrigatório se motivo='outro', opcional caso contrário)

Validação ZOD condicional baseada no status escolhido.
Submit faz UPDATE no Supabase com os campos corretos.
Toast de sucesso e atualiza a página.

Importante: o banco já tem a constraint de motivo obrigatório se rejeitado, 
então vai dar erro de banco se você esquecer. O frontend deve validar antes pra dar erro amigável.
```

---

## 🟢 Bloco 2.6 — Upload de anexos (2h)

**Cola no Claude Code:**

```
Implemente upload de anexos pra orçamentos:

Arquitetura:
- Anexos vão no Supabase Storage, bucket "anexos"
- Path: <empresa_id>/orcamentos/<orcamento_id>/<filename>
- Metadados (lista de anexos) ficam no campo orcamentos.anexos (jsonb array)
- Cada anexo: { nome, url, tipo, tamanho, uploaded_at, uploaded_by }

Implemente:

1. Componente FileUpload em src/components/FileUpload.tsx (Client Component)
   - Input file multi (aceita PDF, DOCX, XLSX, JPG, PNG, máx 10MB cada)
   - Drag and drop
   - Preview da lista enquanto carrega
   - Progress bar por arquivo
   - Botão "Adicionar mais arquivos"

2. Server Action uploadAnexo:
   - Recebe File + orcamento_id
   - Faz upload pro Storage (bucket "anexos")
   - Atualiza orcamentos.anexos com push do novo metadado
   - Retorna a URL signed pra preview

3. Aba "Anexos" da tela de detalhes do orçamento:
   - Lista os anexos atuais com:
     - Ícone do tipo (📄 pdf, 📊 xlsx, 🖼️ imagem, etc)
     - Nome
     - Tamanho formatado (KB/MB)
     - Data de upload
     - Botão "Visualizar" (abre URL signed em nova aba)
     - Botão "Excluir" (admin/comercial)
   - Componente FileUpload no fim pra adicionar mais

4. Excluir anexo:
   - Remove do Storage
   - Remove do array orcamentos.anexos
   - Toast de confirmação

VALIDAÇÕES:
- Tamanho máximo: 10MB por arquivo
- Tipos permitidos: pdf, docx, xlsx, jpg, jpeg, png, gif
- Mensagens de erro claras pro usuário

ATENÇÃO: o RLS do Storage que criamos no 003_storage_buckets.sql espera 
que o path comece com empresa_id. Garanta que o upload usa esse padrão.
```

---

## 🟢 Bloco 2.7 — Testes finais e refinamento (1h)

Não tem prompt único pro Claude Code aqui — é você testando manualmente.

### Roteiro de teste sistemático

**Como admin:**
1. ✅ Criar 3 orçamentos de teste com dados variados
2. ✅ Editar um deles
3. ✅ Mudar status: pendente → análise → enviado
4. ✅ Mudar status pra aprovado de um, rejeitado de outro (testar motivo obrigatório)
5. ✅ Tentar excluir um — confirma que pede confirmação
6. ✅ Testar busca por cliente
7. ✅ Testar filtro por status
8. ✅ Testar paginação (criar 25 orçamentos rápido pra ter 2 páginas)
9. ✅ Subir um PDF de anexo
10. ✅ Excluir o anexo

**Como comercial (logando com `comercial@teste.com`):**
1. ✅ Tudo que admin faz, EXCETO excluir
2. ✅ Verifica que botão "Excluir" não aparece

**Como visualizador (logando com `visualizador@teste.com`):**
1. ✅ Vê a lista de orçamentos
2. ✅ Vê detalhes
3. ✅ NÃO vê botão "Novo Orçamento"
4. ✅ NÃO vê botão "Editar"
5. ✅ NÃO consegue acessar /orcamentos/novo direto pela URL (deve dar erro de RLS)

**Como financeiro (logando com `financeiro@teste.com`):**
1. ✅ Confirma que NÃO vê o item "Orçamentos" no menu (não tem permissão)
2. ✅ Se forçar URL /orcamentos, deve mostrar erro/redirect

### Bugs comuns nessa fase

| Sintoma | Causa provável | Solução |
|---|---|---|
| "Nenhum orçamento" mas tem no banco | RLS bloqueando | Verifica empresa_id no profile |
| Erro ao salvar: "violates check constraint" | Frontend não validou um campo obrigatório | Adicionar validação no zod |
| Upload não funciona | Path do Storage errado (sem empresa_id) | Revisar a server action |
| Botão "Editar" aparece mesmo pra visualizador | Lógica de perfil não foi aplicada | Confere o has_perfil() ou perfil do usuário |
| Status não muda | Trigger ou check bloqueando | Olha a mensagem do erro PostgreSQL |

---

## 🎁 Extras se sobrar tempo

Se terminar tudo antes do prazo, dá pra adicionar:

1. **Timeline de mudanças de status** — registra cada transição num campo jsonb `historico`. Mostra na aba "Histórico".

2. **Atalho "Criar proposta a partir deste orçamento"** — botão na tela de detalhes que pré-preenche um formulário de proposta com os dados do orçamento (deixa pra Semana 3 se preferir).

3. **Exportar orçamento como PDF** — gera um PDF formatado com os dados pra enviar ao cliente.

4. **Email de notificação** — quando muda status pra "enviado", manda email pro cliente (precisa setup de SMTP — deixa pra v1.1).

---

## 🚦 Critérios de "Semana 2 concluída"

Antes de começar a Semana 3, garanta:

- [ ] CRUD completo funcional (criar, ler, atualizar, deletar)
- [ ] Listagem com busca, filtros, paginação
- [ ] Mudança de status com motivo de rejeição funcionando
- [ ] Upload de anexos funcionando
- [ ] Testes com diferentes perfis passaram
- [ ] Sem erros no console do navegador
- [ ] Sem warnings do Next.js no terminal
- [ ] Commit de cada bloco no Git (mesmo que ainda não tenha conectado com GitHub remoto)

## 📞 Quando voltar pro chat aqui

Volta aqui se:

- Travar em algum erro complexo (Claude Code não conseguir resolver em 2-3 tentativas)
- Tiver dúvida de produto (ex: "deveria existir mais um campo X?")
- Quiser fazer review de algum bloco antes de avançar
- Precisar mudar a modelagem do banco pra algo novo
- No fim da Semana 2 pra planejar a Semana 3

---

## 🎯 Resumo dos prompts pra Claude Code

Pra facilitar, copia esses prompts em ordem pro Claude Code:

1. Bloco 2.1 — Types e helpers
2. Bloco 2.2 — Listagem
3. Bloco 2.3 — Formulário criação
4. Bloco 2.4 — Detalhes + edição
5. Bloco 2.5 — Mudança de status
6. Bloco 2.6 — Upload anexos
7. Bloco 2.7 — Testar manualmente

Bom trabalho, e qualquer dúvida, manda aqui!
