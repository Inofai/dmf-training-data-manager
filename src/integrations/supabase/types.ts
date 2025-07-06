export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      api_key: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          key_value: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          key_value: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          key_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      training_data: {
        Row: {
          answer: string
          change_reason: string | null
          changed_at: string | null
          changed_by: string | null
          created_at: string | null
          id: string
          is_current: boolean
          parent_id: string | null
          question: string
          training_document_id: string
          version: number
        }
        Insert: {
          answer: string
          change_reason?: string | null
          changed_at?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          is_current?: boolean
          parent_id?: string | null
          question: string
          training_document_id: string
          version?: number
        }
        Update: {
          answer?: string
          change_reason?: string | null
          changed_at?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          is_current?: boolean
          parent_id?: string | null
          question?: string
          training_document_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_training_data_parent"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "training_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_data_training_document_id_fkey"
            columns: ["training_document_id"]
            isOneToOne: false
            referencedRelation: "training_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      training_data_history: {
        Row: {
          answer: string
          change_reason: string | null
          changed_at: string
          changed_by: string | null
          created_at: string
          id: string
          question: string
          training_data_id: string
          version: number
        }
        Insert: {
          answer: string
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          question: string
          training_data_id: string
          version: number
        }
        Update: {
          answer?: string
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          question?: string
          training_data_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_history_training_data"
            columns: ["training_data_id"]
            isOneToOne: false
            referencedRelation: "training_data"
            referencedColumns: ["id"]
          },
        ]
      }
      training_documents: {
        Row: {
          created_at: string | null
          id: string
          original_content: string
          processed_content: Json | null
          source_links: string[] | null
          status: string
          submitter_email: string | null
          submitter_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          original_content: string
          processed_content?: Json | null
          source_links?: string[] | null
          status?: string
          submitter_email?: string | null
          submitter_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          original_content?: string
          processed_content?: Json | null
          source_links?: string[] | null
          status?: string
          submitter_email?: string | null
          submitter_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user_and_data: {
        Args: { user_id_to_delete: string }
        Returns: boolean
      }
      get_api_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_qa_history: {
        Args: { qa_id: string }
        Returns: {
          version: number
          question: string
          answer: string
          change_reason: string
          changed_by: string
          changed_at: string
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin_user: {
        Args: { check_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
