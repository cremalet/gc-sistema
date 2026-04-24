// Placeholder dos tipos do banco. Gerar os tipos reais com:
//   npx supabase gen types typescript --project-id <project-id> --schema public > src/lib/supabase/types.ts
// Depois substituir tudo neste arquivo pelo conteúdo gerado.
//
// Por enquanto inclui só o que precisamos: profiles (auth/layout) e obras_com_valores (listagem).

import type { Perfil } from '../types'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ObraStatus = 'ativa' | 'concluida' | 'suspensa' | 'cancelada'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          empresa_id: string
          nome: string
          email: string
          perfil: Perfil
          ativo: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          empresa_id: string
          nome: string
          email: string
          perfil: Perfil
          ativo?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          empresa_id?: string
          nome?: string
          email?: string
          perfil?: Perfil
          ativo?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      obras_com_valores: {
        Row: {
          id: string
          empresa_id: string
          codigo_obra: string
          nome: string
          status: ObraStatus
          cliente: string | null
          cidade: string | null
          data_inicio: string | null
          data_prevista_fim: string | null
          data_real_fim: string | null
          valor_total_calculado: number | null
          desconto_calculado: number | null
          valor_final_calculado: number | null
          pct_sinal_calculado: number | null
          pct_fd_calculado: number | null
          pct_entrega_material_calculado: number | null
          pct_medicao_instalacao_calculado: number | null
          created_at: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ObraListItem = Database['public']['Views']['obras_com_valores']['Row']
