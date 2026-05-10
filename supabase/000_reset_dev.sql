-- ============================================================
-- RESET DO BANCO (APENAS PARA DESENVOLVIMENTO)
-- Versão: 000_reset_dev
-- ============================================================
--
-- ⚠️  NUNCA RODE ESTE SCRIPT NO PROJETO DE PRODUÇÃO (gc-prod)!
-- ⚠️  Ele APAGA TODOS OS DADOS e remove todas as estruturas.
--
-- QUANDO USAR:
-- - Apenas no projeto gc-dev
-- - Quando quiser recomeçar o schema do zero
-- - Depois de alterar o 001_initial.sql e querer reaplicar tudo
--
-- USO:
-- 1. Rode este arquivo no SQL Editor do Supabase gc-dev
-- 2. Depois rode, em ordem: 001_initial.sql → 002_rls_policies.sql → 003_storage_buckets.sql
-- 3. Recrie seu usuário admin seguindo o guia da Semana 0
--
-- Se você alterou o schema e quer aplicar em PRODUÇÃO:
-- NÃO use este arquivo. Em vez disso, crie uma migração incremental
-- (004_alter_*.sql, 005_add_*.sql, etc) que faça apenas o delta necessário.
-- ============================================================

-- ============================================================
-- 1. REMOVER TABELAS (CASCADE apaga triggers, índices e FKs juntos)
-- ============================================================

drop table if exists fd cascade;
drop table if exists acordo_parcelas cascade;
drop table if exists acordos_pagamento cascade;
drop table if exists pagamentos cascade;
drop table if exists notas_fiscais cascade;
drop table if exists execucao cascade;
drop table if exists itens cascade;
drop table if exists contratos cascade;
drop table if exists propostas cascade;
drop table if exists obras cascade;
drop table if exists orcamentos cascade;
drop table if exists profiles cascade;
drop table if exists empresas cascade;

-- ============================================================
-- 2. REMOVER VIEWS (caso tenham sido criadas fora das tabelas acima)
-- ============================================================

drop view if exists obras_com_valores cascade;
drop view if exists itens_com_status cascade;
drop view if exists receitas_obra cascade;
drop view if exists obras_financeiro cascade;
drop view if exists contratos_financeiro cascade;
drop view if exists propostas_financeiro cascade;

-- ============================================================
-- 3. REMOVER FUNÇÕES
-- ============================================================

drop function if exists update_updated_at() cascade;
drop function if exists atualizar_status_parcela() cascade;
drop function if exists atualizar_status_parcela_by_id(uuid) cascade;
drop function if exists atualizar_status_nf_by_id(uuid) cascade;
drop function if exists atualizar_status_nf_on_update() cascade;
drop function if exists atualizar_status_parcela_on_update() cascade;
drop function if exists atualizar_status_acordo() cascade;
drop function if exists atualizar_parcelas_atrasadas() cascade;
drop function if exists calcular_valores_obra(uuid) cascade;
drop function if exists current_empresa_id() cascade;
drop function if exists current_perfil() cascade;
drop function if exists has_perfil(text[]) cascade;
drop function if exists execucao_set_quantidade_total() cascade;
drop function if exists itens_sincroniza_execucao_qtd() cascade;
drop function if exists execucao_preenche_datas() cascade;

-- ============================================================
-- 4. REMOVER BUCKETS DE STORAGE E SUAS POLICIES
-- ============================================================
-- ⚠️  Isso apaga TODOS os arquivos dos buckets também!

-- Policies dos buckets (Storage tem policies separadas das tabelas)
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname in (
        'Anexos: ver só da própria empresa',
        'Anexos: upload na própria empresa',
        'Anexos: atualizar próprios',
        'Anexos: admin/dono exclui',
        'Evidências: ver só da própria empresa',
        'Evidências: upload produção/medição/financeiro',
        'Evidências: atualizar próprias',
        'Evidências: admin/dono exclui',
        'NFs: ver só da própria empresa',
        'NFs: financeiro faz upload',
        'NFs: financeiro atualiza',
        'NFs: admin exclui',
        'Documentos: ver só da própria empresa',
        'Documentos: comercial/admin fazem upload',
        'Documentos: comercial atualiza',
        'Documentos: admin exclui'
      )
  loop
    execute format('drop policy if exists %I on storage.objects', pol.policyname);
  end loop;
end $$;

-- Função helper de storage
drop function if exists storage_empresa_id_from_path(text) cascade;

-- ============================================================
-- ATENÇÃO: limpar buckets/arquivos manualmente no Dashboard
-- ============================================================
-- Supabase mais novo BLOQUEIA delete direto em storage.objects e storage.buckets
-- via SQL. Pra limpar, faça pelo Dashboard:
--   1. Storage → para CADA bucket (anexos, evidencias, notas-fiscais, documentos):
--      a. Clica no bucket
--      b. Seleciona todos arquivos (Ctrl+A)
--      c. Delete
--      d. Volta, clica nos 3 pontinhos do bucket → Delete bucket
--   2. Depois, rode o 003_storage_buckets.sql pra recriar tudo
--
-- Alternativa: deixe os buckets vazios como estão. O 003_storage_buckets.sql
-- usa "on conflict do nothing" então não dará erro ao re-rodar.

-- ============================================================
-- 5. LIMPAR USUÁRIOS DE AUTH (opcional)
-- ============================================================
-- Descomente as linhas abaixo se quiser apagar todos os usuários
-- de autenticação também. Útil pra começar completamente do zero.
--
-- ⚠️  Isso desloga todo mundo e apaga as contas.
--
-- delete from auth.users;

-- ============================================================
-- RESET CONCLUÍDO
-- ============================================================
-- Próximos passos:
-- 1. Execute 001_initial.sql
-- 2. Execute 002_rls_policies.sql
-- 3. Execute 003_storage_buckets.sql
-- 4. Recrie seu usuário admin conforme guia da Semana 0 (Bloco 4)
-- ============================================================
