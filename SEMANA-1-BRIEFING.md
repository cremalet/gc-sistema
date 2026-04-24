# Briefing Semana 1 — Scaffold e login

Este arquivo tem os **prompts prontos** pra você colar no Claude Code, em ordem. Cada bloco é autocontido — não precisa explicar mais nada, só colar, responder perguntas de confirmação (yes/no) e deixar rodar.

**Antes de começar:** garanta que você está numa pasta vazia onde vai morar o projeto, e que tem o `CONTEXT.md` na mesma pasta (ou no path pai). Exemplo:

```bash
mkdir ~/projetos/gc-sistema
cd ~/projetos/gc-sistema
# cola o CONTEXT.md aqui
claude
```

---

## Bloco 1.1 — Scaffold do projeto (30 min)

**Cola isso no Claude Code:**

```
Leia primeiro o CONTEXT.md pra entender o projeto.

Agora crie o scaffold inicial de um app Next.js 14 (App Router) com:
- TypeScript strict mode
- Tailwind CSS 3
- ESLint
- App Router (não Pages Router)
- src/ directory
- Import alias @/*

Use `npx create-next-app@latest .` dentro do diretório atual.

Depois de criado:
1. Verifique se `npm run dev` funciona (porta 3000)
2. Crie um arquivo .env.local.example com template das variáveis do Supabase (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY — sem valores)
3. Adicione .env.local e node_modules no .gitignore (se já não tiver)
4. Me reporte o status final.
```

**O que esperar**: ele vai rodar `create-next-app`, responder prompts (deixa ele responder com defaults sensatos), e no fim terá um projeto Next.js básico rodando. Primeira vez demora ~3 minutos pra baixar dependências.

**Quando ele pedir confirmação** ("use TypeScript? Yes/No"): geralmente ele já responde certo. Se perguntar a você, responde `y` pra todas as perguntas exceto "import alias" (aceita o default `@/*`).

---

## Bloco 1.2 — Configurar Supabase Client (30 min)

**Antes de colar:** pega as credenciais do seu Supabase **gc-dev**:

1. Supabase → projeto `gc-dev` → Settings → API
2. Copia `Project URL` e `anon public` key
3. Cola no `.env.local` (cria o arquivo se não existir):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

**Depois cola no Claude Code:**

```
Configure o cliente Supabase para o projeto Next.js seguindo as melhores práticas do @supabase/ssr:

1. Instale os pacotes: @supabase/supabase-js e @supabase/ssr
2. Crie src/lib/supabase/server.ts com createServerClient pra usar em Server Components e Route Handlers
3. Crie src/lib/supabase/client.ts com createBrowserClient pra usar em Client Components
4. Crie src/middleware.ts que refresca a sessão automaticamente (usando @supabase/ssr pattern)
5. Crie src/lib/supabase/types.ts com um placeholder vazio pros types do banco (vou gerar depois com supabase CLI)

Siga o padrão oficial: https://supabase.com/docs/guides/auth/server-side/nextjs

Garanta que TypeScript está strict. Se der erro de build, me avise.
```

---

## Bloco 1.3 — Tela de login (1h30)

**Cola no Claude Code:**

```
Crie a tela de login do sistema:

1. Rota: /login (arquivo src/app/login/page.tsx)
2. Design: centralizada, card branco com sombra sutil, logo placeholder no topo, título "Gestão de Contratos"
3. Campos:
   - Email (required, type=email)
   - Senha (required, mínimo 8 chars)
4. Botão "Entrar" (primário, loading state quando enviando)
5. Link "Esqueci minha senha" embaixo (por ora, pode levar pra /login?reset=true, sem lógica ainda)
6. Validação com react-hook-form + zod
7. Submit: usa supabase.auth.signInWithPassword()
8. Erro de login: mostra abaixo do botão em vermelho, não faz redirect
9. Sucesso: redirect pra /

Também:
- Crie o middleware que protege todas as rotas EXCETO /login, redirecionando pra /login se não autenticado
- Quando logado, /login deve redirecionar pra /

Depois que funcionar, me avise. Vou testar com minhas credenciais do gc-dev.

Use react-hook-form e zod — instale se não tiver. Tailwind pro estilo.
```

**Como testar depois:**
- Roda `npm run dev`
- Abre `http://localhost:3000`
- Deve redirecionar pra `/login`
- Usa o email e senha que você criou no Bloco 4 da Semana 0 (ambiente gc-dev)
- Se logar com sucesso, redireciona pra `/` (que vai dar 404 agora, normal)

---

## Bloco 1.4 — Layout base (1h30)

**Cola no Claude Code:**

