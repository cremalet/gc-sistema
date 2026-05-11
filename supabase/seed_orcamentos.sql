-- ============================================================
-- SEED: 28 clientes + 28 orçamentos de teste para o gc-dev
-- ============================================================
-- Roda no SQL Editor do Supabase Studio (projeto gc-dev) APÓS:
--   1. Aplicar a migration 004_revisao_schema.sql (criou tabela clientes)
--   2. Rodar setup_inicial_dev.sql (criou a empresa e perfis)
--
-- Marca todos com "[SEED-TESTE]" em observacao pra facilitar limpeza
-- (bloco no final do arquivo).
-- ============================================================

-- ============================================================
-- BLOCO 1: clientes (28)
-- ============================================================
insert into clientes (empresa_id, nome, contato, telefone, email, cidade, observacao)
select (select id from empresas limit 1), v.* from (values
  ('Construtora Alvorada LTDA',       'Marcelo Tavares',     '(85) 99812-3344', 'marcelo@alvorada.com.br',    'Fortaleza',  '[SEED-TESTE]'),
  ('Edifício Costa Sol',              'Patrícia Lima',       '(85) 98765-1122', 'sindico.costasol@gmail.com', 'Fortaleza',  '[SEED-TESTE]'),
  ('Hospital Vida Plena',             'Engª. Fernanda Cruz', '(85) 99100-2233', 'compras@vidaplena.com.br',   'Caucaia',    '[SEED-TESTE]'),
  ('Mercado Bom Preço',               'Sr. Antônio',         '(85) 99654-7788', null,                          'Maracanaú',  '[SEED-TESTE]'),
  ('Residencial Atlântico',           'Diego Andrade',       '(85) 98877-4455', 'diego@solconstr.com.br',     'Eusébio',    '[SEED-TESTE]'),
  ('Indústria Cearense de Alimentos', 'Engº. Roberto Pinto', '(85) 99221-3300', 'rpinto@icalimentos.com.br',  'Maracanaú',  '[SEED-TESTE]'),
  ('Colégio Aprender Mais',           'Coord. Juliana Reis', null,              'juliana@aprendermais.edu.br','Fortaleza',  '[SEED-TESTE]'),
  ('Restaurante Maré Alta',           'Carlos Mendes',       '(85) 99300-1144', 'carlosmendes@email.com',     'Aquiraz',    '[SEED-TESTE]'),
  ('Banco Regional Nordeste',         'Engª. Mariana Souto', '(85) 98800-2211', 'mariana.souto@bnordeste.com.br', 'Fortaleza','[SEED-TESTE]'),
  ('Cond. Empresarial Beira-Mar',     'Síndico João Vasco',  '(85) 99711-3322', 'joao.vasco@beirammar.com.br','Fortaleza',  '[SEED-TESTE]'),
  ('Auto Posto Verde',                'Roberto Mello',       '(85) 99544-8899', 'rmello@autopostoverde.com.br','Pacatuba',  '[SEED-TESTE]'),
  ('Clínica Saúde Total',             'Dr. Henrique Aragão', '(85) 98765-9911', 'contato@saudetotal.com.br',  'Fortaleza',  '[SEED-TESTE]'),
  ('Shopping Aldeia Mall',            'Engº. Paulo Vasconcelos','(85) 99100-7766','paulo.v@aldeiamall.com.br','Fortaleza',  '[SEED-TESTE]'),
  ('Construtora Horizonte',           'Engª. Camila Brito',  '(85) 99877-2244', 'camila.brito@horizonte.eng.br','Caucaia',  '[SEED-TESTE]'),
  ('Indústria Têxtil Cearense',       'Engº. Marcos Alencar','(85) 99221-1188', 'marcos@texcear.com.br',      'Maracanaú',  '[SEED-TESTE]'),
  ('Faculdade Norte Brasileira',      'Pró-reitor adm.',     null,              'compras@fnb.edu.br',         'Fortaleza',  '[SEED-TESTE]'),
  ('Cond. Residencial Solar',         'Síndico Eduardo Cavalcante','(85) 99300-7766','sindico.solar@gmail.com','Fortaleza','[SEED-TESTE]'),
  ('Hotel Brisa do Mar',              'Gerente Renata Lima', '(85) 98800-6655', 'rlima@brisadomar.com.br',    'Aquiraz',    '[SEED-TESTE]'),
  ('Igreja Matriz Centro',            'Pe. Francisco Lima',  '(85) 99654-2211', null,                          'Sobral',     '[SEED-TESTE]'),
  ('Posto Modelo Sul',                'Sr. Lúcio Andrade',   '(85) 99100-5544', 'lucio@postomodelo.com.br',   'Eusébio',    '[SEED-TESTE]'),
  ('Padaria Pão Quentinho',           'Sra. Helena Souza',   '(85) 99877-3322', null,                          'Fortaleza',  '[SEED-TESTE]'),
  ('Construtora Aurora',              'Engª. Beatriz Sales', '(85) 98765-4455', 'bia@aurora.eng.br',          'Maracanaú',  '[SEED-TESTE]'),
  ('Mercadinho do Zé',                'Sr. José Maria',      '(85) 99300-2200', null,                          'Caucaia',    '[SEED-TESTE]'),
  ('Loja Móveis Lar Doce',            'Carla Andrade',       '(85) 99544-1100', 'carla@lardoce.com.br',       'Fortaleza',  '[SEED-TESTE]'),
  ('Distribuidora Centro-Norte',      'Engº. Felipe Cardoso','(85) 98800-9988', 'fcardoso@dcn.com.br',        'Maracanaú',  '[SEED-TESTE]'),
  ('Cond. Empresarial Iracema',       'Síndico Ricardo Veloso','(85) 99221-7788','ricardo@iracema.com.br',   'Fortaleza',  '[SEED-TESTE]'),
  ('Restaurante Sabor do Mar',        'Sr. Anderson Pinto',  '(85) 99100-8855', 'anderson@sabordomar.com.br', 'Aquiraz',    '[SEED-TESTE]'),
  ('Auto Center Veloso',              'Sr. Pedro Veloso',    '(85) 99877-4400', null,                          'Pacatuba',   '[SEED-TESTE]')
) as v(nome, contato, telefone, email, cidade, observacao);

