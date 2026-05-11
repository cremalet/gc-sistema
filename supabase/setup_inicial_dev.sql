-- ============================================================
-- SETUP INICIAL DO gc-dev (pós-reset)
-- ============================================================
-- Pré-requisito: criar os 6 usuários abaixo no Supabase Studio
-- (Authentication → Users → Add user → email + senha):
--
--   1. leticiacremasco@gmail.com  (admin)
--   2. comercial@teste.com        (comercial)
--   3. financeiro@teste.com       (financeiro)
--   4. medicao@teste.com          (medicao)
--   5. producao@teste.com         (producao)
--   6. visualizador@teste.com     (visualizador)
--
-- Senha sugerida (dev only): teste123!
--
-- Depois cole este SQL no SQL Editor e rode.
-- ============================================================

-- 1. Empresa (você edita os dados pela tela /configuracoes depois)
insert into empresas (nome, razao_social)
values ('Empresa Teste', 'Empresa Teste LTDA')
on conflict do nothing;

-- 2. Profiles vinculados aos auth.users criados acima
insert into profiles (id, empresa_id, nome, email, perfil, ativo)
select
  u.id,
  (select id from empresas limit 1),
  p.nome,
  p.email,
  p.perfil,
  true
from auth.users u
join (values
  ('leticiacremasco@gmail.com', 'Leticia Cremasco',    'admin'),
  ('comercial@teste.com',       'Comercial Teste',     'comercial'),
  ('financeiro@teste.com',      'Financeiro Teste',    'financeiro'),
  ('medicao@teste.com',         'Medição Teste',       'medicao'),
  ('producao@teste.com',        'Produção Teste',      'producao'),
  ('visualizador@teste.com',    'Visualizador Teste',  'visualizador')
) as p(email, nome, perfil) on p.email = u.email
on conflict (id) do nothing;

-- ============================================================
-- Verificação rápida (descomenta e roda separado)
-- ============================================================
-- select email, perfil from profiles order by perfil;
-- Deve retornar 6 linhas.
