// Tipos do banco de dados Supabase/Postgres.
//
// Este arquivo é escrito manualmente para refletir as migrations em
// `supabase/migrations/`, seguindo o mesmo formato produzido por
// `supabase gen types typescript`. Depois que o projeto Supabase estiver
// criado e vinculado, prefira regenerá-lo automaticamente com:
//
//   npx supabase gen types typescript --project-id <ID_DO_PROJETO> > src/lib/types/database.types.ts
//
// para manter os tipos sempre em sincronia com o schema real do banco.

export type StatusAgendamento = "pendente" | "cancelado" | "realizado" | "adiado";
export type PapelUsuario = "admin" | "usuario";
export type StatusConta = "pendente" | "aprovado" | "rejeitado";

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: string;
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nome: string;
          email: string;
          role: PapelUsuario;
          status_conta: StatusConta;
          created_at: string;
        };
        Insert: {
          id: string;
          nome: string;
          email: string;
          role?: PapelUsuario;
          status_conta?: StatusConta;
          created_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          email?: string;
          role?: PapelUsuario;
          status_conta?: StatusConta;
          created_at?: string;
        };
        Relationships: [];
      };
      agendamentos: {
        Row: {
          id: string;
          numero_os: string;
          tipo_servico: string;
          cliente_nome: string;
          cliente_contato: string;
          data_agendamento: string;
          status: StatusAgendamento;
          observacoes: string | null;
          motivo_adiamento: string | null;
          rescheduled_from_id: string | null;
          original_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          numero_os: string;
          tipo_servico: string;
          cliente_nome: string;
          cliente_contato: string;
          data_agendamento: string;
          status?: StatusAgendamento;
          observacoes?: string | null;
          motivo_adiamento?: string | null;
          rescheduled_from_id?: string | null;
          original_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          numero_os?: string;
          tipo_servico?: string;
          cliente_nome?: string;
          cliente_contato?: string;
          data_agendamento?: string;
          status?: StatusAgendamento;
          observacoes?: string | null;
          motivo_adiamento?: string | null;
          rescheduled_from_id?: string | null;
          original_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notificacoes_enviadas: {
        Row: {
          id: string;
          agendamento_id: string;
          tipo: string;
          enviado_em: string;
        };
        Insert: {
          id?: string;
          agendamento_id: string;
          tipo: string;
          enviado_em?: string;
        };
        Update: {
          id?: string;
          agendamento_id?: string;
          tipo?: string;
          enviado_em?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      adiar_agendamento: {
        Args: {
          p_id: string;
          p_nova_data: string;
          p_motivo?: string | null;
          p_created_by?: string | null;
        };
        Returns: Database["public"]["Tables"]["agendamentos"]["Row"];
      };
    };
    Enums: {
      status_agendamento: StatusAgendamento;
      papel_usuario: PapelUsuario;
      status_conta: StatusConta;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Agendamento = Database["public"]["Tables"]["agendamentos"]["Row"];
export type AgendamentoInsert = Database["public"]["Tables"]["agendamentos"]["Insert"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
