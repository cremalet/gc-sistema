export type Perfil =
  | 'admin'
  | 'comercial'
  | 'producao'
  | 'medicao'
  | 'financeiro'
  | 'visualizador'

export const PERFIL_LABELS: Record<Perfil, string> = {
  admin: 'Admin',
  comercial: 'Comercial',
  producao: 'Produção',
  medicao: 'Medição',
  financeiro: 'Financeiro',
  visualizador: 'Visualizador',
}