-- ============================================================
-- BLOCO 2: orçamentos (28) — vinculados aos clientes via JOIN por nome
-- ============================================================
insert into orcamentos (
  empresa_id, numero, data_solicitacao, cliente_id,
  descricao, escopo_resumo, valor_estimado, prazo_estimado,
  status, data_envio, data_decisao,
  motivo_rejeicao, detalhe_rejeicao,
  responsavel, observacao
)
select
  c.empresa_id,
  v.numero,
  v.data_solicitacao::date,
  c.id,
  v.descricao, v.escopo_resumo, v.valor_estimado, v.prazo_estimado,
  v.status,
  v.data_envio::date,
  v.data_decisao::date,
  v.motivo_rejeicao, v.detalhe_rejeicao,
  v.responsavel, v.observacao
from (values
  -- ----- PENDENTES (8) -----
  ('ORC-2026-001', '2026-05-08', 'Construtora Alvorada LTDA',
   'Cobertura metálica para galpão industrial 800m²', 'Estrutura em aço carbono, telha termoacústica', 185000.00, '45 dias',
   'pendente', null, null, null, null, 'João Souza', '[SEED-TESTE] pendente recente'),
  ('ORC-2026-002', '2026-05-05', 'Edifício Costa Sol',
   'Fachada ACM substituição completa', 'Remoção fachada antiga + nova fachada em ACM PE 4mm', 320000.00, '60 dias',
   'pendente', null, null, null, null, 'João Souza', '[SEED-TESTE]'),
  ('ORC-2026-003', '2026-05-02', 'Hospital Vida Plena',
   'Pergolado em aço para área de espera externa', null, 42000.00, '20 dias',
   'pendente', null, null, null, null, 'Ana Beatriz', '[SEED-TESTE]'),
  (null, '2026-04-28', 'Mercado Bom Preço',
   'Estrutura para letreiro frontal', null, 8500.00, '10 dias',
   'pendente', null, null, null, null, 'João Souza', '[SEED-TESTE] sem número'),
  ('ORC-2026-005', '2026-04-22', 'Residencial Atlântico',
   'Guarda-corpo em vidro e aço inox para varandas', '32 unidades, instalação por conta', 67000.00, '30 dias',
   'pendente', null, null, null, null, 'Ana Beatriz', '[SEED-TESTE]'),
  ('ORC-2026-006', '2026-04-15', 'Indústria Cearense de Alimentos',
   'Mezanino metálico para estoque', null, 95000.00, '40 dias',
   'pendente', null, null, null, null, 'João Souza', '[SEED-TESTE]'),
  ('ORC-2026-007', '2026-04-10', 'Colégio Aprender Mais',
   'Coberta para quadra poliesportiva', 'Estrutura tubular, sem fechamento lateral', 215000.00, '50 dias',
   'pendente', null, null, null, null, 'Ana Beatriz', '[SEED-TESTE]'),
  (null, '2026-04-05', 'Restaurante Maré Alta',
   'Pergolado deck área externa', null, 28000.00, '15 dias',
   'pendente', null, null, null, null, 'João Souza', '[SEED-TESTE]'),

  -- ----- EM ANÁLISE (4) -----
  ('ORC-2026-009', '2026-04-02', 'Banco Regional Nordeste',
   'Reformulação fachada agência centro', 'ACM + iluminação + comunicação visual', 410000.00, '75 dias',
   'analise', null, null, null, null, 'Ana Beatriz', '[SEED-TESTE] em análise'),
  ('ORC-2026-010', '2026-03-28', 'Cond. Empresarial Beira-Mar',
   'Cobertura em policarbonato para garagem visitantes', null, 78000.00, '35 dias',
   'analise', null, null, null, null, 'João Souza', '[SEED-TESTE]'),
  ('ORC-2026-011', '2026-03-20', 'Auto Posto Verde',
   'Estrutura para nova bomba de combustível', null, 56000.00, '25 dias',
   'analise', null, null, null, null, 'João Souza', '[SEED-TESTE]'),
  ('ORC-2026-012', '2026-03-12', 'Clínica Saúde Total',
   'Fachada ACM unidade Aldeota', 'Substituir fachada existente, ACM PE 4mm grafite', 245000.00, '55 dias',
   'analise', null, null, null, null, 'Ana Beatriz', '[SEED-TESTE]'),

  -- ----- ENVIADOS (4) -----
  ('ORC-2026-013', '2026-03-05', 'Shopping Aldeia Mall',
   'Manutenção e troca de placas ACM danificadas', '15 placas, com remoção e descarte', 38000.00, '20 dias',
   'enviado', '2026-04-25', null, null, null, 'João Souza', '[SEED-TESTE] enviado, aguardando resposta'),
  ('ORC-2026-014', '2026-02-28', 'Construtora Horizonte',
   'Estrutura metálica para sobreloja comercial', null, 178000.00, '45 dias',
   'enviado', '2026-04-12', null, null, null, 'Ana Beatriz', '[SEED-TESTE]'),
  ('ORC-2026-015', '2026-02-15', 'Indústria Têxtil Cearense',
   'Galpão completo 1.500m²', 'Estrutura + cobertura + fechamento lateral', 680000.00, '90 dias',
   'enviado', '2026-03-30', null, null, null, 'João Souza', '[SEED-TESTE] enviado grande'),
  ('ORC-2026-016', '2026-02-08', 'Faculdade Norte Brasileira',
   'Pergolado de convivência campus', null, 92000.00, '40 dias',
   'enviado', '2026-03-20', null, null, null, 'Ana Beatriz', '[SEED-TESTE]'),

  -- ----- APROVADOS (5) -----
  ('ORC-2026-017', '2026-02-01', 'Cond. Residencial Solar',
   'Guarda-corpo varandas torres A e B', null, 124000.00, '50 dias',
   'aprovado', '2026-02-20', '2026-03-15', null, null, 'João Souza', '[SEED-TESTE] aprovado'),
  ('ORC-2026-018', '2026-01-22', 'Hotel Brisa do Mar',
   'Estrutura para deck piscina', null, 88000.00, '35 dias',
   'aprovado', '2026-02-10', '2026-03-01', null, null, 'Ana Beatriz', '[SEED-TESTE]'),
  ('ORC-2026-019', '2026-01-15', 'Igreja Matriz Centro',
   'Cobertura em treliça para pátio', null, 156000.00, '60 dias',
   'aprovado', '2026-02-01', '2026-02-25', null, null, 'João Souza', '[SEED-TESTE]'),
  ('ORC-2026-020', '2026-01-10', 'Posto Modelo Sul',
   'Troca de cobertura completa', null, 195000.00, '50 dias',
   'aprovado', '2026-01-28', '2026-02-18', null, null, 'Ana Beatriz', '[SEED-TESTE]'),
  (null, '2026-01-05', 'Padaria Pão Quentinho',
   'Toldo metálico para fachada', null, 12500.00, '10 dias',
   'aprovado', '2026-01-18', '2026-01-30', null, null, 'João Souza', '[SEED-TESTE] aprovado pequeno'),

  -- ----- REJEITADOS (5) com motivos variados -----
  ('ORC-2026-022', '2025-12-28', 'Construtora Aurora',
   'Galpão pré-moldado 600m²', null, 420000.00, '70 dias',
   'rejeitado', '2026-01-15', '2026-02-10', 'preco_alto', 'Cliente conseguiu proposta 30% mais barata com concorrente.',
   'João Souza', '[SEED-TESTE] rejeitado por preço'),
  ('ORC-2026-023', '2025-12-15', 'Mercadinho do Zé',
   'Letreiro grande frontal', null, 18000.00, '15 dias',
   'rejeitado', '2026-01-05', '2026-01-22', 'cliente_desistiu', null,
   'Ana Beatriz', '[SEED-TESTE] cliente desistiu da reforma'),
  ('ORC-2026-024', '2025-12-05', 'Loja Móveis Lar Doce',
   'Estrutura para mezanino interno', null, 45000.00, '25 dias',
   'rejeitado', null, '2025-12-20', 'sem_resposta', null,
   'João Souza', '[SEED-TESTE] cliente nunca respondeu o envio'),
  ('ORC-2026-025', '2025-11-28', 'Distribuidora Centro-Norte',
   'Cobertura para pátio de carga', null, 285000.00, '60 dias',
   'rejeitado', '2025-12-15', '2026-01-08', 'perdeu_concorrente', 'Concorrente "Aço Forte" venceu a concorrência.',
   'Ana Beatriz', '[SEED-TESTE]'),
  ('ORC-2026-026', '2025-11-15', 'Cond. Empresarial Iracema',
   'Substituição fachada cega lateral', null, 165000.00, '50 dias',
   'rejeitado', '2025-12-02', '2025-12-28', 'outro', 'Síndico decidiu adiar a reforma para 2027 por questões orçamentárias.',
   'João Souza', '[SEED-TESTE] motivo outro com detalhe'),

  -- ----- EXPIRADOS (2) -----
  ('ORC-2026-027', '2025-11-08', 'Restaurante Sabor do Mar',
   'Pergolado e fechamento área externa', null, 72000.00, '30 dias',
   'expirado', '2025-11-25', null, null, null, 'Ana Beatriz', '[SEED-TESTE] enviado mas validade venceu'),
  ('ORC-2026-028', '2025-11-01', 'Auto Center Veloso',
   'Cobertura para área de lavagem', null, 38000.00, '20 dias',
   'expirado', '2025-11-20', null, null, null, 'João Souza', '[SEED-TESTE]')
) as v(
  numero, data_solicitacao, cliente_nome,
  descricao, escopo_resumo, valor_estimado, prazo_estimado,
  status, data_envio, data_decisao,
  motivo_rejeicao, detalhe_rejeicao,
  responsavel, observacao
)
join clientes c on c.nome = v.cliente_nome
where c.empresa_id = (select id from empresas limit 1);

-- ============================================================
-- CLEANUP — descomenta e roda quando quiser apagar os seeds:
-- ============================================================
-- delete from orcamentos where observacao like '[SEED-TESTE]%';
-- delete from clientes where observacao = '[SEED-TESTE]';