```
Crie o layout autenticado do sistema:

1. src/app/(app)/layout.tsx — Server Component que:
   - Busca o profile do usuário logado (nome, email, perfil, empresa_id)
   - Se não houver profile, mostra mensagem "Seu perfil não foi configurado. Fale com o admin."
   - Renderiza o layout com sidebar + header + area de conteúdo (children)

2. Sidebar (src/components/Sidebar.tsx, Client Component):
   - Logo no topo
   - Menu com itens condicionais por perfil:
     - Dashboard (/)
     - Orçamentos (/orcamentos) — visível pra admin, comercial, visualizador
     - Obras (/obras) — todos
     - Propostas (/propostas) — admin, comercial, visualizador
     - Contratos (/contratos) — admin, comercial, visualizador
     - Execução (/execucao) — admin, producao, medicao, visualizador
     - Financeiro (/financeiro) — admin, financeiro, visualizador
     - Faturamento Direto (/fd) — admin, financeiro, visualizador
   - Cada item com ícone de lucide-react, destaque quando ativo (usa usePathname)
   - Rodapé com "Configurações" pra admin

3. Header (src/components/Header.tsx):
   - Título da página atual (recebe prop)
   - Dropdown do usuário no canto direito (nome + perfil, botão sair)
   - Botão "sair" chama supabase.auth.signOut() e redirect pra /login

4. Crie rotas vazias (placeholder com "Em construção") pra cada item do menu acima, dentro do grupo (app).

5. Estilo geral:
   - Sidebar: fundo branco, borda direita cinza, 240px largura
   - Header: branco, sombra sutil em baixo
   - Area conteúdo: cinza bem claro de fundo (tipo #f8f9fa)
   - Fonte: Inter (next/font)

Reutilize as queries do Supabase. Instale lucide-react se precisar.
```

---

## Bloco 1.5 — Primeira tela real: lista de obras (2h)

**Cola no Claude Code:**

```
Implemente a tela de listagem de obras em /obras:

1. Server Component que busca da view `obras_com_valores` do Supabase:
   - Campos: id, codigo_obra, nome, cliente, cidade, status, valor_final_calculado, pct_*, created_at
   - Ordena por created_at desc
   - Filtro automático por empresa_id (RLS cuida)

2. Tabela responsiva com:
   - Colunas: Código, Nome, Cliente, Cidade, Status (badge colorido), Valor, Progresso (barra)
   - Linhas clicáveis (leva pra /obras/[id] — só placeholder por ora)
   - Paginação de 20 em 20 (usa search params ?page=1)
   - Busca por nome/código/cliente (campo de busca no topo)
   - Filtro por status (dropdown: todas / ativa / concluida / suspensa / cancelada)

3. Estado vazio: se não tem obras, mostra ilustração simples + texto "Nenhuma obra cadastrada ainda" + botão "Nova obra" (só admin e comercial veem).

4. Botão "Nova obra" no topo (só admin/comercial) — leva pra /obras/nova (placeholder).

5. Formatar valor com Intl.NumberFormat pt-BR BRL.

6. Status em cores:
   - ativa: verde
   - concluida: azul
   - suspensa: amarelo
   - cancelada: cinza

Boilerplate de tabela reutilizável em src/components/DataTable.tsx (vamos reusar em outras listagens).
```

---

## Bloco 1.6 (BÔNUS) — Deploy na Vercel (1h)

**Só faça depois que os 5 anteriores estiverem funcionando.**

```
Prepare o deploy na Vercel:

1. Crie um repositório privado no GitHub chamado "gc-sistema" e faça push
2. Conecte com Vercel, importe o repo
3. Configure as env vars no Vercel (use as do gc-prod agora!)
4. Faça deploy
5. Depois que der certo, configure domínio (pode ser subdomínio Vercel por enquanto)
6. Teste o login em produção com o admin do gc-prod
```

**Atenção:** nesse momento você vai conectar com o GitHub (que você pulou no Bloco 1 da Semana 0). Vai ter que criar a conta.

---

## Dicas pra usar Claude Code produtivamente

1. **Sempre deixa ele terminar um bloco antes de começar o próximo** — se acumular, confunde.

2. **Se ele perguntar algo**, responde rápido. Não deixa aberto.

3. **Se ele gerar algo errado**, diz especificamente o que tá errado: *"a tabela está com 3 colunas só, precisava ter 7 — as que eu listei no bloco"*. Não fica só reclamando.

4. **Antes de terminar cada bloco**, pede pra ele:
   - *"roda `npm run dev` e me confirma que não tem erros"*
   - *"me mostra um resumo do que foi criado"*

5. **Se travar** em algum erro complexo, volta aqui no chat que eu te ajudo a desempacar.

6. **Commita depois de cada bloco funcionar**: `git add . && git commit -m "[descrição]"`. Se algo quebrar depois, você volta fácil.
